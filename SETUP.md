# Backend Setup Guide - Nola God Level

## 🚀 Guia de Configuração Inicial

Este guia explica como configurar e executar o backend da aplicação.

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🔧 Instalação

### 1. Clone o repositório (se ainda não fez)

```bash
git clone https://github.com/Amorajoaovictor/nola-god-level.git
cd nola-god-level
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

#### Opção A: Usando Docker (Recomendado)

O projeto já possui um `docker-compose.yml` configurado:

```bash
# Inicia o PostgreSQL
docker compose up -d postgres

# Aguarde alguns segundos para o banco inicializar
```

#### Opção B: PostgreSQL Local

Configure sua instância local do PostgreSQL e crie o banco:

```sql
CREATE DATABASE challenge_db;
CREATE USER challenge WITH PASSWORD 'challenge';
GRANT ALL PRIVILEGES ON DATABASE challenge_db TO challenge;
```

### 4. Configure as variáveis de ambiente

O arquivo `.env` já está configurado com a URL padrão do Docker:

```env
DATABASE_URL="postgresql://challenge:challenge@localhost:5432/challenge_db?schema=public"
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Se estiver usando configuração diferente, ajuste a `DATABASE_URL` conforme necessário.

### 5. Gere os dados de exemplo (Opcional)

Se ainda não gerou os dados, execute:

```bash
# Usando Docker
docker compose run --rm data-generator

# Ou localmente
python generate_data.py
```

Isso criará ~500k vendas de exemplo no banco de dados.

### 6. Gere o Prisma Client

```bash
npm run prisma:generate
```

Este comando gera o cliente TypeScript do Prisma baseado no schema.

### 7. Sincronize o schema com o banco (se necessário)

Se o banco estiver vazio ou você fez mudanças no schema:

```bash
npm run prisma:push
```

⚠️ **Nota:** Se você já rodou o script de geração de dados, **não execute** `prisma:push` pois ele pode recriar as tabelas e você perderá os dados.

## ▶️ Executando a Aplicação

### Modo Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:3000`

### Modo Produção

```bash
# Build
npm run build

# Start
npm run start
```

## 🧪 Testando a API

### Teste básico com curl

```bash
# Listar lojas
curl http://localhost:3000/api/stores

# Listar vendas (paginado)
curl "http://localhost:3000/api/sales?page=1&limit=10"

# Obter resumo de vendas
curl http://localhost:3000/api/sales/summary

# Top produtos mais vendidos
curl http://localhost:3000/api/products/top-selling
```

### Acessar a documentação

Abra seu navegador em: `http://localhost:3000`

Você verá a documentação completa da API com todos os endpoints disponíveis.

## 📚 Scripts Disponíveis

```json
{
  "dev": "next dev",                    // Inicia em modo desenvolvimento
  "build": "next build",                // Faz build para produção
  "start": "next start",                // Inicia versão de produção
  "lint": "next lint",                  // Executa o linter
  "prisma:generate": "prisma generate", // Gera o Prisma Client
  "prisma:push": "prisma db push",      // Sincroniza schema com DB
  "prisma:studio": "prisma studio"      // Abre interface visual do DB
}
```

## 🗂️ Estrutura do Projeto

```
nola-god-level/
├── app/
│   ├── api/                    # API Routes (Controllers)
│   │   ├── sales/
│   │   ├── products/
│   │   ├── stores/
│   │   └── customers/
│   ├── layout.tsx
│   ├── page.tsx               # Home page com documentação
│   └── globals.css
│
├── lib/
│   ├── dto/                   # Data Transfer Objects
│   │   ├── sale.dto.ts
│   │   ├── product.dto.ts
│   │   ├── store.dto.ts
│   │   └── customer.dto.ts
│   │
│   ├── middleware/            # Middleware functions
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── prisma/               # Prisma configuration
│   │   └── client.ts
│   │
│   ├── repositories/         # Data Access Layer
│   │   ├── base.repository.ts
│   │   ├── sale.repository.ts
│   │   ├── product.repository.ts
│   │   ├── store.repository.ts
│   │   └── customer.repository.ts
│   │
│   ├── services/             # Business Logic Layer
│   │   ├── sale.service.ts
│   │   ├── product.service.ts
│   │   ├── store.service.ts
│   │   └── customer.service.ts
│   │
│   ├── types/                # Type definitions
│   │   └── common.types.ts
│   │
│   └── utils/                # Utility functions
│       └── response.utils.ts
│
├── prisma/
│   └── schema.prisma         # Database schema
│
├── ARCHITECTURE.md           # Documentação da arquitetura
├── API.md                    # Documentação da API
├── SETUP.md                  # Este arquivo
├── .env                      # Variáveis de ambiente
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 🔍 Prisma Studio

Para visualizar e editar os dados do banco de forma visual:

```bash
npm run prisma:studio
```

Isso abrirá uma interface web em `http://localhost:5555` onde você pode navegar pelas tabelas e dados.

## 🐛 Troubleshooting

### Erro: "Can't reach database server"

**Solução:**
1. Verifique se o PostgreSQL está rodando: `docker ps` ou `systemctl status postgresql`
2. Verifique a `DATABASE_URL` no arquivo `.env`
3. Teste a conexão: `docker compose exec postgres psql -U challenge challenge_db`

### Erro: "Prisma Client is not generated"

**Solução:**
```bash
npm run prisma:generate
```

### Erro: "Cannot find module '@prisma/client'"

**Solução:**
```bash
npm install
npm run prisma:generate
```

### Porta 3000 já está em uso

**Solução:**
```bash
# Mude a porta no comando dev
PORT=3001 npm run dev
```

### Erro ao conectar com o banco Docker

**Solução:**
```bash
# Reinicie o container
docker compose down
docker compose up -d postgres

# Aguarde 10 segundos e tente novamente
```

## 📖 Documentação Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detalhes da arquitetura em camadas
- [API.md](./API.md) - Documentação completa de todos os endpoints
- [DADOS.md](./DADOS.md) - Estrutura e volume dos dados
- [PROBLEMA.md](./PROBLEMA.md) - Contexto do problema de negócio

## 🎯 Próximos Passos

Após configurar o backend:

1. ✅ Testar os endpoints da API
2. ✅ Explorar os dados com Prisma Studio
3. ✅ Ler a documentação da arquitetura
4. 🔲 Implementar o frontend
5. 🔲 Adicionar autenticação
6. 🔲 Adicionar testes
7. 🔲 Deploy em produção

## 💡 Dicas

- Use o Prisma Studio (`npm run prisma:studio`) para explorar os dados visualmente
- Leia o [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a estrutura em camadas
- Consulte o [API.md](./API.md) para exemplos de uso de cada endpoint
- Use ferramentas como Postman ou Insomnia para testar a API mais facilmente

## 🆘 Suporte

Em caso de problemas:
- Verifique os logs do console onde rodou `npm run dev`
- Verifique os logs do Docker: `docker compose logs postgres`
- Abra uma issue no repositório do projeto

---

**Desenvolvido com ❤️ usando Next.js, Prisma e arquitetura em camadas**
