# 📊 Sistema de Apresentações - Nola Analytics

## 🎯 Visão Geral

O sistema de apresentações oferece **duas ferramentas complementares** para criar e gerenciar apresentações de dados:

### 🎬 **1. Apresentações** (`/dashboard/presentations`)
Sistema de gerenciamento de slides capturados do dashboard.
- Adicione componentes existentes como slides
- Gerencie múltiplas apresentações
- Modo apresentação fullscreen
- Armazenamento em localStorage

### ✨ **2. Editor Avançado** (`/dashboard/presentation`)
Editor visual completo para criar slides customizados.
- Crie slides do zero com componentes personalizados
- Conecte com APIs em tempo real
- Filtros e transformações avançadas
- Presets de métricas e gráficos

---

## ✨ Funcionalidades - Captura Rápida

### 1. **Botão "Adicionar ao Slide"**
- Disponível em qualquer componente visual do dashboard
- Adiciona automaticamente à apresentação ativa
- Feedback visual de confirmação

### 2. **Gerenciamento de Apresentações**
- Criar múltiplas apresentações
- Trocar entre apresentações
- Deletar apresentações
- Exportar para JSON

### 3. **Tipos de Slides Suportados**
- ✅ **Metrics** - Cards de métricas
- ✅ **Chart** - Gráficos (Bar, Pie)
- ✅ **Table** - Tabelas
- ✅ **Custom** - Dados personalizados

### 4. **Modo Apresentação**
- Navegação entre slides
- Design escuro profissional
- Controles de navegação
- Indicador de progresso

## 📁 Estrutura de Arquivos

```
lib/presentation/
  └── presentation-store.ts      # Gerenciamento de dados (localStorage)

components/presentation/
  └── AddToSlideButton.tsx        # Botão universal para adicionar slides

app/dashboard/presentations/
  └── page.tsx                    # Página principal de apresentações
```

## 🚀 Como Usar

### Adicionar Botão em um Componente

```tsx
import AddToSlideButton from "@/components/presentation/AddToSlideButton";

// Exemplo 1: Métricas
<AddToSlideButton
  title="Métricas de Vendas"
  type="metrics"
  data={[
    { label: "Total de Vendas", value: "R$ 1.2M", subtitle: "+12% vs mês anterior" },
    { label: "Pedidos", value: "5,432", subtitle: "Média: 180/dia" },
  ]}
/>

// Exemplo 2: Gráfico de Barras
<AddToSlideButton
  title="Vendas por Loja"
  type="chart"
  data={[
    { name: "Loja A", value: 45000 },
    { name: "Loja B", value: 38000 },
  ]}
  config={{
    chartType: "bar",
    xKey: "name",
    yKey: "value"
  }}
/>

// Exemplo 3: Gráfico de Pizza
<AddToSlideButton
  title="Distribuição de Categorias"
  type="chart"
  data={[
    { name: "Hambúrgueres", value: 45 },
    { name: "Bebidas", value: 30 },
    { name: "Sobremesas", value: 25 },
  ]}
  config={{
    chartType: "pie",
    valueKey: "value",
    nameKey: "name"
  }}
/>

// Exemplo 4: Tabela
<AddToSlideButton
  title="Top 10 Produtos"
  type="table"
  data={[
    { produto: "X-Burger", quantidade: 1250, receita: 25000 },
    { produto: "Coca-Cola", quantidade: 980, receita: 4900 },
  ]}
  config={{
    columns: [
      { key: 'produto', label: 'Produto' },
      { key: 'quantidade', label: 'Quantidade' },
      { key: 'receita', label: 'Receita' },
    ]
  }}
/>
```

## 🎨 Variantes do Botão

```tsx
<AddToSlideButton variant="primary" ... />   // Azul (destaque)
<AddToSlideButton variant="secondary" ... /> // Cinza
<AddToSlideButton variant="ghost" ... />     // Branco com borda (padrão)
```

## 💾 API do PresentationStore

```typescript
import { PresentationStore } from "@/lib/presentation/presentation-store";

// Obter apresentação atual
const current = PresentationStore.getCurrent();

// Criar nova apresentação
const newPres = PresentationStore.create("Relatório Q4");

// Adicionar slide
PresentationStore.addSlide({
  title: "Vendas do Mês",
  type: "metrics",
  data: [...],
  config: {...}
});

// Remover slide
PresentationStore.removeSlide(slideId);

// Reordenar slides
PresentationStore.reorderSlides([slideId1, slideId2, slideId3]);

// Exportar para JSON
const json = PresentationStore.exportToJSON();

// Importar de JSON
PresentationStore.importFromJSON(jsonString);

// Deletar apresentação
PresentationStore.delete(presentationId);
```

## 🎬 Fluxo de Uso

1. **Criar Apresentação**
   - Ir em `/dashboard/presentations`
   - Clicar em "Nova Apresentação"
   - Dar um nome

2. **Adicionar Slides**
   - Navegar pelo dashboard (Vendas, Produtos, Lojas, etc.)
   - Clicar em "Adicionar ao Slide" nos componentes desejados
   - Slides são adicionados automaticamente

3. **Gerenciar Slides**
   - Voltar em `/dashboard/presentations`
   - Ver todos os slides adicionados
   - Remover slides indesejados
   - Reordenar (futura implementação)

4. **Apresentar**
   - Clicar em "Apresentar"
   - Navegar com botões ← →
   - Sair para voltar ao modo edição

5. **Exportar**
   - Clicar em "Exportar JSON"
   - Salvar arquivo
   - Compartilhar ou fazer backup

## 📊 Exemplos Completos

### Dashboard Home - Métricas Principais
```tsx
<AddToSlideButton
  title="Visão Geral do Negócio"
  type="metrics"
  data={[
    { 
      label: "Faturamento Total", 
      value: `R$ ${(totalRevenue / 1000000).toFixed(2)}M`,
      subtitle: "Vendas + taxas + fretes"
    },
    { 
      label: "Total de Vendas", 
      value: totalSales.toLocaleString('pt-BR'),
      subtitle: `${completedSales.toLocaleString('pt-BR')} concluídas`
    },
    { 
      label: "Ticket Médio", 
      value: `R$ ${avgTicket.toFixed(2)}`,
      subtitle: "Por pedido"
    },
    { 
      label: "Total de Produtos", 
      value: totalProducts.toLocaleString('pt-BR'),
      subtitle: "Catálogo ativo"
    },
  ]}
/>
```

### Página de Lojas - Performance por Loja
```tsx
<AddToSlideButton
  title="Performance das Lojas"
  type="chart"
  data={stores.map(store => ({
    name: store.name,
    vendas: store.sales,
    receita: store.revenue
  }))}
  config={{
    chartType: "bar",
    xKey: "name",
    yKey: "vendas"
  }}
/>
```

## 🔄 Sincronização

- ✅ Dados salvos automaticamente no localStorage
- ✅ Persiste entre sessões
- ✅ Não precisa de backend
- ✅ Exportação JSON para backup
- ⚠️ Limitado a ~5MB por domínio

## 🎯 Próximas Melhorias

- [ ] Drag & Drop para reordenar slides
- [ ] Temas de apresentação (claro/escuro/custom)
- [ ] Transições entre slides
- [ ] Anotações em slides
- [ ] Compartilhamento via link
- [ ] Exportar para PDF/PowerPoint
- [ ] Templates de apresentação

## 🐛 Troubleshooting

**Apresentação não carrega?**
- Verificar console do navegador
- Limpar localStorage: `localStorage.clear()`
- Recarregar página

**Slide não aparece?**
- Verificar se dados estão no formato correto
- Ver console para erros
- Verificar tipo de slide compatível

**Botão não funciona?**
- Verificar se PresentationStore está importado
- Ver se há apresentação ativa
- Checar localStorage disponível

## 📝 Notas Técnicas

- **Storage**: localStorage (máx ~5MB)
- **Formato**: JSON serializado
- **IDs**: Timestamp-based (único por criação)
- **Performance**: Otimizado para até 50 slides por apresentação
