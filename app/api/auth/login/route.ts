import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";

// Credenciais mockadas
const MOCK_USER = {
  username: "admin",
  password: "admin123",
  name: "Administrador",
  email: "admin@nola.com",
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validar credenciais
    if (username === MOCK_USER.username && password === MOCK_USER.password) {
      // Gerar JWT token usando o AuthService
      const token = await AuthService.generateToken({
        username: MOCK_USER.username,
        name: MOCK_USER.name,
        email: MOCK_USER.email,
      });

      // Criar resposta com cookie
      const response = NextResponse.json({
        success: true,
        user: {
          username: MOCK_USER.username,
          name: MOCK_USER.name,
          email: MOCK_USER.email,
        },
      });

      // Definir cookie com token diretamente na resposta
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: true, // Sempre true para funcionar em produção
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 horas
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Credenciais inválidas" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao fazer login" },
      { status: 500 }
    );
  }
}
