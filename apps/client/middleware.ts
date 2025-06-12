import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import api from "./lib/api";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth")?.value;

  const protectedPaths = ["/store", "/profile", "/create-store", "/register"];
  const host = req.headers.get("host") ?? "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const baseUrl = `${protocol}://${host}`;

  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL("/logout", baseUrl));
    }

    try {
      const { payload } = await jwtVerify(String(token), JWT_SECRET);
      const res = NextResponse.next();

      try {
        const response = await api.get(`/user/${payload.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          const userData = response.data;
          res.headers.set("x-user", JSON.stringify(userData));

          if (userData.type === "normal") {
            const pathParts = req.nextUrl.pathname.split("/").filter(Boolean);
            if (pathParts.length === 2 && pathParts[0] === "store") {
              return NextResponse.redirect(new URL(`${req.nextUrl.pathname}/analysis`, baseUrl));
            }
          }
        } else {
          throw new Error("No user data received");
        }
      } catch (error: any) {
        res.headers.set("x-user", JSON.stringify({
          id: payload.id,
          email: payload.email,
          name: payload.name,
          phone: payload.phone,
          type: payload.type
        }));
      }

      return res;
    } catch {
      return NextResponse.redirect(new URL("/logout", baseUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/store/:path*",
    "/profile/:path*",
    "/create-store",
    "/register/:path*",
  ],
};
