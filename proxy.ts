import { auth } from "@/lib/auth";
import {
  AuthLoginRoute,
  DEFAULT_LOGIN_REDIRECT,
} from "@/config/routes";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isAuthRoute = [AuthLoginRoute, "/auth/register"].includes(nextUrl.pathname);
  const isPublicRoute = ["/", "/public"].includes(nextUrl.pathname); // Adjust based on your public routes

  // 1. Always allow API auth routes
  if (isApiAuthRoute) {
    return;
  }

  // 2. Handle Auth Routes (Login/Register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return;
  }

  // 3. Protect private routes
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`${AuthLoginRoute}?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }

  // 4. Handle token rotation error (force logout)
  // @ts-ignore
  if (req.auth?.error === "RefreshTokenError") {
      let callbackUrl = nextUrl.pathname;
      if (nextUrl.search) {
        callbackUrl += nextUrl.search;
      }
      const encodedCallbackUrl = encodeURIComponent(callbackUrl);
      
      // Redirect to login to re-authenticate
      const url = new URL(AuthLoginRoute, nextUrl);
      url.searchParams.set("callbackUrl", encodedCallbackUrl);
      return Response.redirect(url);
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
