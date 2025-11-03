"use client";

import { useState, useEffect } from "react";
import { PresentationStore, Presentation, Slide } from "@/lib/presentation/presentation-store";
import EditSlideModal from "@/components/presentation/EditSlideModal";
import { 
  BarChart, 
  Bar, 
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
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// Componentes de renderização do editor
function TitleComponent({ content, styles }: any) {
  return (
    <h1 
      className={`text-4xl font-bold ${styles?.textAlign || 'text-center'} ${styles?.color || 'text-slate-900'}`}
      style={{ color: styles?.customColor }}
    >
      {content.text}
    </h1>
  );
}

function SubtitleComponent({ content, styles }: any) {
  return (
    <h2 
      className={`text-2xl font-semibold ${styles?.textAlign || 'text-center'} ${styles?.color || 'text-slate-700'}`}
      style={{ color: styles?.customColor }}
    >
      {content.text}
    </h2>
  );
}

function TextComponent({ content, styles }: any) {
  return (
    <p 
      className={`text-lg ${styles?.textAlign || 'text-left'} ${styles?.color || 'text-slate-600'}`}
      style={{ color: styles?.customColor }}
    >
      {content.text}
    </p>
  );
}

function ImageComponent({ content }: any) {
  return (
    <div className="flex justify-center">
      <img 
        src={content.url} 
        alt={content.alt || "Imagem"} 
        className="max-w-full h-auto rounded-lg shadow-lg"
        style={{ maxHeight: content.maxHeight || '400px' }}
      />
    </div>
  );
}

function MetricComponentEditor({ content }: any) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <p className="text-sm font-medium text-slate-600 mb-2">{content.label}</p>
      <p className="text-5xl font-bold text-blue-600">{content.value}</p>
      {content.subtitle && (
        <p className="text-sm text-slate-500 mt-2">{content.subtitle}</p>
      )}
    </div>
  );
}

function ChartComponentEditor({ content, type }: any) {
  const data = content.data || [];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-center text-slate-500">Sem dados para exibir</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {content.title && (
        <h3 className="text-xl font-semibold text-slate-900 mb-4">{content.title}</h3>
      )}
      <ResponsiveContainer width="100%" height={content.height || 300}>
        {type === "barChart" && (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={content.xKey || "name"} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={content.yKey || "value"} fill={content.color || "#3b82f6"} />
          </BarChart>
        )}
        {type === "lineChart" && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={content.xKey || "name"} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={content.yKey || "value"} 
              stroke={content.color || "#3b82f6"}
              strokeWidth={2}
            />
          </LineChart>
        )}
        {type === "areaChart" && (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={content.xKey || "name"} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={content.yKey || "value"} 
              stroke={content.color || "#3b82f6"}
              fill={content.color || "#3b82f6"}
              fillOpacity={0.6}
            />
          </AreaChart>
        )}
        {type === "pieChart" && (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey={content.yKey || "value"}
              nameKey={content.xKey || "name"}
              label
            >
              {data.map((_: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function renderEditorComponent(component: any) {
  const { type, content, styles } = component;

  switch (type) {
    case "title":
      return <TitleComponent content={content} styles={styles} />;
    case "subtitle":
      return <SubtitleComponent content={content} styles={styles} />;
    case "text":
      return <TextComponent content={content} styles={styles} />;
    case "image":
      return <ImageComponent content={content} />;
    case "metric":
      return <MetricComponentEditor content={content} />;
    case "barChart":
    case "lineChart":
    case "areaChart":
    case "pieChart":
      return <ChartComponentEditor content={content} type={type} />;
    default:
      return null;
  }
}

export default function PresentationsPage() {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [viewMode, setViewMode] = useState<'edit' | 'present'>('edit');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

  useEffect(() => {
    loadData();
    
    // Listener para mudanças no localStorage (quando edita em outra aba)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nola-presentations' || e.key === 'nola-current-presentation') {
        loadData();
      }
    };
    
    // Listener para quando a aba recebe foco (volta de outra aba)
    const handleFocus = () => {
      loadData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadData = () => {
    const current = PresentationStore.getCurrent();
    const all = PresentationStore.getAll();
    setPresentation(current);
    setPresentations(all);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (confirm('Remover este slide da apresentação?')) {
      PresentationStore.removeSlide(slideId);
      loadData();
    }
  };

  const handleEditSlide = (slide: Slide) => {
    // Para slides customizados, abrir no editor avançado
    if (slide.type === 'custom') {
      sessionStorage.setItem('editingSlide', JSON.stringify(slide));
      window.open('/dashboard/presentation', '_blank');
    } else {
      // Para outros tipos, abrir modal de edição rápida
      setEditingSlide(slide);
    }
  };

  const handleSaveSlideEdits = (updates: Partial<Slide>) => {
    if (editingSlide) {
      PresentationStore.updateSlide(editingSlide.id, updates);
      setEditingSlide(null);
      loadData();
    }
  };

  const handleExportJSON = () => {
    const json = PresentationStore.exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation?.name || 'apresentacao'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNewPresentation = () => {
    const name = prompt('Nome da nova apresentação:');
    if (name) {
      const newPres = PresentationStore.create(name);
      PresentationStore.setCurrent(newPres.id);
      loadData();
    }
  };

  const handleSwitchPresentation = (id: string) => {
    PresentationStore.setCurrent(id);
    loadData();
    setCurrentSlideIndex(0);
  };

  const handleOpenAdvancedEditor = () => {
    window.open('/dashboard/presentation', '_blank');
  };

  const renderSlideContent = (slide: Slide) => {
    const config = slide.config || {};
    
    switch (slide.type) {
      case 'metrics':
        const columns = config.columns === 'auto' || !config.columns 
          ? Math.min(slide.data.length, 4) 
          : parseInt(config.columns);
        const showIcons = config.showIcons !== false;
        
        return (
          <div 
            className={`grid gap-4`}
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {slide.data.map((metric: any, idx: number) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                {showIcons && metric.icon && (
                  <span className="text-2xl mb-2 block">{metric.icon}</span>
                )}
                <p className="text-sm font-medium text-slate-600 mb-2">{metric.label}</p>
                <p className={`text-3xl font-bold ${
                  metric.color === 'green' ? 'text-green-600' :
                  metric.color === 'blue' ? 'text-blue-600' :
                  metric.color === 'purple' ? 'text-purple-600' :
                  metric.color === 'orange' ? 'text-orange-600' :
                  metric.color === 'red' ? 'text-red-600' :
                  'text-slate-900'
                }`}>
                  {metric.format === 'currency' && typeof metric.value === 'number'
                    ? `R$ ${metric.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : metric.format === 'number' && typeof metric.value === 'number'
                    ? metric.value.toLocaleString('pt-BR')
                    : metric.value}
                </p>
                {metric.subtitle && (
                  <p className="text-xs text-slate-500 mt-1">{metric.subtitle}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 'chart':
        const chartType = config.chartType || 'barChart';
        const showLegend = config.showLegend !== false;
        const showGrid = config.showGrid !== false;
        const chartColor = config.color || '#3b82f6';
        
        if (chartType === 'barChart') {
          return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={slide.data}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                  <XAxis 
                    dataKey={config.xAxisKey || slide.config.xKey || 'name'}
                    label={config.xAxisLabel ? { value: config.xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                  />
                  <YAxis 
                    label={config.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                  />
                  <Tooltip />
                  {showLegend && <Legend />}
                  <Bar 
                    dataKey={config.dataKey || slide.config.yKey || 'value'} 
                    fill={chartColor}
                    name={config.yAxisLabel || 'Valor'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        } else if (chartType === 'lineChart') {
          return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={slide.data}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                  <XAxis 
                    dataKey={config.xAxisKey || 'name'}
                    label={config.xAxisLabel ? { value: config.xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                  />
                  <YAxis 
                    label={config.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                  />
                  <Tooltip />
                  {showLegend && <Legend />}
                  <Line 
                    type="monotone" 
                    dataKey={config.dataKey || 'value'} 
                    stroke={chartColor}
                    strokeWidth={2}
                    name={config.yAxisLabel || 'Valor'}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        } else if (chartType === 'areaChart') {
          return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={slide.data}>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" />}
                  <XAxis 
                    dataKey={config.xAxisKey || 'name'}
                    label={config.xAxisLabel ? { value: config.xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                  />
                  <YAxis 
                    label={config.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                  />
                  <Tooltip />
                  {showLegend && <Legend />}
                  <Area 
                    type="monotone" 
                    dataKey={config.dataKey || 'value'} 
                    stroke={chartColor}
                    fill={chartColor}
                    fillOpacity={0.6}
                    name={config.yAxisLabel || 'Valor'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          );
        } else if (chartType === 'pieChart') {
          const pieColors = config.colors || COLORS;
          return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={slide.data}
                    dataKey={config.dataKey || slide.config.valueKey || 'value'}
                    nameKey={config.nameKey || slide.config.nameKey || 'name'}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {slide.data.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  {showLegend && <Legend />}
                </PieChart>
              </ResponsiveContainer>
            </div>
          );
        }
        break;

      case 'table':
        const showHeader = config.showHeader !== false;
        const striped = config.striped === true;
        const compact = config.compact === true;
        const fontSize = config.fontSize || 'medium';
        
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
            <table className={`w-full ${
              fontSize === 'small' ? 'text-sm' : 
              fontSize === 'large' ? 'text-lg' : 
              'text-base'
            }`}>
              {showHeader && (
                <thead>
                  <tr className="border-b border-slate-200">
                    {slide.config.columns?.map((col: any, idx: number) => (
                      <th key={idx} className={`text-left font-semibold text-slate-700 ${
                        compact ? 'py-2 px-3' : 'py-3 px-4'
                      }`}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {slide.data.map((row: any, rowIdx: number) => (
                  <tr 
                    key={rowIdx} 
                    className={`border-b border-slate-100 ${
                      striped && rowIdx % 2 === 1 ? 'bg-slate-50' : ''
                    }`}
                  >
                    {slide.config.columns?.map((col: any, colIdx: number) => (
                      <td key={colIdx} className={`text-slate-600 ${
                        compact ? 'py-2 px-3' : 'py-3 px-4'
                      }`}>
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'custom':
        // Slides criados no editor avançado
        console.log('🎨 Renderizando slide custom:', {
          slideId: slide.id,
          hasData: !!slide.data,
          isArray: Array.isArray(slide.data),
          dataLength: Array.isArray(slide.data) ? slide.data.length : 0,
          data: slide.data
        });
        
        if (Array.isArray(slide.data)) {
          return (
            <div className="space-y-6">
              {slide.data.map((component: any, idx: number) => (
                <div key={idx}>
                  {renderEditorComponent(component)}
                </div>
              ))}
            </div>
          );
        }
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-center text-slate-500">Slide customizado sem componentes</p>
          </div>
        );

      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <pre className="text-sm text-slate-600 overflow-auto">
              {JSON.stringify(slide.data, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (!presentation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Nenhuma apresentação encontrada</p>
          <button
            onClick={handleNewPresentation}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Criar Apresentação
          </button>
        </div>
      </div>
    );
  }

  if (viewMode === 'present') {
    const currentSlide = presentation.slides[currentSlideIndex];
    
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header do modo apresentação */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">{presentation.name}</h1>
              <p className="text-slate-400">
                Slide {currentSlideIndex + 1} de {presentation.slides.length}
              </p>
            </div>
            <button
              onClick={() => setViewMode('edit')}
              className="px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600"
            >
              Sair da Apresentação
            </button>
          </div>

          {/* Conteúdo do slide */}
          {currentSlide ? (
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6">{currentSlide.title}</h2>
              <div className="bg-slate-800 p-6 rounded-lg">
                {renderSlideContent(currentSlide)}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400">Nenhum slide nesta apresentação</p>
            </div>
          )}

          {/* Navegação */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            <div className="flex gap-2">
              {presentation.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-3 h-3 rounded-full ${
                    idx === currentSlideIndex ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === presentation.slides.length - 1}
              className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">📊 Apresentações</h1>
            <p className="text-slate-600">Gerencie seus slides e apresentações</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleOpenAdvancedEditor}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              title="Criar slides customizados com editor visual completo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              ✨ Criar Slide
            </button>
            <button
              onClick={handleNewPresentation}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Apresentação
            </button>
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar JSON
            </button>
            {presentation.slides.length > 0 && (
              <button
                onClick={() => setViewMode('present')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Apresentar
              </button>
            )}
          </div>
        </div>

        {/* Seletor de apresentações */}
        {presentations.length > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Apresentação Atual:
            </label>
            <div className="flex gap-2 flex-wrap">
              {presentations.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSwitchPresentation(p.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    p.id === presentation.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p.name} ({p.slides.length} slides)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de slides */}
        {presentation.slides.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Nenhum slide ainda
            </h3>
            <p className="text-slate-600 mb-4">
              Navegue pelas páginas do dashboard e clique em "Adicionar ao Slide" para começar a criar sua apresentação.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {presentation.slides.map((slide, index) => (
              <div key={slide.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm font-bold text-blue-600 mb-1">
                      Slide {index + 1}
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900">{slide.title}</h3>
                    <span className="text-xs text-slate-500">
                      {slide.type} • {new Date(slide.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSlide(slide)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🗑️ Remover
                    </button>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  {renderSlideContent(slide)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Edição */}
        {editingSlide && (
          <EditSlideModal
            slide={editingSlide}
            onSave={handleSaveSlideEdits}
            onClose={() => setEditingSlide(null)}
          />
        )}
      </div>
    </div>
  );
}
