import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "seu-secret-super-secreto-aqui"
);

export interface User {
  username: string;
  name: string;
  email: string;
}

export class AuthService {
  /**
   * Gera um token JWT para o usuário
   */
  static async generateToken(user: User): Promise<string> {
    const token = await new SignJWT({
      username: user.username,
      name: user.name,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(SECRET);

    return token;
  }

  /**
   * Verifica e decodifica um token JWT
   */
  static async verifyToken(token: string): Promise<User | null> {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      return {
        username: payload.username as string,
        name: payload.name as string,
        email: payload.email as string,
      };
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  }

  /**
   * Obtém o usuário autenticado a partir dos cookies (para Server Components)
   * Uso: const user = await AuthService.getCurrentUser();
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;

      if (!token) {
        return null;
      }

      return this.verifyToken(token);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Obtém o usuário autenticado a partir de uma requisição (para Route Handlers)
   * Uso: const user = await AuthService.getUserFromRequest(request);
   */
  static async getUserFromRequest(request: NextRequest): Promise<User | null> {
    try {
      const token = request.cookies.get("auth-token")?.value;

      if (!token) {
        return null;
      }

      return this.verifyToken(token);
    } catch (error) {
      console.error("Error getting user from request:", error);
      return null;
    }
  }

  /**
   * Verifica se o usuário está autenticado (para usar em Server Components)
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Obtém o token do cookie (para Server Components)
   */
  static async getToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("auth-token")?.value;
      return token || null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  /**
   * Obtém o token de uma requisição (para Route Handlers)
   */
  static getTokenFromRequest(request: NextRequest): string | null {
    return request.cookies.get("auth-token")?.value || null;
  }
}

/**
 * Helper para proteger rotas de API
 * Uso em Route Handlers:
 * 
 * export async function GET(request: NextRequest) {
 *   const user = await requireAuth(request);
 *   if (!user) {
 *     return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
 *   }
 *   // ... rest of the code
 * }
 */
export async function requireAuth(request: NextRequest): Promise<User | null> {
  return AuthService.getUserFromRequest(request);
}

/**
 * Helper para obter usuário de uma requisição
 */
export async function getAuthUser(request: NextRequest): Promise<User | null> {
  return AuthService.getUserFromRequest(request);
}
