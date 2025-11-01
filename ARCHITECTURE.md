# Arquitetura Backend - Nola God Level

## 📋 Visão Geral

Este projeto implementa uma API REST robusta para análise de dados de restaurantes utilizando **arquitetura em camadas** (layered architecture) com Next.js 16, Prisma ORM e PostgreSQL.

## 🏗️ Arquitetura em Camadas

A aplicação foi estruturada seguindo o padrão de arquitetura em camadas, onde cada camada tem responsabilidades bem definidas e se comunica apenas com as camadas adjacentes.

```
┌─────────────────────────────────────┐
│   Camada de Apresentação (API)     │  ← Controllers/Routes
├─────────────────────────────────────┤
│   Camada de Serviço (Business)     │  ← Business Logic
├─────────────────────────────────────┤
│   Camada de Repositório (Data)     │  ← Data Access
├─────────────────────────────────────┤
│   Camada de Persistência (DB)      │  ← Prisma ORM
└─────────────────────────────────────┘
```

### 1. Camada de Apresentação (`/app/api`)

**Responsabilidade:** Gerenciar requisições HTTP, validação de entrada, formatação de respostas.

**Estrutura:**
```
app/api/
├── sales/
│   ├── route.ts                 # GET /api/sales
│   ├── [id]/route.ts           # GET /api/sales/:id
│   ├── store/[storeId]/route.ts # GET /api/sales/store/:storeId
│   └── summary/route.ts         # GET /api/sales/summary
├── products/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── top-selling/route.ts
├── stores/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── [id]/performance/route.ts
└── customers/
    ├── route.ts
    └── [id]/route.ts
```

**Características:**
- Validação de parâmetros usando middleware
- Tratamento de erros centralizado
- Respostas padronizadas (JSON)
- Suporte a paginação

### 2. Camada de Serviço (`/lib/services`)

**Responsabilidade:** Implementar lógica de negócio, orquestrar repositórios, processar dados.

**Arquivos:**
```
lib/services/
├── sale.service.ts       # Lógica de negócio para vendas
├── product.service.ts    # Lógica de negócio para produtos
├── store.service.ts      # Lógica de negócio para lojas
└── customer.service.ts   # Lógica de negócio para clientes
```

**Características:**
- Validação de regras de negócio
- Composição de dados de múltiplos repositórios
- Cálculos e agregações
- Transformação de dados

**Exemplo:**
```typescript
// SaleService coordena lógica de negócio
export class SaleService {
  async getSalesSummary(storeId?: number) {
    const averageTicket = await this.getAverageTicket(storeId);
    const totalSales = await this.getTotalSales(storeId);
    // ... lógica de cálculo e agregação
    return summary;
  }
}
```

### 3. Camada de Repositório (`/lib/repositories`)

**Responsabilidade:** Acesso a dados, queries ao banco, operações CRUD.

**Arquivos:**
```
lib/repositories/
├── base.repository.ts      # Interface base para todos os repositórios
├── sale.repository.ts      # Acesso a dados de vendas
├── product.repository.ts   # Acesso a dados de produtos
├── store.repository.ts     # Acesso a dados de lojas
└── customer.repository.ts  # Acesso a dados de clientes
```

**Características:**
- Operações CRUD padronizadas
- Queries específicas do domínio
- Isolamento do Prisma Client
- Tratamento de erros de banco

**Exemplo:**
```typescript
// SaleRepository encapsula acesso ao banco
export class SaleRepository implements ISaleRepository {
  async findByStoreId(storeId: number) {
    return prisma.sale.findMany({
      where: { storeId },
      include: { store: true, channel: true }
    });
  }
}
```

### 4. Camada de Persistência (`/lib/prisma`)

**Responsabilidade:** Conexão com banco de dados, mapeamento objeto-relacional.

**Arquivos:**
```
lib/prisma/
└── client.ts              # Singleton do Prisma Client

prisma/
└── schema.prisma          # Schema do banco de dados
```

## 📦 Componentes Auxiliares

### DTOs (Data Transfer Objects) - `/lib/dto`

Definem a estrutura de dados transferidos entre camadas:
```typescript
// SaleDTO - objeto simplificado para transferência
export interface SaleDTO {
  id: number;
  storeId: number;
  storeName?: string;
  totalAmount: number;
  // ...
}
```

### Types - `/lib/types`

Tipos compartilhados, classes de erro, interfaces comuns:
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}
```

### Middleware - `/lib/middleware`

Funções transversais para validação e tratamento de erros:
```typescript
// Error handler middleware
export function asyncHandler(handler) {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorHandler(error);
    }
  };
}
```

### Utilities - `/lib/utils`

Funções auxiliares para formatação de respostas:
```typescript
export function successResponse<T>(data: T) {
  return NextResponse.json({
    success: true,
    data
  });
}
```

## 🔄 Fluxo de Dados

```
1. Cliente HTTP Request
   ↓
2. API Route (/app/api)
   - Valida parâmetros
   - Chama Service
   ↓
3. Service (/lib/services)
   - Aplica regras de negócio
   - Chama Repository(ies)
   ↓
4. Repository (/lib/repositories)
   - Executa query no banco
   - Retorna dados brutos
   ↓
5. Service
   - Processa e transforma dados
   - Retorna DTO
   ↓
6. API Route
   - Formata resposta
   - Retorna JSON
   ↓
7. Cliente HTTP Response
```

## 🎯 Benefícios da Arquitetura em Camadas

### Separação de Responsabilidades
Cada camada tem um propósito específico e bem definido.

### Testabilidade
Camadas podem ser testadas isoladamente com mocks.

### Manutenibilidade
Mudanças em uma camada não afetam outras camadas.

### Escalabilidade
Fácil adicionar novos recursos seguindo o padrão existente.

### Reutilização
Services e Repositories podem ser reutilizados em diferentes contextos.

## 📝 Exemplos de Uso

### Exemplo 1: Adicionar novo endpoint

1. **Criar rota** em `/app/api/nova-rota/route.ts`
```typescript
export const GET = asyncHandler(async (req) => {
  const result = await novoService.metodo();
  return successResponse(result);
});
```

2. **Criar service** em `/lib/services/novo.service.ts`
```typescript
export class NovoService {
  async metodo() {
    return this.repository.findAll();
  }
}
```

3. **Criar repository** em `/lib/repositories/novo.repository.ts`
```typescript
export class NovoRepository {
  async findAll() {
    return prisma.novaTabela.findMany();
  }
}
```

### Exemplo 2: Adicionar validação de negócio

Em `/lib/services/sale.service.ts`:
```typescript
async createSale(data: CreateSaleDTO) {
  // Validação de regra de negócio
  if (data.totalAmount < 0) {
    throw new ValidationError('Total amount cannot be negative');
  }
  
  // Chama repository
  return this.repository.create(data);
}
```

## 🔒 Tratamento de Erros

Erros são capturados e tratados em cada camada:

1. **Repository:** Lança `DatabaseError` para erros de banco
2. **Service:** Lança `ValidationError` para regras de negócio
3. **API Route:** Retorna resposta HTTP apropriada

```typescript
try {
  const sale = await saleService.getSaleById(id);
  if (!sale) {
    throw new NotFoundError('Sale not found');
  }
  return successResponse(sale);
} catch (error) {
  return errorHandler(error);
}
```

## 📚 Tecnologias Utilizadas

- **Next.js 16:** Framework React com suporte a API Routes
- **Prisma ORM:** Mapeamento objeto-relacional type-safe
- **TypeScript:** Tipagem estática para maior segurança
- **PostgreSQL:** Banco de dados relacional

## 🚀 Próximos Passos

1. Adicionar autenticação e autorização
2. Implementar cache com Redis
3. Adicionar testes unitários e de integração
4. Implementar logging estruturado
5. Adicionar documentação OpenAPI/Swagger
6. Implementar rate limiting
7. Adicionar métricas e monitoring
