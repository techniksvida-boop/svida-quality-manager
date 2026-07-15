import { createHash } from "node:crypto";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TurnstileResponse = {
  success: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

function jsonError(
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    }
  );
}

function getClientIp(request: NextRequest) {
  const forwardedFor =
    request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor
      .split(",")[0]
      ?.trim();
  }

  return (
    request.headers.get("x-real-ip") ||
    undefined
  );
}

async function verifyTurnstile(
  request: NextRequest,
  token: string
) {
  const secretKey =
    process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error(
      "Chýba TURNSTILE_SECRET_KEY."
    );

    return false;
  }

  const formData = new FormData();

  formData.append("secret", secretKey);
  formData.append("response", token);

  const clientIp = getClientIp(request);

  if (clientIp) {
    formData.append("remoteip", clientIp);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Turnstile HTTP chyba:",
        response.status
      );

      return false;
    }

    const result =
      (await response.json()) as TurnstileResponse;

    if (!result.success) {
      console.error(
        "Turnstile overenie zlyhalo:",
        result["error-codes"]
      );

      return false;
    }

    if (
      result.action &&
      result.action !== "voting_login"
    ) {
      console.error(
        "Nesprávna Turnstile action:",
        result.action
      );

      return false;
    }

    const allowedHostnames = new Set([
      "svida-quality-manager.vercel.app",
      "localhost",
      "127.0.0.1",
    ]);

    if (
      result.hostname &&
      !allowedHostnames.has(result.hostname)
    ) {
      console.error(
        "Nepovolený Turnstile hostname:",
        result.hostname
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Turnstile overenie zlyhalo:",
      error
    );

    return false;
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const normalizedCode =
      typeof body.code === "string"
        ? body.code
            .trim()
            .toUpperCase()
        : "";

    const sessionToken =
      typeof body.sessionToken === "string"
        ? body.sessionToken
        : "";

    const turnstileToken =
      typeof body.turnstileToken === "string"
        ? body.turnstileToken
        : "";

    if (
      normalizedCode.length !== 4 ||
      !sessionToken
    ) {
      return jsonError(
        "Chýba platný hlasovací kód alebo relácia.",
        400
      );
    }

    if (!turnstileToken) {
      return jsonError(
        "Chýba bezpečnostné overenie.",
        400
      );
    }

    const turnstileValid =
      await verifyTurnstile(
        request,
        turnstileToken
      );

    if (!turnstileValid) {
      return jsonError(
        "Bezpečnostné overenie nebolo úspešné. Skúste ho zopakovať.",
        403
      );
    }

    /*
     * Kód overujeme až na serveri.
     * Prehliadač už nemusí čítať tabuľku voting_codes.
     */
    const {
      data: votingCode,
      error: votingCodeError,
    } = await supabaseAdmin
      .from("voting_codes")
      .select(
        "id, code, employee_id, is_active"
      )
      .eq("code", normalizedCode)
      .eq("is_active", true)
      .single();

    if (
      votingCodeError ||
      !votingCode ||
      !votingCode.employee_id
    ) {
      return jsonError(
        "Zadaný kód nie je platný.",
        401
      );
    }

    const sessionTokenHash =
      hashSessionToken(sessionToken);

    /*
     * Reláciu vytvoríme až po úspešnom Turnstile
     * a overení hlasovacieho kódu.
     */
    const {
      data: sessionAllowed,
      error: sessionError,
    } = await supabaseAdmin.rpc(
      "start_voting_session",
      {
        p_voting_code_id:
          votingCode.id,
        p_session_token_hash:
          sessionTokenHash,
      }
    );

    if (sessionError) {
      console.error(
        "Vytvorenie relácie zlyhalo:",
        sessionError
      );

      return jsonError(
        "Hlasovaciu reláciu sa nepodarilo vytvoriť.",
        500
      );
    }

    if (sessionAllowed !== true) {
      return jsonError(
        "Tento hodnotiaci kód je momentálne používaný na inom zariadení. Najprv ukončite pôvodnú reláciu alebo počkajte 30 minút od poslednej aktivity.",
        409
      );
    }

    const response =
      NextResponse.json({
        success: true,
        votingCodeId: votingCode.id,
        votingCode: votingCode.code,
        employeeId:
          votingCode.employee_id,
      });

    const cookieOptions = {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 30 * 60,
    };

    response.cookies.set(
      "voting_code_id",
      votingCode.id,
      cookieOptions
    );

    response.cookies.set(
      "voting_session_token",
      sessionToken,
      cookieOptions
    );

    response.cookies.set(
      "voting_employee_id",
      votingCode.employee_id,
      cookieOptions
    );

    return response;
  } catch (error) {
    console.error(
      "Serverové prihlásenie zlyhalo:",
      error
    );

    return jsonError(
      "Prihlásenie sa nepodarilo dokončiť.",
      500
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  const votingCodeId =
    request.cookies.get(
      "voting_code_id"
    )?.value || "";

  const sessionToken =
    request.cookies.get(
      "voting_session_token"
    )?.value || "";

  if (votingCodeId && sessionToken) {
    const sessionTokenHash =
      hashSessionToken(sessionToken);

    const { error: deleteError } =
      await supabaseAdmin
        .from("voting_code_sessions")
        .delete()
        .eq(
          "voting_code_id",
          votingCodeId
        )
        .eq(
          "session_token_hash",
          sessionTokenHash
        );

    if (deleteError) {
      console.error(
        "Odstránenie hlasovacej relácie zlyhalo:",
        deleteError
      );
    }
  }

  const response =
    NextResponse.json({
      success: true,
    });

  const expiredCookieOptions = {
    httpOnly: true,
    secure:
      process.env.NODE_ENV ===
      "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  response.cookies.set(
    "voting_code_id",
    "",
    expiredCookieOptions
  );

  response.cookies.set(
    "voting_session_token",
    "",
    expiredCookieOptions
  );

  response.cookies.set(
    "voting_employee_id",
    "",
    expiredCookieOptions
  );

  return response;
}