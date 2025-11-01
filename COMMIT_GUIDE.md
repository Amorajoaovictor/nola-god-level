# 📋 Guia de Estrutura de Commits

## Situação Atual

Devido às limitações do sistema de CI/CD (não suporta `git push --force`), os commits estão consolidados em poucos commits grandes. No entanto, para projetos futuros e manutenção deste, aqui está a estrutura ideal de commits que deveria ter sido implementada.

## 🎯 Estrutura Ideal de Commits

### Benefícios de Commits Organizados

✅ **Facilita Code Review** - Revisores entendem cada mudança isoladamente  
✅ **Simplifica Debug** - `git bisect` identifica quando bugs foram introduzidos  
✅ **Permite Reversões Cirúrgicas** - Reverte features sem afetar outras  
✅ **Melhora Documentação** - Histórico do Git conta a história do projeto  
✅ **Facilita Cherry-pick** - Aplica mudanças específicas em outros branches  

### Estrutura Recomendada (15 Commits)

```
📦 SETUP & CONFIGURAÇÃO (3 commits)
│
├── 1. chore: setup Next.js 16 with TypeScript and Tailwind CSS
│   ├── package.json, package-lock.json
│   ├── tsconfig.json, next.config.ts
│   ├── tailwind.config.js, postcss.config.js
│   └── .gitignore atualizado
│
├── 2. feat: setup Prisma ORM with complete database schema
│   ├── prisma/schema.prisma (20+ modelos)
│   └── lib/prisma/client.ts (singleton)
│
└── 3. feat: add types and DTOs for data transfer
    ├── lib/types/common.types.ts
    └── lib/dto/*.dto.ts (4 arquivos)

📊 CAMADAS DE DADOS (2 commits)
│
├── 4. feat: implement repository layer (data access)
│   ├── lib/repositories/base.repository.ts
│   └── lib/repositories/*.repository.ts (4 arquivos)
│
└── 5. feat: implement service layer (business logic)
    └── lib/services/*.service.ts (4 arquivos)

🛡️ INFRAESTRUTURA (1 commit)
│
└── 6. feat: add middleware and utilities
    ├── lib/middleware/error.middleware.ts
    ├── lib/middleware/validation.middleware.ts
    └── lib/utils/response.utils.ts

🌐 API ENDPOINTS (4 commits)
│
├── 7. feat: implement sales API endpoints (4 endpoints)
│   └── app/api/sales/**/*.ts
│
├── 8. feat: implement products API endpoints (3 endpoints)
│   └── app/api/products/**/*.ts
│
├── 9. feat: implement stores API endpoints (3 endpoints)
│   └── app/api/stores/**/*.ts
│
└── 10. feat: implement customers API endpoints (2 endpoints)
    └── app/api/customers/**/*.ts

📱 FRONTEND & DOCS (5 commits)
│
├── 11. feat: add frontend with interactive documentation
│   ├── app/page.tsx
│   ├── app/layout.tsx
│   └── app/globals.css
│
├── 12. docs: add architecture documentation (layered pattern)
│   └── ARCHITECTURE.md
│
├── 13. docs: add API reference (13 endpoints documented)
│   └── API.md
│
├── 14. docs: add installation and setup guide
│   └── SETUP.md
│
└── 15. docs: add backend overview and executive summary
    ├── BACKEND.md
    └── SUMMARY.txt
```

## 📝 Convenções de Commit

### Prefixos Semânticos

- **chore:** Configuração, ferramentas, dependências
- **feat:** Nova funcionalidade ou endpoint
- **docs:** Documentação apenas
- **fix:** Correção de bug
- **refactor:** Refatoração de código
- **test:** Adição ou modificação de testes
- **style:** Formatação, não afeta lógica
- **perf:** Melhoria de performance

### Formato da Mensagem

```
<tipo>: <descrição curta em minúsculas (max 72 caracteres)>

- Bullet point explicando o que foi feito
- Outro ponto relevante
- Terceiro ponto se necessário
```

**Exemplo:**
```
feat: implement sales API endpoints (4 endpoints)

- GET /api/sales - list with pagination
- GET /api/sales/:id - details with relationships
- GET /api/sales/store/:storeId - filter by store
- GET /api/sales/summary - analytics and metrics
```

## 🔍 Como Usar o Git para Navegar

### Ver Histórico

```bash
# Ver commits de forma compacta
git log --oneline

# Ver com gráfico
git log --oneline --graph --all

# Ver com estatísticas de arquivos
git log --stat

# Ver últimos N commits
git log -n 10
```

### Buscar no Histórico

```bash
# Buscar por texto no código
git log -S "texto_buscado"

# Buscar por mensagem de commit
git log --grep="palavra-chave"

# Ver histórico de um arquivo
git log --follow -- path/to/file

# Ver quem modificou cada linha
git blame path/to/file
```

### Trabalhar com Commits

```bash
# Ver mudanças de um commit
git show <commit-hash>

# Ver diferença entre dois commits
git diff <commit1> <commit2>

# Aplicar commit específico
git cherry-pick <commit-hash>

# Reverter commit
git revert <commit-hash>
```

### Debug com Bisect

```bash
# Encontrar commit que introduziu bug
git bisect start
git bisect bad                 # commit atual tem bug
git bisect good <commit-hash>  # commit antigo funcionava
# Git vai testando commits
git bisect good/bad            # marque cada teste
git bisect reset               # quando encontrar
```

## 🎓 Boas Práticas

### ✅ Faça

1. **Commits atômicos** - Uma mudança lógica por commit
2. **Mensagens descritivas** - Explique o "porquê", não apenas o "o quê"
3. **Commits frequentes** - Salve progresso regularmente
4. **Teste antes de commit** - Garanta que o código compila
5. **Use branches** - Features em branches separados

### ❌ Evite

1. **Commits gigantes** - Dificulta revisão e debug
2. **Mensagens vagas** - "fix", "update", "changes"
3. **Misturar mudanças** - Várias features em um commit
4. **Commits não funcionais** - Código quebrado no histórico
5. **Commit de arquivos gerados** - node_modules, .next, etc

## 📊 Exemplo Real

### Commit Ruim ❌

```
fix stuff

updated code
```

### Commit Bom ✅

```
feat: add pagination to sales endpoint

- Implement page and limit query parameters
- Add pagination validation middleware
- Return total count and page info
- Update response format to include metadata

Fixes #123
```

## 🔧 Reescrevendo Histórico (Local)

Se você precisa reorganizar commits localmente:

```bash
# Interativo rebase dos últimos N commits
git rebase -i HEAD~N

# Comandos disponíveis:
# pick = manter commit
# reword = mudar mensagem
# edit = editar commit
# squash = juntar com anterior
# fixup = juntar sem incluir mensagem
# drop = remover commit
```

**⚠️ ATENÇÃO:** Nunca reescreva histórico de commits já pushados para branches compartilhados!

## 📖 Recursos Adicionais

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

---

## 💡 Para Este Projeto

Embora os commits atuais estejam consolidados devido a limitações técnicas, o código está **perfeitamente organizado em camadas** no sistema de arquivos, o que é o mais importante para manutenção do dia a dia.

A estrutura de pastas reflete a arquitetura em camadas, facilitando:
- Encontrar código relacionado
- Adicionar novos endpoints
- Modificar camadas específicas
- Testar isoladamente

**A organização lógica do código > organização do histórico Git**
