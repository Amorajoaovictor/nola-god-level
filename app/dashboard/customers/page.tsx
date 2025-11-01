"use client";

import { useEffect, useState } from "react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers?page=${page}&limit=${limit}`);
        const data = await res.json();
        
        setCustomers(data.data || []);
        setTotal(data.pagination?.total || 0);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [page]);

  const totalPages = Math.ceil(total / limit);
  const customersWithEmail = customers.filter((c) => c.email).length;
  const customersWithPhone = customers.filter((c) => c.phoneNumber).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
              <p className="text-sm text-slate-600">
                Base de clientes e análise de comportamento
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Buscar cliente..."
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Exportar Lista
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
            <p className="text-sm font-medium text-slate-600 mb-1">Total de Clientes</p>
            <p className="text-2xl font-bold text-slate-900">
              {total.toLocaleString("pt-BR")}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Com E-mail</p>
            <p className="text-2xl font-bold text-green-600">{customersWithEmail}</p>
            <p className="text-xs text-slate-500 mt-1">
              {((customersWithEmail / customers.length) * 100 || 0).toFixed(1)}% do total
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Com Telefone</p>
            <p className="text-2xl font-bold text-blue-600">{customersWithPhone}</p>
            <p className="text-xs text-slate-500 mt-1">
              {((customersWithPhone / customers.length) * 100 || 0).toFixed(1)}% do total
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-slate-600 mb-1">Aceita Promoções</p>
            <p className="text-2xl font-bold text-purple-600">
              {customers.filter((c) => c.receivePromotionsEmail).length}
            </p>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Promoções
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">
                          {customer.customerName || "Sem nome"}
                        </div>
                        <div className="text-xs text-slate-500">ID: {customer.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {customer.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {customer.phoneNumber || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {customer.cpf || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                          {customer.registrationOrigin || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {customer.receivePromotionsEmail ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
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
              {total.toLocaleString("pt-BR")} clientes
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
