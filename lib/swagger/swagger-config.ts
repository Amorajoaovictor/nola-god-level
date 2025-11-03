import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nola God Level API',
      version: '1.0.0',
      description: 'API de Analytics e Relatórios para Sistema de Gestão de Vendas',
      contact: {
        name: 'API Support',
        email: 'support@nola.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
      {
        url: 'https://api.nola.com',
        description: 'Servidor de Produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Mensagem de erro',
            },
          },
        },
        DateRange: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Data inicial (YYYY-MM-DD)',
              example: '2025-01-01',
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'Data final (YYYY-MM-DD)',
              example: '2025-12-31',
            },
          },
        },
        Filters: {
          type: 'object',
          properties: {
            startDate: {
              type: 'string',
              format: 'date',
              example: '2025-01-01',
            },
            endDate: {
              type: 'string',
              format: 'date',
              example: '2025-12-31',
            },
            channelId: {
              type: 'integer',
              example: 1,
            },
            storeId: {
              type: 'integer',
              example: 1,
            },
          },
        },
        Sale: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            orderDate: { type: 'string', format: 'date-time' },
            totalValue: { type: 'number', format: 'float' },
            quantity: { type: 'integer' },
            productId: { type: 'integer' },
            storeId: { type: 'integer' },
            channelId: { type: 'integer' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            category: { type: 'string' },
            price: { type: 'number', format: 'float' },
          },
        },
        Store: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            address: { type: 'string' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Dashboard',
        description: 'Endpoints para métricas do dashboard principal',
      },
      {
        name: 'Sales',
        description: 'Endpoints de análise de vendas',
      },
      {
        name: 'Products',
        description: 'Endpoints de análise de produtos',
      },
      {
        name: 'Stores',
        description: 'Endpoints de análise de lojas',
      },
      {
        name: 'Orders',
        description: 'Endpoints de análise de pedidos',
      },
      {
        name: 'Analytics',
        description: 'Endpoints de analytics e relatórios',
      },
    ],
  },
  apis: ['./app/api/**/*.ts', './pages/api/**/*.ts'], // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(options);
