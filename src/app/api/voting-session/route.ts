import { createHash } from "node:crypto";
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const normalizedCode =
      typeof body.code === "string"
        ? body.code.trim().toUpperCase()
        : "";

    const sessionToken =
      typeof body.sessionToken === "string"
        ? body.sessionToken
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

    const {
      data: sessionAllowed,
      error: sessionError,
    } = await supabaseAdmin.rpc(
      "start_voting_session",
      {
        p_voting_code_id: votingCode.id,
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
        "Tento hodnotiaci kód je momentálne používaný na inom zariadení. Použite tlačidlo Odhlásiť sa alebo počkajte 10 minút od poslednej aktivity.",
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
      maxAge: 10 * 60,
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

export async function PATCH(
  request: NextRequest
) {
  try {
    const votingCodeId =
      request.cookies.get("voting_code_id")?.value || "";

    const sessionToken =
      request.cookies.get("voting_session_token")?.value || "";

    if (!votingCodeId || !sessionToken) {
      return jsonError(
        "Hlasovacia relácia nie je platná.",
        401
      );
    }

    const sessionTokenHash =
      hashSessionToken(sessionToken);

    const {
      data: sessionValid,
      error: sessionError,
    } = await supabaseAdmin.rpc(
      "refresh_voting_session",
      {
        p_voting_code_id: votingCodeId,
        p_session_token_hash: sessionTokenHash,
      }
    );

    if (
      sessionError ||
      sessionValid !== true
    ) {
      return jsonError(
        "Hlasovacia relácia nie je platná.",
        401
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    const cookieOptions = {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 10 * 60,
    };

    response.cookies.set(
      "voting_code_id",
      votingCodeId,
      cookieOptions
    );

    response.cookies.set(
      "voting_session_token",
      sessionToken,
      cookieOptions
    );

    return response;
  } catch (error) {
    console.error(
      "Obnovenie hlasovacej relácie zlyhalo:",
      error
    );

    return jsonError(
      "Hlasovaciu reláciu sa nepodarilo obnoviť.",
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