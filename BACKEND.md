# 🚀 Backend Estrutura Completa - Arquitetura em Camadas

Este projeto implementa uma estrutura completa de backend usando **Next.js**, **Prisma ORM** e **arquitetura em camadas** (layered architecture).

## 📋 O que foi criado?

### ✅ Estrutura Completa de Backend

```
nola-god-level/
│
├── app/api/                          # 🎯 CAMADA DE APRESENTAÇÃO (Controllers)
│   ├── sales/                        # Endpoints de vendas
│   │   ├── route.ts                  # GET /api/sales (lista paginada)
│   │   ├── [id]/route.ts            # GET /api/sales/:id (detalhes)
│   │   ├── store/[storeId]/route.ts # GET /api/sales/store/:storeId
│   │   └── summary/route.ts         # GET /api/sales/summary (métricas)
│   │
│   ├── products/                     # Endpoints de produtos
│   │   ├── route.ts                  # GET /api/products (lista/busca)
│   │   ├── [id]/route.ts            # GET /api/products/:id
│   │   └── top-selling/route.ts     # GET /api/products/top-selling
│   │
│   ├── stores/                       # Endpoints de lojas
│   │   ├── route.ts                  # GET /api/stores (lista/ativas)
│   │   ├── [id]/route.ts            # GET /api/stores/:id
│   │   └── [id]/performance/route.ts # GET /api/stores/:id/performance
│   │
│   └── customers/                    # Endpoints de clientes
│       ├── route.ts                  # GET /api/customers (lista)
│       └── [id]/route.ts            # GET /api/customers/:id (perfil)
│
├── lib/
│   ├── services/                     # 💼 CAMADA DE SERVIÇO (Business Logic)
│   │   ├── sale.service.ts          # Regras de negócio para vendas
│   │   ├── product.service.ts       # Regras de negócio para produtos
│   │   ├── store.service.ts         # Regras de negócio para lojas
│   │   └── customer.service.ts      # Regras de negócio para clientes
│   │
│   ├── repositories/                 # 💾 CAMADA DE REPOSITÓRIO (Data Access)
│   │   ├── base.repository.ts       # Interface base
│   │   ├── sale.repository.ts       # Acesso a dados de vendas
│   │   ├── product.repository.ts    # Acesso a dados de produtos
│   │   ├── store.repository.ts      # Acesso a dados de lojas
│   │   └── customer.repository.ts   # Acesso a dados de clientes
│   │
│   ├── dto/                          # 📦 Data Transfer Objects
│   │   ├── sale.dto.ts
│   │   ├── product.dto.ts
│   │   ├── store.dto.ts
│   │   └── customer.dto.ts
│   │
│   ├── types/                        # 🔖 Types e Interfaces
│   │   └── common.types.ts
│   │
│   ├── middleware/                   # 🛡️ Middleware
│   │   ├── error.middleware.ts      # Tratamento de erros
│   │   └── validation.middleware.ts # Validação de dados
│   │
│   ├── utils/                        # 🔧 Utilities
│   │   └── response.utils.ts        # Formatação de respostas
│   │
│   └── prisma/                       # 🗄️ CAMADA DE PERSISTÊNCIA
│       └── client.ts                 # Prisma Client singleton
│
├── prisma/
│   └── schema.prisma                 # Schema completo do banco (20+ tabelas)
│
└── Documentação/
    ├── ARCHITECTURE.md               # Detalhes da arquitetura
    ├── API.md                        # Documentação completa da API
    └── SETUP.md                      # Guia de instalação
```

## 🏗️ Arquitetura em Camadas

A arquitetura implementada segue o padrão de **camadas** onde cada camada tem responsabilidades bem definidas:

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA DE APRESENTAÇÃO (Controllers)                       │
│  • Validação de entrada                                     │
│  • Formatação de respostas                                  │
│  • Tratamento de erros HTTP                                 │
├─────────────────────────────────────────────────────────────┤
│  CAMADA DE SERVIÇO (Business Logic)                         │
│  • Regras de negócio                                        │
│  • Validação de dados complexos                             │
│  • Orquestração de repositórios                             │
├─────────────────────────────────────────────────────────────┤
│  CAMADA DE REPOSITÓRIO (Data Access)                        │
│  • Queries ao banco de dados                                │
│  • Operações CRUD                                           │
│  • Isolamento do ORM                                        │
├─────────────────────────────────────────────────────────────┤
│  CAMADA DE PERSISTÊNCIA (Database)                          │
│  • Prisma ORM                                               │
│  • PostgreSQL                                               │
└─────────────────────────────────────────────────────────────┘
```

### Benefícios:
✅ **Separação de responsabilidades** - Cada camada tem um propósito claro  
✅ **Testabilidade** - Camadas podem ser testadas isoladamente  
✅ **Manutenibilidade** - Mudanças em uma camada não afetam outras  
✅ **Escalabilidade** - Fácil adicionar novos recursos  
✅ **Reutilização** - Services e Repositories reutilizáveis  

## 🎯 Funcionalidades Implementadas

### API Endpoints Completos

#### Vendas (Sales)
- `GET /api/sales` - Lista todas as vendas (paginado)
- `GET /api/sales/:id` - Detalhes completos de uma venda
- `GET /api/sales/store/:storeId` - Vendas por loja
- `GET /api/sales/summary` - Resumo e métricas de vendas

#### Produtos (Products)
- `GET /api/products` - Lista produtos (paginado)
- `GET /api/products?search=termo` - Busca por nome
- `GET /api/products/:id` - Detalhes do produto
- `GET /api/products/top-selling` - Produtos mais vendidos

#### Lojas (Stores)
- `GET /api/stores` - Lista lojas (paginado)
- `GET /api/stores?active=true` - Apenas lojas ativas
- `GET /api/stores/:id` - Detalhes da loja
- `GET /api/stores/:id/performance` - Métricas de performance

#### Clientes (Customers)
- `GET /api/customers` - Lista clientes (paginado)
- `GET /api/customers/:id` - Perfil completo do cliente

### Features Implementadas

✅ **Paginação** - Todos os endpoints de listagem suportam paginação  
✅ **Filtros** - Suporte a filtros por data, loja, canal, etc  
✅ **Busca** - Busca textual em produtos  
✅ **Agregações** - Cálculo de métricas (total, média, contagem)  
✅ **Relacionamentos** - Dados relacionados incluídos automaticamente  
✅ **Validação** - Validação robusta de parâmetros  
✅ **Tratamento de Erros** - Erros formatados e informativos  
✅ **TypeScript** - Type-safe em todas as camadas  

## 🚀 Como Usar

### 1. Instalação

```bash
npm install
```

### 2. Configurar Banco de Dados

```bash
# Inicia PostgreSQL com Docker
docker compose up -d postgres

# Ou configure sua instância local no .env
```

### 3. Gerar Prisma Client

```bash
npm run prisma:generate
```

### 4. Rodar o Servidor

```bash
npm run dev
```

A API estará disponível em: `http://localhost:3000/api`

### 5. Testar os Endpoints

```bash
# Listar vendas
curl http://localhost:3000/api/sales

# Top produtos
curl http://localhost:3000/api/products/top-selling

# Performance de uma loja
curl http://localhost:3000/api/stores/1/performance
```

## 📚 Documentação

### Documentação Completa Disponível:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detalhamento completo da arquitetura em camadas, fluxo de dados, padrões utilizados e exemplos práticos

- **[API.md](./API.md)** - Documentação completa de todos os endpoints, parâmetros, exemplos de request/response e códigos de erro

- **[SETUP.md](./SETUP.md)** - Guia passo a passo de instalação, configuração, troubleshooting e dicas de uso

- **[http://localhost:3000](http://localhost:3000)** - Página inicial com documentação interativa (após rodar `npm run dev`)

## 🔧 Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma ORM** - ORM type-safe para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **Tailwind CSS** - Estilização (para a página de docs)

## 📊 Schema do Banco

O schema Prisma mapeia completamente o banco de dados existente:

- ✅ **20+ modelos** (Sales, Products, Stores, Customers, etc)
- ✅ **Todos os relacionamentos** configurados
- ✅ **Índices e constraints** preservados
- ✅ **Type-safe** queries em todo o código

## 🎓 Conceitos Implementados

### Design Patterns

- **Repository Pattern** - Abstração de acesso a dados
- **Service Layer Pattern** - Encapsulamento de lógica de negócio
- **DTO Pattern** - Transferência de dados entre camadas
- **Dependency Injection** - Services injetados em controllers
- **Singleton Pattern** - Prisma Client único

### Boas Práticas

- ✅ Separação de responsabilidades
- ✅ Single Responsibility Principle
- ✅ Interface Segregation
- ✅ Error handling centralizado
- ✅ Validação em múltiplas camadas
- ✅ Respostas padronizadas
- ✅ Código limpo e bem documentado

## 🔄 Fluxo de uma Requisição

```
1. Cliente faz request HTTP
   ↓
2. Next.js API Route (Controller)
   • Valida parâmetros
   • Chama Service apropriado
   ↓
3. Service (Business Logic)
   • Aplica regras de negócio
   • Chama um ou mais Repositories
   ↓
4. Repository (Data Access)
   • Monta query Prisma
   • Executa no banco
   • Retorna dados brutos
   ↓
5. Service
   • Processa dados
   • Aplica transformações
   • Retorna DTO
   ↓
6. Controller
   • Formata resposta JSON
   • Define status HTTP
   • Retorna ao cliente
   ↓
7. Cliente recebe response padronizada
```

## 📝 Exemplos de Código

### Exemplo: Adicionar novo endpoint

#### 1. Controller (`/app/api/exemplo/route.ts`)
```typescript
import { ExemploService } from '@/lib/services/exemplo.service';
import { asyncHandler } from '@/lib/middleware/error.middleware';
import { successResponse } from '@/lib/utils/response.utils';

const exemploService = new ExemploService();

export const GET = asyncHandler(async (req) => {
  const data = await exemploService.obterDados();
  return successResponse(data);
});
```

#### 2. Service (`/lib/services/exemplo.service.ts`)
```typescript
import { ExemploRepository } from '@/lib/repositories/exemplo.repository';

export class ExemploService {
  private repository = new ExemploRepository();

  async obterDados() {
    // Lógica de negócio aqui
    return this.repository.findAll();
  }
}
```

#### 3. Repository (`/lib/repositories/exemplo.repository.ts`)
```typescript
import prisma from '@/lib/prisma/client';

export class ExemploRepository {
  async findAll() {
    return prisma.exemplo.findMany();
  }
}
```

## 🎯 Próximos Passos Sugeridos

1. ✅ Backend estruturado ← **VOCÊ ESTÁ AQUI**
2. 🔲 Implementar autenticação (JWT/NextAuth)
3. 🔲 Adicionar testes unitários e de integração
4. 🔲 Implementar frontend (dashboard analytics)
5. 🔲 Adicionar cache (Redis)
6. 🔲 Implementar rate limiting
7. 🔲 Documentação OpenAPI/Swagger
8. 🔲 CI/CD pipeline
9. 🔲 Deploy em produção

## 💡 Dicas de Uso

### Explorar os dados
```bash
npm run prisma:studio
```
Abre interface visual em `http://localhost:5555`

### Ver queries SQL
Ative no `.env`:
```env
DATABASE_URL="postgresql://...?schema=public&log=query"
```

### Debug
Use o VS Code com breakpoints nos services/repositories.

## 🆘 Precisa de Ajuda?

1. Leia [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a estrutura
2. Consulte [API.md](./API.md) para exemplos de uso
3. Veja [SETUP.md](./SETUP.md) para troubleshooting
4. Acesse `http://localhost:3000` para docs interativa

---

**Estrutura criada seguindo as melhores práticas de arquitetura de software e padrões de design consolidados da indústria.** 🚀
