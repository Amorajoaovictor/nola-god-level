"use client";

import { useEffect, useState } from "react";
import AddToSlideButton from "@/components/presentation/AddToSlideButton";

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState("");
  const [showRegionFilter, setShowRegionFilter] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  const [showStoreDetails, setShowStoreDetails] = useState<number | null>(null);
  const [storePerformance, setStorePerformance] = useState<any>(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/stores");
        const data = await res.json();
        setStores(data.data || []);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const activeStores = stores.filter((s) => s.isActive).length;
  const ownStores = stores.filter((s) => s.isOwn).length;

  // Filtrar lojas por região
  const filteredStores = regionFilter
    ? stores.filter((s) => s.state === regionFilter)
    : stores;

  // Obter lista única de estados
  const states = Array.from(new Set(stores.map((s) => s.state))).sort();

  const handleCompareToggle = () => {
    if (compareMode && selectedStores.length > 0) {
      // Se estava em modo comparação e tinha lojas selecionadas, mostra o modal
      compareStores();
    }
    setCompareMode(!compareMode);
    setSelectedStores([]);
  };

  const compareStores = async () => {
    if (selectedStores.length < 2) {
      alert("Selecione pelo menos 2 lojas para comparar");
      return;
    }

    setLoadingPerformance(true);
    try {
      const promises = selectedStores.map(async (storeId) => {
        const res = await fetch(`/api/sales/summary?storeId=${storeId}`);
        const data = await res.json();
        const store = stores.find((s) => s.id === storeId);
        return {
          store,
          performance: data.data,
        };
      });

      const results = await Promise.all(promises);
      setComparisonData(results);
      setShowComparison(true);
      setCompareMode(false);
      setSelectedStores([]);
    } catch (error) {
      console.error("Error comparing stores:", error);
      alert("Erro ao comparar lojas");
    } finally {
      setLoadingPerformance(false);
    }
  };

  const handleStoreSelection = (storeId: number) => {
    if (selectedStores.includes(storeId)) {
      setSelectedStores(selectedStores.filter((id) => id !== storeId));
    } else {
      if (selectedStores.length < 3) {
        setSelectedStores([...selectedStores, storeId]);
      } else {
        alert("Você pode comparar no máximo 3 lojas");
      }
    }
  };

  const viewPerformance = async (storeId: number) => {
    setLoadingPerformance(true);
    setStorePerformance(null);
    try {
      const res = await fetch(`/api/sales/summary?storeId=${storeId}`);
      const data = await res.json();
      setStorePerformance({ storeId, data: data.data });
    } catch (error) {
      console.error("Error fetching performance:", error);
      alert("Erro ao buscar performance da loja");
    } finally {
      setLoadingPerformance(false);
    }
  };

  const viewDetails = (storeId: number) => {
    setShowStoreDetails(storeId);
  };

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
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Lojas</h1>
              <p className="text-sm text-slate-600">
                Gestão e análise de performance das lojas
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setShowRegionFilter(!showRegionFilter)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrar por Região
                  {regionFilter && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">●</span>
                  )}
                </button>

                {showRegionFilter && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-10 p-4">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Filtrar por Estado</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <button
                        onClick={() => {
                          setRegionFilter("");
                          setShowRegionFilter(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 ${
                          !regionFilter ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700"
                        }`}
                      >
                        Todas as regiões
                      </button>
                      {states.map((state) => (
                        <button
                          key={state}
                          onClick={() => {
                            setRegionFilter(state);
                            setShowRegionFilter(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-slate-50 ${
                            regionFilter === state ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700"
                          }`}
                        >
                          {state} ({stores.filter((s) => s.state === state).length})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <button
                  onClick={handleCompareToggle}
                  className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg ${
                    compareMode
                      ? "text-white bg-blue-600 hover:bg-blue-700"
                      : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {compareMode ? `Selecionadas: ${selectedStores.length}/3` : "Comparar Lojas"}
                </button>

                {compareMode && selectedStores.length >= 2 && (
                  <button
                    onClick={compareStores}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Visualizar Comparação
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Stats Cards */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Estatísticas das Lojas</h2>
          <AddToSlideButton
            title="Estatísticas das Lojas"
            type="metrics"
            data={[
              {
                label: 'Total de Lojas',
                value: stores.length,
                format: 'number',
                color: 'slate'
              },
              {
                label: 'Lojas Ativas',
                value: activeStores,
                format: 'number',
                color: 'green'
              },
              {
                label: 'Lojas Próprias',
                value: ownStores,
                format: 'number',
                color: 'blue'
              },
              {
                label: 'Franquias',
                value: stores.length - ownStores,
                format: 'number',
                color: 'purple'
              }
            ]}
            variant="ghost"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Total de Lojas</p>
            <p className="text-2xl font-bold text-slate-900">{stores.length}</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Lojas Ativas</p>
            <p className="text-2xl font-bold text-green-600">{activeStores}</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Lojas Próprias</p>
            <p className="text-2xl font-bold text-blue-600">{ownStores}</p>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Franquias</p>
            <p className="text-2xl font-bold text-purple-600">
              {stores.length - ownStores}
            </p>
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500">
                {regionFilter ? `Nenhuma loja encontrada em ${regionFilter}` : "Nenhuma loja encontrada"}
              </p>
            </div>
          ) : (
            filteredStores.slice(0, 12).map((store) => (
              <div
                key={store.id}
                className={`bg-white rounded-lg shadow-sm p-4 md:p-6 hover:shadow-md transition-all ${
                  compareMode && selectedStores.includes(store.id)
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                {compareMode && (
                  <div className="mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store.id)}
                        onChange={() => handleStoreSelection(store.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Selecionar para comparar</span>
                    </label>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">
                      {store.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {store.city}, {store.state}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      store.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {store.isActive ? "Ativa" : "Inativa"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>📍</span>
                    <span>
                      {store.addressStreet}, {store.addressNumber || "S/N"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>📮</span>
                    <span>{store.zipcode || "CEP não informado"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>🏢</span>
                    <span>{store.isOwn ? "Loja Própria" : "Franquia"}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex gap-2">
                  <button
                    onClick={() => viewPerformance(store.id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                  >
                    Ver Performance
                  </button>
                  <button
                    onClick={() => viewDetails(store.id)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    Detalhes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map Placeholder */}
        {stores.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Mapa de Lojas
            </h2>
            <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <span className="text-6xl mb-4 block">🗺️</span>
                <p className="text-slate-600">
                  Visualização de mapa com localização das lojas
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  (Integração com Google Maps / Mapbox disponível)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Performance */}
        {storePerformance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    Performance da Loja
                  </h2>
                  <button
                    onClick={() => setStorePerformance(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <h3 className="font-semibold text-lg text-slate-900 mb-4">
                  {stores.find((s) => s.id === storePerformance.storeId)?.name}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(storePerformance.data.totalRevenue || 0)}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Total de Vendas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(storePerformance.data.totalSales || 0).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Ticket Médio</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(storePerformance.data.averageTicket || 0)}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {storePerformance.data.totalSales > 0
                        ? ((storePerformance.data.completedSales / storePerformance.data.totalSales) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 mb-1">Vendas Finalizadas</p>
                    <p className="text-xl font-bold text-green-700">
                      {(storePerformance.data.completedSales || 0).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm text-red-700 mb-1">Vendas Canceladas</p>
                    <p className="text-xl font-bold text-red-700">
                      {(storePerformance.data.cancelledSales || 0).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading de Performance */}
        {loadingPerformance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Carregando performance...</p>
            </div>
          </div>
        )}

        {/* Modal de Detalhes */}
        {showStoreDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    Detalhes da Loja
                  </h2>
                  <button
                    onClick={() => setShowStoreDetails(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {(() => {
                const store = stores.find((s) => s.id === showStoreDetails);
                if (!store) return null;

                return (
                  <div className="p-4 md:p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 mb-2">{store.name}</h3>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            store.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {store.isActive ? "Ativa" : "Inativa"}
                        </span>
                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                          {store.isOwn ? "Loja Própria" : "Franquia"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="font-semibold text-slate-900 mb-3">Localização</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 min-w-24">Endereço:</span>
                          <span className="text-slate-900">
                            {store.addressStreet}, {store.addressNumber || "S/N"}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 min-w-24">Bairro:</span>
                          <span className="text-slate-900">{store.addressDistrict || "Não informado"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 min-w-24">Cidade/Estado:</span>
                          <span className="text-slate-900">
                            {store.city} - {store.state}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 min-w-24">CEP:</span>
                          <span className="text-slate-900">{store.zipcode || "Não informado"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="font-semibold text-slate-900 mb-3">Informações Adicionais</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 min-w-24">ID:</span>
                          <span className="text-slate-900">{store.id}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 min-w-24">Tipo:</span>
                          <span className="text-slate-900">{store.isOwn ? "Loja Própria" : "Franquia"}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 min-w-24">Status:</span>
                          <span className="text-slate-900">{store.isActive ? "Ativa" : "Inativa"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                      <button
                        onClick={() => {
                          setShowStoreDetails(null);
                          viewPerformance(store.id);
                        }}
                        className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Ver Performance Desta Loja
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Modal de Comparação */}
        {showComparison && comparisonData.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    Comparação de Lojas
                  </h2>
                  <div className="flex items-center gap-3">
                    <AddToSlideButton
                      title={`Comparação de Lojas`}
                      type="table"
                      data={comparisonData.map(({ store, performance }) => ({
                        loja: store.name,
                        cidade: `${store.city} - ${store.state}`,
                        receita: `R$ ${(performance.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        vendas: (performance.totalSales || 0).toLocaleString("pt-BR"),
                        ticketMedio: `R$ ${(performance.averageTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        taxaConclusao: performance.totalSales > 0
                          ? `${((performance.completedSales / performance.totalSales) * 100).toFixed(1)}%`
                          : '0%',
                        canceladas: (performance.cancelledSales || 0).toLocaleString("pt-BR")
                      }))}
                      config={{
                        columns: [
                          { key: 'loja', label: 'Loja' },
                          { key: 'cidade', label: 'Localização' },
                          { key: 'receita', label: 'Receita Total' },
                          { key: 'vendas', label: 'Total Vendas' },
                          { key: 'ticketMedio', label: 'Ticket Médio' },
                          { key: 'taxaConclusao', label: 'Taxa Conclusão' },
                          { key: 'canceladas', label: 'Canceladas' }
                        ],
                        showHeader: true,
                        striped: true,
                        fontSize: 'medium'
                      }}
                      variant="primary"
                    />
                    <button
                      onClick={() => {
                        setShowComparison(false);
                        setComparisonData([]);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6">
                {/* Headers das Lojas */}
                <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)` }}>
                  {comparisonData.map(({ store }) => (
                    <div key={store.id} className="bg-slate-50 p-4 rounded-lg text-center">
                      <h3 className="font-semibold text-slate-900 mb-1">{store.name}</h3>
                      <p className="text-sm text-slate-600">{store.city} - {store.state}</p>
                      <span
                        className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                          store.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {store.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Métricas - Receita Total */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-600 mb-3">💰 Receita Total</h4>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)` }}>
                    {comparisonData.map(({ store, performance }) => (
                      <div key={store.id} className="bg-green-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(performance.totalRevenue || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métricas - Total de Vendas */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-600 mb-3">🛒 Total de Vendas</h4>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)` }}>
                    {comparisonData.map(({ store, performance }) => (
                      <div key={store.id} className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-700">
                          {(performance.totalSales || 0).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métricas - Ticket Médio */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-600 mb-3">💵 Ticket Médio</h4>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)` }}>
                    {comparisonData.map(({ store, performance }) => (
                      <div key={store.id} className="bg-purple-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-purple-700">
                          {formatCurrency(performance.averageTicket || 0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métricas - Taxa de Conclusão */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-600 mb-3">✅ Taxa de Conclusão</h4>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)` }}>
                    {comparisonData.map(({ store, performance }) => (
                      <div key={store.id} className="bg-indigo-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-indigo-700">
                          {performance.totalSales > 0
                            ? ((performance.completedSales / performance.totalSales) * 100).toFixed(1)
                            : 0}%
                        </p>
                        <p className="text-xs text-indigo-600 mt-1">
                          {(performance.completedSales || 0).toLocaleString("pt-BR")} de{" "}
                          {(performance.totalSales || 0).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métricas - Vendas Canceladas */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-600 mb-3">❌ Vendas Canceladas</h4>
                  <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${comparisonData.length}, 1fr)` }}>
                    {comparisonData.map(({ store, performance }) => (
                      <div key={store.id} className="bg-red-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-700">
                          {(performance.cancelledSales || 0).toLocaleString("pt-BR")}
                        </p>
                        <p className="text-xs text-red-600 mt-1">
                          {performance.totalSales > 0
                            ? ((performance.cancelledSales / performance.totalSales) * 100).toFixed(1)
                            : 0}% do total
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ranking */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-600 mb-4">🏆 Ranking por Receita</h4>
                  <div className="space-y-2">
                    {comparisonData
                      .sort((a, b) => (b.performance.totalRevenue || 0) - (a.performance.totalRevenue || 0))
                      .map(({ store, performance }, index) => (
                        <div
                          key={store.id}
                          className={`flex items-center justify-between p-4 rounded-lg ${
                            index === 0
                              ? "bg-yellow-50 border-2 border-yellow-300"
                              : "bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-2xl ${index === 0 ? "text-yellow-500" : "text-slate-400"}`}>
                              {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">{store.name}</p>
                              <p className="text-sm text-slate-600">{store.city} - {store.state}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-700">
                              {formatCurrency(performance.totalRevenue || 0)}
                            </p>
                            <p className="text-sm text-slate-600">
                              {(performance.totalSales || 0).toLocaleString("pt-BR")} vendas
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
