import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "seu-secret-super-secreto-aqui"
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verificar token
    const { payload } = await jwtVerify(token, SECRET);

    return NextResponse.json({
      authenticated: true,
      user: {
        username: payload.username,
        name: payload.name,
        email: payload.email,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
