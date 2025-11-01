export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Nola Analytics
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Transforme seus dados de restaurante em insights acionáveis. 
            Analytics poderoso e simples para foodservice.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Dashboard Completo</h3>
            <p className="text-slate-600">
              Visualize faturamento, vendas e métricas operacionais em tempo real
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-green-600 text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Análise Flexível</h3>
            <p className="text-slate-600">
              Filtre por loja, canal, período e produto para insights personalizados
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-purple-600 text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Decisões Rápidas</h3>
            <p className="text-slate-600">
              Identifique tendências e anomalias para agir imediatamente
            </p>
          </div>
        </div>

        <div className="text-center space-x-4">
          <a
            href="/dashboard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Acessar Dashboard
          </a>
          <a
            href="/docs"
            className="inline-block bg-white text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors border border-slate-300"
          >
            Ver Documentação
          </a>
        </div>
      </div>
    </div>
  );
}
