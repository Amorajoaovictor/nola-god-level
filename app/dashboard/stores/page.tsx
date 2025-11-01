"use client";

import { useEffect, useState } from "react";

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Lojas</h1>
              <p className="text-sm text-slate-600">
                Gestão e análise de performance das lojas
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                Filtrar por Região
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Comparar Lojas
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Total de Lojas</p>
            <p className="text-2xl font-bold text-slate-900">{stores.length}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Lojas Ativas</p>
            <p className="text-2xl font-bold text-green-600">{activeStores}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Lojas Próprias</p>
            <p className="text-2xl font-bold text-blue-600">{ownStores}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Franquias</p>
            <p className="text-2xl font-bold text-purple-600">
              {stores.length - ownStores}
            </p>
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : stores.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500">Nenhuma loja encontrada</p>
            </div>
          ) : (
            stores.slice(0, 12).map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
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
                  <button className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                    Ver Performance
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
                    Detalhes
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Map Placeholder */}
        {stores.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
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
      </main>
    </div>
  );
}
