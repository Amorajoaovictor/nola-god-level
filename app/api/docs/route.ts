import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger/swagger-config';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Retorna a especificação OpenAPI em JSON
 *     description: Endpoint que retorna a documentação da API em formato OpenAPI 3.0
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Especificação OpenAPI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}
