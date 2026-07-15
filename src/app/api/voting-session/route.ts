import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const votingCodeId =
      typeof body.votingCodeId === "string"
        ? body.votingCodeId
        : "";

    const sessionToken =
      typeof body.sessionToken === "string"
        ? body.sessionToken
        : "";

    if (!votingCodeId || !sessionToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Chýbajú údaje hlasovacej relácie.",
        },
        {
          status: 400,
        }
      );
    }

    const sessionTokenHash =
      hashSessionToken(sessionToken);

    const {
      data: sessionValid,
      error: sessionError,
    } = await supabaseServer.rpc(
      "refresh_voting_session",
      {
        p_voting_code_id: votingCodeId,
        p_session_token_hash:
          sessionTokenHash,
      }
    );

    if (
      sessionError ||
      sessionValid !== true
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hlasovacia relácia nie je platná.",
        },
        {
          status: 401,
        }
      );
    }

    const {
      data: votingCode,
      error: votingCodeError,
    } = await supabaseServer
      .from("voting_codes")
      .select("id, employee_id, is_active")
      .eq("id", votingCodeId)
      .eq("is_active", true)
      .single();

    if (
      votingCodeError ||
      !votingCode ||
      !votingCode.employee_id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hodnotiaci kód nie je platný.",
        },
        {
          status: 401,
        }
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
      "Chyba pri vytváraní hlasovacej cookie:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Hlasovaciu reláciu sa nepodarilo vytvoriť.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
  });

  response.cookies.set(
    "voting_code_id",
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
  );

  response.cookies.set(
    "voting_session_token",
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
  );

  response.cookies.set(
    "voting_employee_id",
    "",
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    }
  );

  return response;
}