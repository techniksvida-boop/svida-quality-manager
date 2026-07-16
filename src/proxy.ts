import { NextRequest, NextResponse } from "next/server";

async function hashSessionToken(token: string) {
  const encodedToken = new TextEncoder().encode(token);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    encodedToken
  );

  return Array.from(new Uint8Array(hashBuffer))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function clearVotingCookies(response: NextResponse) {
  const cookieOptions = {
    path: "/",
    maxAge: 0,
  };

  response.cookies.set(
    "voting_code_id",
    "",
    cookieOptions
  );

  response.cookies.set(
    "voting_session_token",
    "",
    cookieOptions
  );

  response.cookies.set(
    "voting_employee_id",
    "",
    cookieOptions
  );

  return response;
}

function redirectToStart(request: NextRequest) {
  const startUrl = new URL("/start", request.url);

  const response = NextResponse.redirect(startUrl);

  return clearVotingCookies(response);
}

function protectAdmin(request: NextRequest) {
  const basicAuth =
    request.headers.get("authorization");

  const adminUsername =
    process.env.ADMIN_USERNAME;

  const adminPassword =
    process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return new NextResponse(
      "Admin prístup nie je nakonfigurovaný.",
      {
        status: 500,
      }
    );
  }

  if (basicAuth) {
    const [scheme, encoded] =
      basicAuth.split(" ");

    if (scheme === "Basic" && encoded) {
      try {
        const decoded = atob(encoded);

        const separatorIndex =
          decoded.indexOf(":");

        const username =
          separatorIndex >= 0
            ? decoded.slice(0, separatorIndex)
            : "";

        const password =
          separatorIndex >= 0
            ? decoded.slice(separatorIndex + 1)
            : "";

        if (
          username === adminUsername &&
          password === adminPassword
        ) {
          return NextResponse.next();
        }
      } catch {
        // Neplatná Basic Auth hlavička.
      }
    }
  }

  return new NextResponse(
    "Prístup zamietnutý.",
    {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Basic realm="Svida Admin"',
      },
    }
  );
}

async function protectVoting(
  request: NextRequest
) {
  const votingCodeId =
    request.cookies.get(
      "voting_code_id"
    )?.value;

  const sessionToken =
    request.cookies.get(
      "voting_session_token"
    )?.value;

  const votingEmployeeId =
    request.cookies.get(
      "voting_employee_id"
    )?.value;

  if (
    !votingCodeId ||
    !sessionToken ||
    !votingEmployeeId
  ) {
    return redirectToStart(request);
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return new NextResponse(
      "Hlasovací prístup nie je nakonfigurovaný.",
      {
        status: 500,
      }
    );
  }

  try {
    const sessionTokenHash =
      await hashSessionToken(sessionToken);

    const rpcResponse = await fetch(
      `${supabaseUrl}/rest/v1/rpc/refresh_voting_session`,
      {
        method: "POST",
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_voting_code_id:
            votingCodeId,
          p_session_token_hash:
            sessionTokenHash,
        }),
        cache: "no-store",
      }
    );

    if (!rpcResponse.ok) {
      return redirectToStart(request);
    }

    const sessionValid =
      await rpcResponse.json();

    if (sessionValid !== true) {
      return redirectToStart(request);
    }

    const response = NextResponse.next();

    /*
     * Pri každej platnej požiadavke obnovíme
     * aj platnosť HttpOnly cookies na 30 minút.
     */
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
      votingCodeId,
      cookieOptions
    );

    response.cookies.set(
      "voting_session_token",
      sessionToken,
      cookieOptions
    );

    response.cookies.set(
      "voting_employee_id",
      votingEmployeeId,
      cookieOptions
    );

    return response;
  } catch (error) {
    console.error(
      "Overenie hlasovacej relácie zlyhalo:",
      error
    );

    return redirectToStart(request);
  }
}

export async function proxy(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  ) {
    return protectAdmin(request);
  }

  if (
    pathname === "/hodnotenie" ||
    pathname.startsWith(
      "/hodnotenie/"
    ) ||
    pathname.startsWith("/employee/")
  ) {
    return protectVoting(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/hodnotenie",
    "/hodnotenie/:path*",
    "/employee/:path*",
  ],
};