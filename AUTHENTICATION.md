# 🔐 Sistema de Autenticação

## Credenciais de Acesso

Para acessar o sistema, utilize as seguintes credenciais:

```
Usuário: admin
Senha: admin123
```

## Rotas

- **Login**: `/login` - Página de autenticação
- **Dashboard**: `/dashboard` - Requer autenticação
- **Logout**: Botão "Sair" no menu lateral do dashboard

## Como Funciona

### Middleware de Autenticação
- Todas as rotas `/dashboard/*` são protegidas automaticamente
- Se você não estiver autenticado, será redirecionado para `/login`
- O middleware verifica o token JWT em cada requisição

### Token JWT
- Token válido por 24 horas
- Armazenado em cookie httpOnly para segurança
- Renovado automaticamente a cada login

### APIs de Autenticação

#### POST `/api/auth/login`
Realiza login no sistema.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "username": "admin",
    "name": "Administrador",
    "email": "admin@nola.com"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Credenciais inválidas"
}
```

#### POST `/api/auth/logout`
Faz logout do sistema (remove o token).

**Response:**
```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

#### GET `/api/auth/me`
Verifica se o usuário está autenticado.

**Response (Autenticado):**
```json
{
  "authenticated": true,
  "user": {
    "username": "admin",
    "name": "Administrador",
    "email": "admin@nola.com"
  }
}
```

**Response (Não Autenticado):**
```json
{
  "authenticated": false
}
```

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
JWT_SECRET=seu-secret-super-secreto-mudeme-em-producao-123456789
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nola_db
```

⚠️ **IMPORTANTE**: Em produção, use um JWT_SECRET forte e único!

## Segurança

### Implementado
- ✅ JWT com expiração de 24h
- ✅ Cookies httpOnly (não acessíveis via JavaScript)
- ✅ Middleware de proteção de rotas
- ✅ Verificação de token em cada requisição
- ✅ Remoção automática de tokens inválidos

### Para Produção
Para um ambiente de produção, considere:
- Usar HTTPS (necessário para cookies secure)
- Implementar rate limiting no endpoint de login
- Adicionar CSRF protection
- Usar bcrypt para hash de senhas
- Implementar refresh tokens
- Conectar com banco de dados real de usuários
- Adicionar 2FA (autenticação de dois fatores)
- Implementar logs de auditoria

## Fluxo de Autenticação

1. **Usuário acessa qualquer rota protegida** → Redirecionado para `/login`
2. **Usuário faz login** → Recebe token JWT em cookie
3. **Usuário navega no dashboard** → Middleware valida token automaticamente
4. **Token expira** → Usuário é redirecionado para `/login`
5. **Usuário clica em "Sair"** → Token é removido, redirecionado para `/login`

## Testando

1. Inicie o servidor:
```bash
npm run dev
```

2. Acesse `http://localhost:3000` (será redirecionado para `/login`)

3. Use as credenciais:
   - **Usuário**: admin
   - **Senha**: admin123

4. Você será redirecionado para o dashboard após login bem-sucedido

5. Clique em "Sair" no menu lateral para fazer logout

## Estrutura de Arquivos

```
lib/
└── auth.ts                  # AuthService - classe principal de autenticação
app/
├── api/
│   └── auth/
│       ├── login/
│       │   └── route.ts      # POST /api/auth/login
│       ├── logout/
│       │   └── route.ts      # POST /api/auth/logout
│       └── me/
│           └── route.ts      # GET /api/auth/me
├── login/
│   └── page.tsx             # Página de login
└── dashboard/
    └── layout.tsx           # Layout com botão de logout
middleware.ts                # Middleware de autenticação
.env.local                   # Variáveis de ambiente (não commitar!)
```

## Usando o AuthService nas suas APIs

### Proteger uma rota de API (Route Handler)

**IMPORTANTE:** Sempre passe o `request` como parâmetro!

```typescript
import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // SEMPRE passe o request!
  const user = await AuthService.getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  // Usuário autenticado, pode continuar
  return NextResponse.json({ message: `Olá, ${user.name}!` });
}
```

### Usar em Server Components

```typescript
import { AuthService } from "@/lib/auth";

export default async function Page() {
  // Em Server Components, não precisa passar request
  const user = await AuthService.getCurrentUser();
  
  return <div>Olá, {user?.name}!</div>;
}
```

### Métodos disponíveis no AuthService

**Para Route Handlers (APIs):**
- `AuthService.getUserFromRequest(request)` - Retorna o usuário autenticado
- `AuthService.getTokenFromRequest(request)` - Retorna o token (síncrono)
- `requireAuth(request)` - Alias para getUserFromRequest

**Para Server Components:**
- `AuthService.getCurrentUser()` - Retorna o usuário autenticado
- `AuthService.isAuthenticated()` - Retorna boolean se está autenticado
- `AuthService.getToken()` - Obtém o token do cookie

**Gerais:**
- `AuthService.generateToken(user)` - Gera um token JWT
- `AuthService.verifyToken(token)` - Verifica e decodifica um token

Veja mais exemplos em `AUTH_SERVICE_GUIDE.md`

## Modificando Credenciais

Para alterar as credenciais mockadas, edite o arquivo:
`app/api/auth/login/route.ts`

```typescript
const MOCK_USER = {
  username: "admin",           // ← Altere aqui
  password: "admin123",        // ← Altere aqui
  name: "Administrador",
  email: "admin@nola.com",
};
```
