"use client";

import { useState, useEffect } from "react";
import { Slide } from "@/lib/presentation/presentation-store";

interface EditSlideModalProps {
  slide: Slide;
  onSave: (updates: Partial<Slide>) => void;
  onClose: () => void;
}

export default function EditSlideModal({ slide, onSave, onClose }: EditSlideModalProps) {
  const [title, setTitle] = useState(slide.title);
  const [config, setConfig] = useState(slide.config || {});
  const [activeTab, setActiveTab] = useState<'basic' | 'config'>('basic');

  // Configurações específicas por tipo
  const renderConfigOptions = () => {
    switch (slide.type) {
      case 'chart':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Gráfico
              </label>
              <select
                value={config.chartType || 'barChart'}
                onChange={(e) => setConfig({ ...config, chartType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="barChart">Gráfico de Barras</option>
                <option value="lineChart">Gráfico de Linhas</option>
                <option value="areaChart">Gráfico de Área</option>
                <option value="pieChart">Gráfico de Pizza</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cor Principal
              </label>
              <input
                type="color"
                value={config.color || '#3b82f6'}
                onChange={(e) => setConfig({ ...config, color: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-300 cursor-pointer"
              />
            </div>

            {config.chartType !== 'pieChart' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Label do Eixo X
                  </label>
                  <input
                    type="text"
                    value={config.xAxisLabel || ''}
                    onChange={(e) => setConfig({ ...config, xAxisLabel: e.target.value })}
                    placeholder="Ex: Meses"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Label do Eixo Y
                  </label>
                  <input
                    type="text"
                    value={config.yAxisLabel || ''}
                    onChange={(e) => setConfig({ ...config, yAxisLabel: e.target.value })}
                    placeholder="Ex: Vendas"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showLegend"
                checked={config.showLegend !== false}
                onChange={(e) => setConfig({ ...config, showLegend: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="showLegend" className="text-sm font-medium text-slate-700">
                Mostrar Legenda
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showGrid"
                checked={config.showGrid !== false}
                onChange={(e) => setConfig({ ...config, showGrid: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="showGrid" className="text-sm font-medium text-slate-700">
                Mostrar Grade
              </label>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Layout
              </label>
              <select
                value={config.layout || 'grid'}
                onChange={(e) => setConfig({ ...config, layout: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="grid">Grade</option>
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Colunas (para layout em grade)
              </label>
              <select
                value={config.columns || 'auto'}
                onChange={(e) => setConfig({ ...config, columns: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auto">Automático</option>
                <option value="2">2 colunas</option>
                <option value="3">3 colunas</option>
                <option value="4">4 colunas</option>
                <option value="5">5 colunas</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showIcons"
                checked={config.showIcons !== false}
                onChange={(e) => setConfig({ ...config, showIcons: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="showIcons" className="text-sm font-medium text-slate-700">
                Mostrar Ícones
              </label>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showHeader"
                checked={config.showHeader !== false}
                onChange={(e) => setConfig({ ...config, showHeader: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="showHeader" className="text-sm font-medium text-slate-700">
                Mostrar Cabeçalho
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="striped"
                checked={config.striped === true}
                onChange={(e) => setConfig({ ...config, striped: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="striped" className="text-sm font-medium text-slate-700">
                Linhas Alternadas
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="compact"
                checked={config.compact === true}
                onChange={(e) => setConfig({ ...config, compact: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="compact" className="text-sm font-medium text-slate-700">
                Modo Compacto
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tamanho da Fonte
              </label>
              <select
                value={config.fontSize || 'medium'}
                onChange={(e) => setConfig({ ...config, fontSize: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Pequena</option>
                <option value="medium">Média</option>
                <option value="large">Grande</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-slate-500 py-4">
            Sem configurações adicionais para este tipo de slide
          </div>
        );
    }
  };

  const handleSave = () => {
    onSave({
      title,
      config,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Editar Slide</h2>
              <p className="text-sm text-slate-600 mt-1">
                Tipo: <span className="font-medium capitalize">{slide.type}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'basic'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Básico
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'config'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Configurações
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'basic' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título do Slide
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Preview do Conteúdo
                </p>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-2">
                    {slide.type === 'metrics' && `${Array.isArray(slide.data) ? slide.data.length : 0} métricas`}
                    {slide.type === 'chart' && `Gráfico com ${Array.isArray(slide.data) ? slide.data.length : 0} pontos`}
                    {slide.type === 'table' && `Tabela com ${Array.isArray(slide.data) ? slide.data.length : 0} linhas`}
                    {slide.type === 'custom' && `${Array.isArray(slide.data) ? slide.data.length : 0} componentes`}
                  </p>
                  <p className="text-xs text-slate-400">
                    Os dados não podem ser editados aqui. Use o editor avançado para slides customizados.
                  </p>
                </div>
              </div>

              {slide.type === 'custom' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        Slide Customizado
                      </p>
                      <p className="text-xs text-blue-700">
                        Para editar o conteúdo deste slide, use o botão "Editar" na página de apresentações para abrir no editor avançado.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            renderConfigOptions()
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
