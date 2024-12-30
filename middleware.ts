import { NextResponse } from "next/server";

export function middleware(request: Request) {
  const auth = request.headers.get("authorization");

  // Expected username and password
  const username = process.env.BASIC_AUTH_USERNAME || "admin";
  const password = process.env.BASIC_AUTH_PASSWORD || "password";

  // Validate the Authorization header
  if (!auth) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  const [authUsername, authPassword] = Buffer.from(
    auth.split(" ")[1],
    "base64"
  )
    .toString()
    .split(":");

  if (authUsername !== username || authPassword !== password) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  // Allow access if credentials are valid
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"], // Apply to all routes
};