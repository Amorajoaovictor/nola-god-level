# API Documentation - Nola God Level

## Base URL
```
http://localhost:3000/api
```

## Response Format

Todas as respostas seguem o formato:

```json
{
  "success": true,
  "data": { ... }
}
```

Em caso de erro:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Paginação

Endpoints com paginação aceitam os seguintes query parameters:
- `page` (opcional, padrão: 1) - Número da página
- `limit` (opcional, padrão: 50, máximo: 100) - Itens por página

Resposta com paginação:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 500,
    "totalPages": 10
  }
}
```

---

## 📊 Sales (Vendas)

### GET /api/sales
Lista todas as vendas com paginação.

**Query Parameters:**
- `page` (opcional): Número da página
- `limit` (opcional): Itens por página

**Exemplo de Request:**
```bash
curl http://localhost:3000/api/sales?page=1&limit=20
```

**Exemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "storeId": 1,
      "channelId": 1,
      "customerId": 100,
      "createdAt": "2024-01-15T12:30:00Z",
      "saleStatusDesc": "COMPLETED",
      "totalAmount": "87.50",
      "totalDiscount": "8.50",
      "deliveryFee": "9.00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500000,
    "totalPages": 25000
  }
}
```

---

### GET /api/sales/[id]
Obtém detalhes completos de uma venda específica.

**Path Parameters:**
- `id` (obrigatório): ID da venda

**Exemplo de Request:**
```bash
curl http://localhost:3000/api/sales/12345
```

**Exemplo de Response:**
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "store": {
      "id": 1,
      "name": "Burguer House - Centro SP"
    },
    "channel": {
      "id": 2,
      "name": "iFood"
    },
    "customer": {
      "id": 100,
      "customerName": "João Silva"
    },
    "productSales": [
      {
        "id": 1,
        "product": {
          "id": 50,
          "name": "X-Bacon Duplo"
        },
        "quantity": 1,
        "basePrice": 32.00,
        "totalPrice": 41.00,
        "itemProductSales": [
          {
            "item": { "name": "Bacon extra" },
            "additionalPrice": 5.00
          }
        ]
      }
    ],
    "payments": [
      {
        "paymentType": { "description": "PIX" },
        "value": "87.50"
      }
    ],
    "totalAmount": "87.50"
  }
}
```

---

### GET /api/sales/store/[storeId]
Lista vendas de uma loja específica.

**Path Parameters:**
- `storeId` (obrigatório): ID da loja

**Query Parameters:**
- `page`, `limit` para paginação

**Exemplo de Request:**
```bash
curl http://localhost:3000/api/sales/store/1?page=1&limit=50
```

---

### GET /api/sales/summary
Obtém resumo e métricas de vendas.

**Query Parameters:**
- `storeId` (opcional): Filtrar por loja
- `startDate` (opcional): Data inicial (ISO 8601)
- `endDate` (opcional): Data final (ISO 8601)

**Exemplo de Request:**
```bash
curl "http://localhost:3000/api/sales/summary?storeId=1&startDate=2024-01-01&endDate=2024-01-31"
```

**Exemplo de Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 125000.50,
    "averageTicket": 67.85,
    "totalSales": 1842,
    "period": {
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-01-31T23:59:59Z"
    }
  }
}
```

---

## 🍔 Products (Produtos)

### GET /api/products
Lista produtos com paginação ou busca.

**Query Parameters:**
- `page`, `limit` para paginação
- `search` (opcional): Termo de busca no nome do produto

**Exemplo de Request (lista):**
```bash
curl http://localhost:3000/api/products?page=1&limit=20
```

**Exemplo de Request (busca):**
```bash
curl http://localhost:3000/api/products?search=hamburguer
```

**Exemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 50,
      "name": "X-Bacon Duplo",
      "brandId": 1,
      "categoryId": 10,
      "category": {
        "id": 10,
        "name": "Hambúrgueres"
      }
    }
  ]
}
```

---

### GET /api/products/[id]
Obtém detalhes de um produto específico.

**Path Parameters:**
- `id` (obrigatório): ID do produto

**Exemplo de Request:**
```bash
curl http://localhost:3000/api/products/50
```

---

### GET /api/products/top-selling
Lista produtos mais vendidos.

**Query Parameters:**
- `limit` (opcional, padrão: 10): Quantidade de produtos

**Exemplo de Request:**
```bash
curl http://localhost:3000/api/products/top-selling?limit=20
```

**Exemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "product": {
        "id": 50,
        "name": "X-Bacon Duplo",
        "category": { "name": "Hambúrgueres" }
      },
      "totalQuantity": 5420,
      "totalRevenue": 173440.00,
      "salesCount": 5420
    }
  ]
}
```

---

## 🏪 Stores (Lojas)

### GET /api/stores
Lista lojas com paginação.

**Query Parameters:**
- `page`, `limit` para paginação
- `active=true` (opcional): Listar apenas lojas ativas

**Exemplo de Request:**
```bash
curl http://localhost:3000/api/stores?active=true
```

**Exemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Burguer House - Centro SP",
      "city": "São Paulo",
      "state": "SP",
      "isActive": true,
      "brand": {
        "id": 1,
        "name": "Burguer House"
      }
    }
  ]
}
```

---

### GET /api/stores/[id]
Obtém detalhes de uma loja específica.

**Path Parameters:**
- `id` (obrigatório): ID da loja

**Exemplo de Request:**
```bash
curl http://localhost:3000/api/stores/1
```

---

### GET /api/stores/[id]/performance
Obtém métricas de performance de uma loja.

**Path Parameters:**
- `id` (obrigatório): ID da loja

**Query Parameters:**
- `startDate` (opcional): Data inicial
- `endDate` (opcional): Data final

**Exemplo de Request:**
```bash
curl "http://localhost:3000/api/stores/1/performance?startDate=2024-01-01&endDate=2024-01-31"
```

**Exemplo de Response:**
```json
{
  "success": true,
  "data": {
    "store": {
      "id": 1,
      "name": "Burguer House - Centro SP",
      "city": "São Paulo",
      "state": "SP"
    },
    "performance": {
      "storeId": 1,
      "totalRevenue": 125000.50,
      "totalDiscount": 12500.00,
      "averageTicket": 67.85,
      "totalSales": 1842
    }
  }
}
```

---

## 👥 Customers (Clientes)

### GET /api/customers
Lista clientes com paginação.

**Query Parameters:**
- `page`, `limit` para paginação

**Exemplo de Request:**
```bash
curl http://localhost:3000/api/customers?page=1&limit=50
```

**Exemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 100,
      "customerName": "João Silva",
      "email": "joao@example.com",
      "phoneNumber": "+5511999999999",
      "createdAt": "2023-06-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 10000,
    "totalPages": 200
  }
}
```

---

### GET /api/customers/[id]
Obtém perfil completo de um cliente.

**Path Parameters:**
- `id` (obrigatório): ID do cliente

**Exemplo de Request:**
```bash
curl http://localhost:3000/api/customers/100
```

**Exemplo de Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": 100,
      "name": "João Silva",
      "email": "joao@example.com",
      "phone": "+5511999999999",
      "createdAt": "2023-06-15T10:00:00Z"
    },
    "stats": {
      "lifetimeValue": 3250.00,
      "totalOrders": 48
    }
  }
}
```

---

## ❌ Códigos de Erro

- `200` - Success
- `400` - Bad Request (validação falhou)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error

**Exemplo de Resposta de Erro:**
```json
{
  "success": false,
  "error": "Sale with ID 99999 not found"
}
```

---

## 📝 Notas

1. Todas as datas devem estar no formato ISO 8601 (ex: `2024-01-15T12:30:00Z`)
2. Valores monetários são retornados como strings para evitar perda de precisão
3. IDs devem ser números inteiros positivos
4. A paginação começa em 1 (não em 0)
5. O limite máximo de paginação é 100 itens por página
