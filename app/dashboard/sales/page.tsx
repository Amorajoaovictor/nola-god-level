"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Componente Heatmap
function HeatmapChart({ data, selectedDays }: { data: any[]; selectedDays?: number[] }) {
  const allDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  // Se há dias selecionados, mostrar apenas eles; senão, mostrar todos
  const daysToShow = selectedDays && selectedDays.length > 0 
    ? selectedDays.sort((a, b) => a - b)
    : [0, 1, 2, 3, 4, 5, 6];
  
  const days = daysToShow.map(idx => allDays[idx]);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Criar matriz de dados apenas para os dias filtrados
  const matrix: number[][] = daysToShow.map(() => Array(24).fill(0));
  
  data.forEach((item) => {
    const dayIndex = daysToShow.indexOf(item.dayOfWeek);
    if (dayIndex !== -1) {
      matrix[dayIndex][item.hour] = item.totalSales;
    }
  });

  // Encontrar máximo para normalizar cores
  const maxSales = Math.max(...data.map(d => d.totalSales), 1);

  const getColor = (value: number) => {
    if (value === 0) return "#f1f5f9"; // slate-100
    const intensity = value / maxSales;
    if (intensity < 0.2) return "#dbeafe"; // blue-100
    if (intensity < 0.4) return "#93c5fd"; // blue-300
    if (intensity < 0.6) return "#60a5fa"; // blue-400
    if (intensity < 0.8) return "#3b82f6"; // blue-500
    return "#1d4ed8"; // blue-700
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header com horas */}
        <div className="flex mb-1">
          <div className="w-16"></div>
          {hours.map((hour) => (
            <div key={hour} className="flex-1 text-center text-xs text-slate-600 font-medium">
              {hour}h
            </div>
          ))}
        </div>

        {/* Matriz do heatmap */}
        {days.map((day, dayIndex) => (
          <div key={day} className="flex mb-1">
            <div className="w-16 flex items-center justify-end pr-2 text-xs font-medium text-slate-700">
              {day}
            </div>
            {hours.map((hour) => {
              const value = matrix[dayIndex][hour];
              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  className="flex-1 aspect-square flex items-center justify-center text-xs font-medium rounded border border-white hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                  style={{ backgroundColor: getColor(value) }}
                  title={`${day} ${hour}h: ${value} vendas`}
                >
                  {value > 0 ? value : ""}
                </div>
              );
            })}
          </div>
        ))}

        {/* Legenda */}
        <div className="mt-4 flex items-center gap-2 justify-center">
          <span className="text-xs text-slate-600">Menos vendas</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "#f1f5f9" }}></div>
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "#dbeafe" }}></div>
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "#93c5fd" }}></div>
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "#60a5fa" }}></div>
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "#3b82f6" }}></div>
            <div className="w-6 h-6 rounded" style={{ backgroundColor: "#1d4ed8" }}></div>
          </div>
          <span className="text-xs text-slate-600">Mais vendas</span>
        </div>
      </div>
    </div>
  );
}

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [salesByDay, setSalesByDay] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Filtros
  const [storeId, setStoreId] = useState<string>("");
  const [channelId, setChannelId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // Array de dias selecionados

  // Carregar lojas e canais
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [storesRes, channelsRes] = await Promise.all([
          fetch("/api/stores"),
          fetch("/api/channels"),
        ]);
        const storesData = await storesRes.json();
        const channelsData = await channelsRes.json();
        
        setStores(storesData.data || []);
        setChannels(channelsData.data || []);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (storeId) params.append("storeId", storeId);
        if (channelId) params.append("channelId", channelId);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (status) params.append("status", status);
        // Adicionar cada dia selecionado como parâmetro separado
        selectedDays.forEach(day => params.append("daysOfWeek", day.toString()));

        // Params para heatmap (COM os dias selecionados para filtrar o heatmap)
        const heatmapParams = new URLSearchParams();
        if (storeId) heatmapParams.append("storeId", storeId);
        if (channelId) heatmapParams.append("channelId", channelId);
        if (startDate) heatmapParams.append("startDate", startDate);
        if (endDate) heatmapParams.append("endDate", endDate);
        if (status) heatmapParams.append("status", status);
        selectedDays.forEach(day => heatmapParams.append("daysOfWeek", day.toString()));
        if (!startDate && !endDate) {
          heatmapParams.set("days", "30");
        }

        // Se não houver filtro de data, usar últimos 30 dias para os gráficos
        const chartParams = new URLSearchParams(params);
        if (!startDate && !endDate) {
          chartParams.set("days", "30");
        }

        const [salesRes, summaryRes, byDayRes, heatmapRes] = await Promise.all([
          fetch(`/api/sales?${params}`),
          fetch(`/api/sales/summary?${params}`),
          fetch(`/api/sales/by-day?${chartParams}`),
          fetch(`/api/sales/heatmap?${heatmapParams}`),
        ]);
        
        const salesData = await salesRes.json();
        const summaryData = await summaryRes.json();
        const byDayData = await byDayRes.json();
        const heatmapDataRes = await heatmapRes.json();
        
        setSales(salesData.data || []);
        setTotal(salesData.pagination?.total || 0);
        setSummary(summaryData.data || {});
        setSalesByDay(byDayData.data || []);
        setHeatmapData(heatmapDataRes.data || []);
      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [page, storeId, channelId, startDate, endDate, status, selectedDays]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Vendas</h1>
              <p className="text-sm text-slate-600">
                Análise detalhada de todas as vendas
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={storeId}
                onChange={(e) => {
                  setStoreId(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as lojas</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <select
                value={channelId}
                onChange={(e) => {
                  setChannelId(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os canais</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="COMPLETED">Completa</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Exportar
              </button>
            </div>
          </div>
          
          {/* Date Filters */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">De:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">Até:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Day of Week Filter with Checkboxes */}
          <div className="mt-4 flex items-start gap-4">
            <label className="text-sm font-medium text-slate-600 pt-2">Dias da Semana:</label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 0, label: "Dom" },
                { value: 1, label: "Seg" },
                { value: 2, label: "Ter" },
                { value: 3, label: "Qua" },
                { value: 4, label: "Qui" },
                { value: 5, label: "Sex" },
                { value: 6, label: "Sáb" },
              ].map((day) => (
                <label
                  key={day.value}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  style={{
                    backgroundColor: selectedDays.includes(day.value) ? "#dbeafe" : "transparent",
                    borderColor: selectedDays.includes(day.value) ? "#3b82f6" : "#cbd5e1",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDays([...selectedDays, day.value]);
                      } else {
                        setSelectedDays(selectedDays.filter(d => d !== day.value));
                      }
                      setPage(1);
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">{day.label}</span>
                </label>
              ))}
            </div>
            {(storeId || channelId || startDate || endDate || status || selectedDays.length > 0) && (
              <button
                onClick={() => {
                  setStoreId("");
                  setChannelId("");
                  setStartDate("");
                  setEndDate("");
                  setStatus("");
                  setSelectedDays([]);
                  setPage(1);
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Total de Vendas</p>
            <p className="text-2xl font-bold text-slate-900">{(summary.totalSales || 0).toLocaleString("pt-BR")}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Faturamento</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(Number(summary.totalRevenue || 0))}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Vendas Completas</p>
            <p className="text-2xl font-bold text-green-600">
              {(summary.completedSales || 0).toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Vendas Canceladas</p>
            <p className="text-2xl font-bold text-red-600">
              {(summary.cancelledSales || 0).toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sales Trend Line Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Evolução de Vendas {startDate || endDate ? "- Período Filtrado" : "- Últimos 30 Dias"}
              </h3>
            {salesByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("pt-BR");
                    }}
                    formatter={(value: any) => value.toLocaleString("pt-BR")}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSales"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Vendas"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                Sem dados disponíveis
              </div>
            )}
          </div>

          {/* Revenue Area Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Faturamento Diário {startDate || endDate ? "- Período Filtrado" : "- Últimos 30 Dias"}
            </h3>
            {salesByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesByDay}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("pt-BR");
                    }}
                    formatter={(value: any) =>
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(value)
                    }
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Receita"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                Sem dados disponíveis
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Heatmap - Sales by Day of Week and Hour */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Mapa de Calor - Vendas por Dia da Semana e Hora
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {startDate && endDate 
                  ? `Período: ${new Date(startDate).toLocaleDateString('pt-BR')} a ${new Date(endDate).toLocaleDateString('pt-BR')}`
                  : startDate 
                  ? `A partir de ${new Date(startDate).toLocaleDateString('pt-BR')}`
                  : endDate
                  ? `Até ${new Date(endDate).toLocaleDateString('pt-BR')}`
                  : 'Últimos 30 dias'
                }
                {heatmapData.length > 0 && (
                  <span className="ml-2">• {heatmapData.length} horários com vendas</span>
                )}
              </p>
            </div>
            {heatmapData.length > 0 ? (
              <div className="overflow-x-auto">
                <HeatmapChart data={heatmapData} selectedDays={selectedDays} />
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-slate-500">
                Sem dados disponíveis para o período selecionado
              </div>
            )}
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Desconto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Valor Pago
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      Nenhuma venda encontrada
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        #{sale.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(sale.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {sale.customerName || "Sem nome"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            sale.saleStatusDesc === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sale.saleStatusDesc}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900">
                        {formatCurrency(Number(sale.totalAmount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-600">
                        {formatCurrency(Number(sale.totalDiscount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-slate-900">
                        {formatCurrency(Number(sale.valuePaid))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de{" "}
              {total.toLocaleString("pt-BR")} vendas
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
