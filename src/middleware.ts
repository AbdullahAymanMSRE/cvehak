import authConfig from "../auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protect dashboard and upload routes
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/upload")) &&
    !req.auth
  ) {
    return Response.redirect(new URL("/auth/signin", req.url));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*"],
};
