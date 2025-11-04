'use client';import { redirect } from 'next/navigation';export default function Docs() {



import { useEffect } from 'react';  return (

import { useRouter } from 'next/navigation';

export default function DocsPage() {    <main className="flex min-h-screen flex-col items-center justify-center p-24">

export default function DocsPage() {

  const router = useRouter();  redirect('/api-docs');      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">

  

  useEffect(() => {}        <h1 className="text-4xl font-bold mb-8 text-center">

    router.replace('/api-docs');

  }, [router]);          Nola God Level - Restaurant Analytics API

          </h1>

  return (        

    <div className="flex min-h-screen items-center justify-center">        <div className="mb-8 text-center">

      <p>Redirecionando...</p>          <p className="text-lg mb-4">

    </div>            Backend API com arquitetura em camadas usando Next.js e Prisma

  );          </p>

}        </div>


        <div className="grid gap-6 mb-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">📚 Documentação da API</h2>
            <p className="mb-4">Endpoints disponíveis:</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Vendas (Sales)</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><code>GET /api/sales</code> - Lista todas as vendas (paginado)</li>
                  <li><code>GET /api/sales/[id]</code> - Detalhes de uma venda</li>
                  <li><code>GET /api/sales/store/[storeId]</code> - Vendas por loja</li>
                  <li><code>GET /api/sales/summary</code> - Resumo de vendas</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Produtos (Products)</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><code>GET /api/products</code> - Lista produtos (paginado)</li>
                  <li><code>GET /api/products?search=termo</code> - Busca produtos</li>
                  <li><code>GET /api/products/[id]</code> - Detalhes do produto</li>
                  <li><code>GET /api/products/top-selling</code> - Produtos mais vendidos</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Lojas (Stores)</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><code>GET /api/stores</code> - Lista lojas (paginado)</li>
                  <li><code>GET /api/stores?active=true</code> - Lojas ativas</li>
                  <li><code>GET /api/stores/[id]</code> - Detalhes da loja</li>
                  <li><code>GET /api/stores/[id]/performance</code> - Performance da loja</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">Clientes (Customers)</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><code>GET /api/customers</code> - Lista clientes (paginado)</li>
                  <li><code>GET /api/customers/[id]</code> - Perfil do cliente</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">🏗️ Arquitetura</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Camada de Apresentação:</strong> API Routes em <code>/app/api</code></p>
              <p><strong>Camada de Serviço:</strong> Business Logic em <code>/lib/services</code></p>
              <p><strong>Camada de Repositório:</strong> Data Access em <code>/lib/repositories</code></p>
              <p><strong>Camada de Dados:</strong> Prisma ORM em <code>/lib/prisma</code></p>
              <p><strong>DTOs e Types:</strong> <code>/lib/dto</code> e <code>/lib/types</code></p>
              <p><strong>Middleware:</strong> <code>/lib/middleware</code></p>
            </div>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">🚀 Como Usar</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Configure a variável <code>DATABASE_URL</code> no arquivo <code>.env</code></li>
              <li>Execute <code>npm run prisma:generate</code> para gerar o Prisma Client</li>
              <li>Execute <code>npm run dev</code> para iniciar o servidor</li>
              <li>Acesse os endpoints em <code>http://localhost:3000/api/*</code></li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
