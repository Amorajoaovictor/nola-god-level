# 🔐 Guia de Uso do AuthService

## Uso Básico

### Em Rotas de API (Route Handlers)

**IMPORTANTE:** Em rotas de API, você **DEVE** passar o `request` como parâmetro!

```typescript
import { NextRequest, NextResponse } from "next/server";
import { AuthService, requireAuth } from "@/lib/auth";

// Método 1: Verificar autenticação manualmente
export async function GET(request: NextRequest) {
  const user = await AuthService.getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // Usuário autenticado, pode prosseguir
  return NextResponse.json({
    message: `Olá, ${user.name}!`,
    user,
  });
}

// Método 2: Usar helper requireAuth (mais simples)
export async function POST(request: NextRequest) {
  const user = await requireAuth(request);
  
  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // Usuário autenticado
  return NextResponse.json({
    success: true,
    data: "Operação realizada com sucesso",
  });
}

// Método 3: Apenas pegar o token
export async function DELETE(request: NextRequest) {
  const token = AuthService.getTokenFromRequest(request);
  
  if (!token) {
    return NextResponse.json(
      { error: "Token não encontrado" },
      { status: 401 }
    );
  }

  // Verificar token
  const user = await AuthService.verifyToken(token);
  if (!user) {
    return NextResponse.json(
      { error: "Token inválido" },
      { status: 401 }
    );
  }

  // Token válido
  return NextResponse.json({ success: true });
}
```

### Em Server Components

```typescript
import { AuthService } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await AuthService.getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Bem-vindo, {user.name}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### Verificar apenas se está autenticado (booleano)

```typescript
import { AuthService } from "@/lib/auth";

export default async function SomeComponent() {
  const isAuth = await AuthService.isAuthenticated();
  
  return (
    <div>
      {isAuth ? (
        <p>Você está logado!</p>
      ) : (
        <p>Você não está logado</p>
      )}
    </div>
  );
}
```

## Métodos Disponíveis

### Para Route Handlers (APIs)

#### `AuthService.getUserFromRequest(request)`
Obtém o usuário autenticado a partir da requisição.

```typescript
export async function GET(request: NextRequest) {
  const user = await AuthService.getUserFromRequest(request);
  if (user) {
    console.log(`Usuário: ${user.name}`);
  }
}
```

#### `AuthService.getTokenFromRequest(request)`
Obtém apenas o token da requisição (síncrono).

```typescript
export async function GET(request: NextRequest) {
  const token = AuthService.getTokenFromRequest(request);
  if (token) {
    console.log("Token encontrado");
  }
}
```

### Para Server Components

#### `AuthService.getCurrentUser()`
Obtém o usuário autenticado a partir dos cookies (sem passar request).

```typescript
export default async function Page() {
  const user = await AuthService.getCurrentUser();
  return <div>Olá, {user?.name}!</div>;
}
```

### Métodos Gerais

#### `AuthService.generateToken(user)`
Gera um token JWT para o usuário.

```typescript
const token = await AuthService.generateToken({
  username: "admin",
  name: "Administrador",
  email: "admin@nola.com",
});
```

#### `AuthService.verifyToken(token)`
Verifica e decodifica um token JWT.

```typescript
const user = await AuthService.verifyToken(token);
if (user) {
  console.log(`Token válido para: ${user.name}`);
}
```

#### `AuthService.isAuthenticated()`
Verifica se o usuário está autenticado (retorna boolean) - apenas para Server Components.

```typescript
const isAuth = await AuthService.isAuthenticated();
```

#### `AuthService.getToken()`
Obtém o token do cookie - apenas para Server Components.

```typescript
const token = await AuthService.getToken();
```

## Helpers Rápidos

### `requireAuth(request)`
Alias para `AuthService.getUserFromRequest(request)`. **SEMPRE passe o request!**

```typescript
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Continuar com a lógica
}
```

### `getAuthUser(request)`
Mesmo que `requireAuth(request)`, apenas outro nome. **SEMPRE passe o request!**

```typescript
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Continuar
}
```

## Exemplos Práticos

### Proteger uma API de Vendas

```typescript
// app/api/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { SaleService } from "@/lib/services/sale.service";

export async function GET(request: NextRequest) {
  // Verificar autenticação - SEMPRE passe o request!
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  // Usuário autenticado, buscar vendas
  const sales = await SaleService.getAllSales();
  
  return NextResponse.json({ sales, user: user.name });
}
```

### Exibir nome do usuário no Layout

```typescript
// app/dashboard/layout.tsx
import { AuthService } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const user = await AuthService.getCurrentUser();

  return (
    <div>
      <header>
        <p>Olá, {user?.name || "Visitante"}!</p>
      </header>
      {children}
    </div>
  );
}
```

### Criar nova rota de API protegida

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // SEMPRE passe o request!
  const user = await AuthService.getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: "Acesso negado" },
      { status: 401 }
    );
  }

  // Verificar se é admin (exemplo)
  if (user.username !== "admin") {
    return NextResponse.json(
      { error: "Apenas administradores" },
      { status: 403 }
    );
  }

  // Retornar dados
  return NextResponse.json({
    users: [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
    ],
  });
}
```

## Interface User

```typescript
interface User {
  username: string;
  name: string;
  email: string;
}
```

## Fluxo de Autenticação

1. **Login** → `AuthService.generateToken()` → `AuthService.setAuthCookie()`
2. **Requisição** → `AuthService.getCurrentUser()` → Retorna `User` ou `null`
3. **Logout** → `AuthService.clearAuthCookie()`

## Notas Importantes

- ⚠️ **Todos os métodos são assíncronos** - use `await`
- ⚠️ **IMPORTANTE: Em Route Handlers (APIs), SEMPRE passe o `request`!**
  - ✅ Correto: `await requireAuth(request)`
  - ❌ Errado: `await requireAuth()` (vai dar erro!)
- 🔒 **Token expira em 24 horas** - renovado a cada login
- 🍪 **Cookie httpOnly** - não acessível via JavaScript no browser
- 🔐 **Secret** - definido em `.env.local` como `JWT_SECRET`

## Migração de Código Antigo

**Antes:**
```typescript
const token = request.cookies.get("auth-token")?.value;
if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

**Depois (em Route Handlers):**
```typescript
const user = await AuthService.getUserFromRequest(request); // ← Passe o request!
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

**Ou usando helper:**
```typescript
const user = await requireAuth(request); // ← Passe o request!
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

**Em Server Components:**
```typescript
const user = await AuthService.getCurrentUser(); // ← Não precisa de request
if (!user) redirect("/login");
```
