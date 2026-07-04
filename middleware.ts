import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get("authorization");

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return new NextResponse("Admin prístup nie je nakonfigurovaný.", {
      status: 500,
    });
  }

  if (basicAuth) {
    const [scheme, encoded] = basicAuth.split(" ");

    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [username, password] = decoded.split(":");

      if (username === adminUsername && password === adminPassword) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Prístup zamietnutý.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Svida Admin"',
    },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};