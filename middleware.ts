import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "seu-secret-super-secreto-aqui"
);

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ["/login", "/api"];

// Rotas que precisam de autenticação
const PROTECTED_ROUTES = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir todas as rotas de API (a autenticação será feita internamente se necessário)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Permitir acesso à rota de login
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Verificar se a rota precisa de autenticação
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = request.cookies.get("auth-token")?.value;

    console.log('[Middleware] Protected route:', pathname);
    console.log('[Middleware] Token exists:', !!token);

    // Se não tem token, redirecionar para login
    if (!token) {
      console.log('[Middleware] No token, redirecting to login');
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    try {
      // Verificar se o token é válido
      await jwtVerify(token, SECRET);
      console.log('[Middleware] Token valid, allowing access');
      return NextResponse.next();
    } catch (error) {
      console.error("[Middleware] Token verification failed:", error);
      // Token inválido, redirecionar para login
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(url);
      response.cookies.delete("auth-token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
