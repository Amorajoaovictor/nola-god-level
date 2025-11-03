"use client";

import { useEffect, useState, useCallback } from "react";
import AddToSlideButton from "@/components/presentation/AddToSlideButton";

const CACHE_KEY = "products_global_stats";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos em ms

export default function ProductsPage() {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [globalStats, setGlobalStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshingStats, setRefreshingStats] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [limit, setLimit] = useState(20);
  
  // Estados de filtro
  const [stores, setStores] = useState<any[]>([]);
  const [storeId, setStoreId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Buscar lista de lojas
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch("/api/stores");
        const data = await res.json();
        setStores(data.data || []);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };
    fetchStores();
  }, []);

  // Função para buscar stats globais com cache (agora com filtros)
  const fetchGlobalStats = useCallback(async (forceRefresh = false, filters?: { storeId?: string, startDate?: string, endDate?: string }) => {
    // Se houver filtros, não usar cache
    const useCache = !filters?.storeId && !filters?.startDate && !filters?.endDate;
    
    // Verifica cache apenas se não houver filtros
    if (!forceRefresh && useCache) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < CACHE_DURATION) {
          setGlobalStats(data);
          setLastUpdate(new Date(timestamp));
          return data;
        }
      }
    }

    // Busca dados novos
    setRefreshingStats(true);
    try {
      // Construir query params
      const params = new URLSearchParams();
      if (filters?.storeId) params.append('storeId', filters.storeId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      
      const queryString = params.toString();
      
      const [countRes, statsRes] = await Promise.all([
        fetch(`/api/products/count${queryString ? `?${queryString}` : ''}`),
        fetch(`/api/products/stats${queryString ? `?${queryString}` : ''}`),
      ]);
      const countData = await countRes.json();
      const statsData = await statsRes.json();

      const newStats = statsData.data || {};
      const total = countData.data?.total || 0;

      // Salva no cache apenas se não houver filtros
      if (useCache) {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: newStats,
            timestamp: Date.now(),
          })
        );
      }

      setGlobalStats(newStats);
      setTotalProducts(total);
      setLastUpdate(new Date());
      
      return newStats;
    } catch (error) {
      console.error("Error fetching global stats:", error);
    } finally {
      setRefreshingStats(false);
    }
  }, []);

  // Atualização automática a cada 10 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchGlobalStats(true);
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchGlobalStats]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Monta parâmetros com filtros
        const params = new URLSearchParams({ limit: limit.toString() });
        if (storeId) params.append("storeId", storeId);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        
        const [productsRes] = await Promise.all([
          fetch(`/api/products/top-selling?${params.toString()}`),
          fetchGlobalStats(false, { storeId, startDate, endDate }), // Passa filtros para stats
        ]);
        const productsData = await productsRes.json();
        
        setTopProducts(productsData.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit, fetchGlobalStats, storeId, startDate, endDate]);

  const handleRefreshStats = () => {
    fetchGlobalStats(true, { storeId, startDate, endDate });
  };

  const exportProductsToCSV = async () => {
    try {
      const res = await fetch(`/api/products/top-selling?limit=1000`);
      const data = await res.json();
      
      const csvData = [
        ["ID", "Nome", "Categoria", "Quantidade Vendida", "Receita Total", "Preço Médio", "Número de Vendas"],
        ...(data.data || []).map((item: any) => [
          item.product?.id || "-",
          `"${(item.product?.name || "-").replace(/"/g, '""')}"`,
          `"${(item.product?.category?.name || "-").replace(/"/g, '""')}"`,
          item.totalQuantity || 0,
          `R$ ${(item.totalRevenue || 0).toFixed(2)}`,
          item.totalQuantity > 0 ? `R$ ${((item.totalRevenue || 0) / item.totalQuantity).toFixed(2)}` : "R$ 0.00",
          item.salesCount || 0
        ])
      ];

      const csv = csvData.map(row => row.join(",")).join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `produtos_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting products:", error);
      alert("Erro ao exportar produtos. Tente novamente.");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalRevenue = topProducts.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
  const totalQuantity = topProducts.reduce((sum, p) => sum + (p.totalQuantity || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Produtos</h1>
              <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                <p className="text-sm text-slate-600">
                  Análise de performance dos produtos
                </p>
                {lastUpdate && (
                  <span className="text-xs text-slate-400">
                    • Atualizado {lastUpdate.toLocaleTimeString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
                {(storeId || startDate || endDate) && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">●</span>
                )}
              </button>
              
              <button
                onClick={handleRefreshStats}
                disabled={refreshingStats}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg
                  className={`w-4 h-4 ${refreshingStats ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {refreshingStats ? "Atualizando..." : "Atualizar"}
              </button>
              
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
              
              <button 
                onClick={exportProductsToCSV}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Painel de Filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Loja
                </label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as lojas</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setStoreId("");
                  setStartDate("");
                  setEndDate("");
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Limpar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="space-y-6 mb-6 md:mb-8">
          {/* Header com botão para adicionar ao slide */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Métricas dos Produtos</h2>
            <AddToSlideButton
              title="Métricas Globais de Produtos"
              type="metrics"
              data={[
                {
                  label: 'Total de Produtos',
                  value: totalProducts,
                  format: 'number',
                  color: 'slate',
                  subtitle: (storeId || startDate || endDate) 
                    ? "Produtos vendidos no filtro"
                    : "Cadastrados no sistema"
                },
                {
                  label: `Receita Total ${(storeId || startDate || endDate) ? "(Filtrada)" : ""}`,
                  value: globalStats.totalRevenue || 0,
                  format: 'currency',
                  color: 'green',
                  subtitle: (storeId || startDate || endDate) 
                    ? "Produtos no período/loja selecionada"
                    : "Todos os produtos vendidos"
                },
                {
                  label: `Quantidade Total ${(storeId || startDate || endDate) ? "(Filtrada)" : ""}`,
                  value: globalStats.totalQuantity || 0,
                  format: 'number',
                  color: 'blue',
                  subtitle: (storeId || startDate || endDate) 
                    ? "Unidades no período/loja selecionada"
                    : "Unidades vendidas (total)"
                }
              ]}
              variant="ghost"
            />
          </div>
          
          {/* Linha 1 - Métricas Globais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-slate-600 mb-1">
                Total de Produtos
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {totalProducts.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {(storeId || startDate || endDate) 
                  ? "Produtos vendidos no filtro"
                  : "Cadastrados no sistema"}
              </p>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-slate-600 mb-1">
                Receita Total {(storeId || startDate || endDate) && "(Filtrada)"}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(globalStats.totalRevenue || 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {(storeId || startDate || endDate) 
                  ? "Produtos no período/loja selecionada"
                  : "Todos os produtos vendidos"}
              </p>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-slate-600 mb-1">
                Quantidade Total {(storeId || startDate || endDate) && "(Filtrada)"}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {(globalStats.totalQuantity || 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {(storeId || startDate || endDate) 
                  ? "Unidades no período/loja selecionada"
                  : "Unidades vendidas (total)"}
              </p>
            </div>
          </div>

          {/* Linha 2 - Métricas do Top N */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 md:p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-emerald-900 mb-1">
                Receita (Top {limit})
              </p>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Exibindo top {topProducts.length} produtos mais vendidos
              </p>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-4 md:p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-sky-900 mb-1">
                Quantidade (Top {limit})
              </p>
              <p className="text-2xl font-bold text-sky-700">
                {totalQuantity.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-sky-600 mt-1">
                Unidades dos produtos listados
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Top {limit} Produtos Mais Vendidos
            </h2>
            <AddToSlideButton
              title={`Top ${topProducts.length} Produtos Mais Vendidos`}
              type="table"
              data={topProducts.map((item, index) => ({
                posicao: index + 1,
                produto: item.product?.name || "N/A",
                categoria: item.product?.category?.name || "N/A",
                quantidade: item.totalQuantity?.toLocaleString('pt-BR') || '0',
                receita: `R$ ${(item.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                precoMedio: `R$ ${(item.totalRevenue && item.totalQuantity ? (item.totalRevenue / item.totalQuantity) : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              }))}
              config={{
                columns: [
                  { key: 'posicao', label: '#' },
                  { key: 'produto', label: 'Produto' },
                  { key: 'categoria', label: 'Categoria' },
                  { key: 'quantidade', label: 'Quantidade' },
                  { key: 'receita', label: 'Receita Total' },
                  { key: 'precoMedio', label: 'Preço Médio' },
                ]
              }}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-center text-slate-500 py-12">
              Nenhum produto encontrado
            </p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((item, index) => {
                const avgPrice = item.totalRevenue && item.totalQuantity 
                  ? item.totalRevenue / item.totalQuantity 
                  : 0;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg shadow-md">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {item.product?.name || "Produto"}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-slate-600">
                            {item.product?.category?.name || "Sem categoria"}
                          </span>
                          <span className="text-sm text-slate-500">
                            • Preço médio: {formatCurrency(avgPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 text-right">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Quantidade</p>
                        <p className="text-lg font-bold text-slate-900">
                          {item.totalQuantity?.toLocaleString("pt-BR") || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Receita</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(item.totalRevenue || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Pedidos</p>
                        <p className="text-lg font-bold text-blue-600">
                          {item.salesCount?.toLocaleString("pt-BR") || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Insights Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Insight: Produto mais popular
            </h3>
            <p className="text-blue-800">
              {topProducts[0]?.product?.name || "N/A"} lidera com{" "}
              {topProducts[0]?.totalQuantity?.toLocaleString("pt-BR") || 0} unidades vendidas.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              💰 Insight: Maior receita
            </h3>
            <p className="text-green-800">
              {topProducts[0]?.product?.name || "N/A"} gerou{" "}
              {formatCurrency(topProducts[0]?.totalRevenue || 0)} em receita total.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
