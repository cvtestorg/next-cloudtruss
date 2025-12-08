/**
 * An array of routes that are public and do not require authentication.
 */
export const PublicRoutes: string[] = ["/about", "/docs", "/auth/login"];

/**
 * An array of routes that are used for authentication.
 */
export const AuthLoginRoute: string = "/auth/login";

/**
 * The prefix for the API routes that are used for authentication.
 */
export const ApiAuthPrefix: string = "/api/auth";

/**
 * The default redirect route after loggin.
 */
export const DEFAULT_LOGIN_REDIRECT: string = "/";
