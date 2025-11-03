"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DeliveryStats {
  avgDeliveryTime: number;
  avgPreparationTime: number;
  minDeliveryTime: number;
  maxDeliveryTime: number;
  totalOrders: number;
  storeStats: Array<{
    storeName: string;
    count: number;
    avgDeliveryTime: number;
    avgPreparationTime: number;
  }>;
}

interface ProductByDay {
  dayOfWeek: number;
  dayName: string;
  products: Array<{
    productId: number;
    productName: string;
    category: string;
    quantity: number;
    revenue: number;
  }>;
}

export default function OrdersPage() {
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats | null>(null);
  const [productsByDay, setProductsByDay] = useState<ProductByDay[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  useEffect(() => {
    fetchStores();
  }, []);

  // Carregar dados inicialmente (sem filtros)
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/stores");
      const data = await response.json();
      setStores(data.data || []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      selectedStores.forEach(id => params.append("storeId", id.toString()));
      selectedDaysOfWeek.forEach(day => params.append("daysOfWeek", day.toString()));
      
      if (selectedMonth) {
        const [year, month] = selectedMonth.split("-");
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
        params.append("startDate", startDate.toISOString());
        params.append("endDate", endDate.toISOString());
      }

      // Limitar a 3 produtos por dia para acelerar
      params.append("limit", "3");

      console.log('Fetching data with params:', params.toString());

      // Timeout de 8 segundos para as requisições
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );

      const [deliveryResponse, productsResponse] = await Promise.race([
        Promise.all([
          fetch(`/api/sales/delivery-times?${params.toString()}`),
          fetch(`/api/sales/products-by-day?${params.toString()}`),
        ]),
        timeoutPromise
      ]) as [Response, Response];

      console.log('Response status:', { delivery: deliveryResponse.status, products: productsResponse.status });

      if (!deliveryResponse.ok || !productsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const deliveryData = await deliveryResponse.json();
      const productsData = await productsResponse.json();

      console.log('Data received:', { deliveryData, productsData });

      setDeliveryStats(deliveryData);
      setProductsByDay(productsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Define valores padrão em caso de erro
      setDeliveryStats({
        avgDeliveryTime: 0,
        avgPreparationTime: 0,
        minDeliveryTime: 0,
        maxDeliveryTime: 0,
        totalOrders: 0,
        storeStats: []
      });
      setProductsByDay([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleClearFilters = () => {
    setSelectedStores([]);
    setSelectedDaysOfWeek([]);
    setSelectedMonth("");
    setTimeout(fetchData, 100);
  };

  const toggleStore = (storeId: number) => {
    setSelectedStores(prev =>
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  const toggleDayOfWeek = (day: number) => {
    setSelectedDaysOfWeek(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 mb-2">Carregando dados dos pedidos...</p>
          <p className="text-sm text-slate-400">Analisando milhares de pedidos, pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">📦 Análise de Pedidos</h1>
          <p className="text-slate-600">Tempo de entrega, produtos populares e performance por dia</p>
        </div>

        {/* Info sobre período */}
        {!selectedMonth && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              ℹ️ <strong>Dados dos últimos 30 dias</strong> - Use os filtros abaixo para analisar períodos específicos
            </p>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">🔍 Filtros</h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-4">
            {/* Filtro de Lojas */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Lojas {selectedStores.length > 0 && `(${selectedStores.length} selecionadas)`}
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
                {stores.map((store) => (
                  <label key={store.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(store.id)}
                      onChange={() => toggleStore(store.id)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-slate-700">{store.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro de Dia da Semana */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dias da Semana {selectedDaysOfWeek.length > 0 && `(${selectedDaysOfWeek.length} selecionados)`}
              </label>
              <div className="space-y-2 border border-slate-200 rounded-lg p-3">
                {dayNames.map((day, index) => (
                  <label key={index} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedDaysOfWeek.includes(index)}
                      onChange={() => toggleDayOfWeek(index)}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm text-slate-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtro de Mês */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mês/Ano
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os períodos</option>
                {generateMonthOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApplyFilters}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Carregando..." : "Aplicar Filtros"}
            </button>
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-2">⏱️ Tempo Médio de Entrega</p>
            <p className="text-3xl font-bold text-blue-600">
              {deliveryStats ? formatTime(deliveryStats.avgDeliveryTime) : "-"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-2">👨‍🍳 Tempo Médio de Preparo</p>
            <p className="text-3xl font-bold text-purple-600">
              {deliveryStats ? formatTime(deliveryStats.avgPreparationTime) : "-"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-2">🚀 Entrega Mais Rápida</p>
            <p className="text-3xl font-bold text-green-600">
              {deliveryStats ? formatTime(deliveryStats.minDeliveryTime) : "-"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-2">🐌 Entrega Mais Lenta</p>
            <p className="text-3xl font-bold text-red-600">
              {deliveryStats ? formatTime(deliveryStats.maxDeliveryTime) : "-"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-2">📊 Total de Pedidos</p>
            <p className="text-3xl font-bold text-slate-900">
              {deliveryStats ? deliveryStats.totalOrders.toLocaleString('pt-BR') : "-"}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Tempo de Entrega por Loja */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              ⏱️ Tempo Médio de Entrega por Loja
            </h3>
            {deliveryStats && deliveryStats.storeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryStats.storeStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="storeName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value: any) => [`${Math.round(value)} min`, '']}
                    labelFormatter={(label) => `Loja: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="avgDeliveryTime" fill="#3B82F6" name="Tempo de Entrega" />
                  <Bar dataKey="avgPreparationTime" fill="#8B5CF6" name="Tempo de Preparo" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">Nenhum dado disponível</p>
            )}
          </div>

          {/* Pedidos por Loja */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              📊 Distribuição de Pedidos por Loja
            </h3>
            {deliveryStats && deliveryStats.storeStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deliveryStats.storeStats}
                    dataKey="count"
                    nameKey="storeName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.storeName}: ${entry.count}`}
                  >
                    {deliveryStats.storeStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-slate-500 py-8">Nenhum dado disponível</p>
            )}
          </div>
        </div>

        {/* Produtos Populares por Dia */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            🍔 Produtos Mais Populares por Dia da Semana
          </h3>
          
          {productsByDay.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsByDay.map((day) => (
                <div key={day.dayOfWeek} className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">
                      {day.dayOfWeek === 0 ? '🌞' : day.dayOfWeek === 6 ? '🎉' : '📅'}
                    </span>
                    {day.dayName}
                  </h4>
                  
                  <div className="space-y-2">
                    {day.products.slice(0, 3).map((product, index) => (
                      <div key={product.productId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-bold text-slate-400">#{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {product.productName}
                            </p>
                            <p className="text-xs text-slate-500">{product.category}</p>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-semibold text-blue-600">
                            {product.quantity}x
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              Nenhum dado disponível para o período selecionado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
