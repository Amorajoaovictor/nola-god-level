"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CACHE_KEY = "dashboard_summary";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos em ms

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Estados de lojas
  const [stores, setStores] = useState<any[]>([]);
  const [storeId, setStoreId] = useState("");
  
  // Estado de mês/ano selecionado
  const [selectedMonthYear, setSelectedMonthYear] = useState<string>("");
  
  // Estados aplicados (usados na busca)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Atualizar startDate e endDate quando selectedMonthYear muda
  useEffect(() => {
    if (selectedMonthYear) {
      const [year, month] = selectedMonthYear.split('-');
      const firstDay = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const lastDayStr = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
      
      setStartDate(firstDay);
      setEndDate(lastDayStr);
    } else {
      setStartDate("");
      setEndDate("");
    }
  }, [selectedMonthYear]);
  
  // Gerar opções de mês/ano
  const generateMonthYearOptions = () => {
    const options: { value: string; label: string }[] = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    // Gerar últimos 36 meses (3 anos)
    for (let i = 0; i < 36; i++) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthStr = String(month + 1).padStart(2, '0');
      
      options.push({
        value: `${year}-${monthStr}`,
        label: `${months[month]}/${year}`
      });
    }
    
    return options;
  };
  
  const monthYearOptions = generateMonthYearOptions();
  
  // Helper para formatar data no badge
  const formatMonthYear = (dateStr: string) => {
    if (!dateStr) return "";
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                   "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const [year, month] = dateStr.split('-');
    return `${months[parseInt(month) - 1]}/${year}`;
  };

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

  // Função para buscar summary com cache
  const fetchSummary = useCallback(async (forceRefresh = false) => {
    const cacheKey = `${CACHE_KEY}_${storeId}_${startDate}_${endDate}`;
    
    // Verifica cache
    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < CACHE_DURATION) {
          setSummary(data);
          setLastUpdate(new Date(timestamp));
          return data;
        }
      }
    }

    // Busca dados novos
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (storeId) params.append("storeId", storeId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      
      console.log('Fetching summary with params:', params.toString());
      
      const summaryRes = await fetch(`/api/sales/summary?${params.toString()}`);
      const summaryData = await summaryRes.json();
      const newSummary = summaryData.data;

      console.log('Summary received:', newSummary);

      // Salva no cache
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: newSummary,
          timestamp: Date.now(),
        })
      );

      setSummary(newSummary);
      setLastUpdate(new Date());
      
      return newSummary;
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setRefreshing(false);
    }
  }, [storeId, startDate, endDate]);

  // Atualização automática a cada 10 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSummary(true);
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchSummary]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Busca summary primeiro
        await fetchSummary();
        
        // Monta parâmetros para produtos com filtro de data e loja
        const params = new URLSearchParams({ limit: "5" });
        if (storeId) params.append("storeId", storeId);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        
        const [productsRes, countRes] = await Promise.all([
          fetch(`/api/products/top-selling?${params.toString()}`),
          fetch(`/api/products/count`),
        ]);

        const productsData = await productsRes.json();
        const countData = await countRes.json();
        
        setTopProducts(productsData.data || []);
        setTotalProducts(countData.data?.total || 0);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, startDate, endDate]);

  const handleRefresh = () => {
    fetchSummary(true);
  };

  const exportToCSV = () => {
    const data = [
      ["Métrica", "Valor"],
      ["Total de Vendas", summary?.totalSales?.toString() || "0"],
      ["Receita Total", summary?.totalRevenue ? `R$ ${summary.totalRevenue.toFixed(2)}` : "R$ 0,00"],
      ["Ticket Médio", summary?.averageTicket ? `R$ ${summary.averageTicket.toFixed(2)}` : "R$ 0,00"],
      ["Vendas Finalizadas", summary?.completedSales?.toString() || "0"],
      ["Vendas Canceladas", summary?.cancelledSales?.toString() || "0"],
      ["Vendas Pendentes", summary?.pendingSales?.toString() || "0"],
      [""],
      ["Top 5 Produtos"],
      ["Produto", "Categoria", "Quantidade Vendida", "Receita Total"],
      ...topProducts.map(item => [
        item.product?.name || "-",
        item.product?.category?.name || "-",
        item.totalQuantity?.toString() || "0",
        `R$ ${(item.totalRevenue || 0).toFixed(2)}`
      ])
    ];

    const csv = data.map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `dashboard_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-600">Overview das métricas principais</p>
                {lastUpdate && (
                  <span className="text-xs text-slate-400">
                    • Atualizado {lastUpdate.toLocaleTimeString("pt-BR")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Filtro de Loja */}
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as lojas</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              
              {/* Filtro de Mês/Ano */}
              <select
                value={selectedMonthYear}
                onChange={(e) => setSelectedMonthYear(e.target.value)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
              >
                <option value="">Todos os períodos</option>
                {monthYearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
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
                {refreshing ? "Atualizando..." : "Atualizar"}
              </button>
              <button 
                onClick={exportToCSV}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros Ativos */}
      {(storeId || selectedMonthYear) && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-900">Filtros ativos:</span>
                {storeId && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Loja: {stores.find(s => s.id.toString() === storeId)?.name}
                  </span>
                )}
                {selectedMonthYear && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    Período: {monthYearOptions.find(opt => opt.value === selectedMonthYear)?.label}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setStoreId("");
                  setSelectedMonthYear("");
                }}
                className="text-sm text-blue-700 hover:text-blue-900 font-medium"
              >
                Limpar todos os filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Faturamento Total</p>
              <span className="text-green-600">📈</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {summary && summary.totalRevenue !== undefined 
                ? formatCurrency(Number(summary.totalRevenue)) 
                : loading ? "..." : "R$ 0,00"}
            </p>
            <p className="text-xs text-slate-500 mt-2">Vendas + taxas + fretes</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total de Vendas</p>
              <span className="text-blue-600">🛒</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {summary && summary.totalSales !== undefined 
                ? Number(summary.totalSales).toLocaleString("pt-BR") 
                : loading ? "..." : "0"}
            </p>
            <p className="text-xs text-slate-500 mt-2">Pedidos realizados</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Ticket Médio</p>
              <span className="text-purple-600">💰</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {summary && summary.averageTicket !== undefined 
                ? formatCurrency(Number(summary.averageTicket)) 
                : loading ? "..." : "R$ 0,00"}
            </p>
            <p className="text-xs text-slate-500 mt-2">Por pedido</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Produtos Ativos</p>
              <span className="text-orange-600">📦</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? "..." : totalProducts.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-slate-500 mt-2">No catálogo</p>
          </div>
        </div>

        {/* Info Card - Diferença entre Faturamento e Receita de Produtos */}
        {summary && topProducts.length > 0 && (() => {
          const totalProductRevenue = topProducts.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
          const difference = Number(summary.totalRevenue) - totalProductRevenue;
          const percentageDiff = (difference / Number(summary.totalRevenue)) * 100;
          
          return difference > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Diferença entre Faturamento Total e Receita de Produtos
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Faturamento Total:</strong> {formatCurrency(Number(summary.totalRevenue))} (inclui produtos + taxas + fretes + ajustes)
                    <br />
                    <strong>Receita de Produtos:</strong> {formatCurrency(totalProductRevenue)} (apenas valor dos produtos)
                    <br />
                    <strong>Diferença:</strong> <span className="font-bold text-blue-900">{formatCurrency(difference)}</span> ({percentageDiff.toFixed(2)}%)
                  </p>
                  <p className="text-xs text-blue-700">
                    Esta diferença representa taxas de entrega, serviços adicionais, ajustes de preço e outros valores não relacionados diretamente aos produtos.
                  </p>
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Top Products Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Top 5 Produtos - Quantidade Vendida
            </h3>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="product.name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => value.toLocaleString("pt-BR")}
                    labelStyle={{ color: "#1e293b" }}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalQuantity"
                    fill="#3b82f6"
                    name="Quantidade"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                Sem dados disponíveis
              </div>
            )}
          </div>

          {/* Revenue Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Distribuição de Receita - Top 5
            </h3>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalRevenue"
                    nameKey="product.name"
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) =>
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(value)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                Sem dados disponíveis
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Top 5 Produtos Mais Vendidos
            </h3>
            <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              💡 Receita apenas dos produtos (sem taxas)
            </div>
          </div>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.product?.name || "Produto"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.product?.category?.name || "Sem categoria"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {item.totalQuantity?.toLocaleString("pt-BR") || 0} vendas
                    </p>
                    <p className="text-sm text-slate-600">
                      {item.totalRevenue ? formatCurrency(item.totalRevenue) : "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Nenhum dado disponível</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <a
            href="/dashboard/sales"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">📊 Análise de Vendas</h3>
            <p className="text-slate-600">
              Explore vendas por período, canal e loja com filtros avançados
            </p>
          </a>

          <a
            href="/dashboard/products"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">🍔 Produtos</h3>
            <p className="text-slate-600">
              Analise performance de produtos e categorias
            </p>
          </a>

          <a
            href="/dashboard/stores"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">🏪 Lojas</h3>
            <p className="text-slate-600">
              Compare performance entre lojas e canais de venda
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
