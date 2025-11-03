"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// Tipos de componentes disponíveis
type ComponentType = 
  | "title" 
  | "subtitle" 
  | "text" 
  | "image" 
  | "barChart" 
  | "lineChart" 
  | "areaChart" 
  | "pieChart"
  | "metric"
  | "twoColumns";

interface SlideComponent {
  id: string;
  type: ComponentType;
  content: any;
  styles?: any;
}

interface Slide {
  id: string;
  title: string;
  components: SlideComponent[];
  background?: string;
}

// Componentes de apresentação
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

function MetricComponent({ content }: any) {
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

function TwoColumnsComponent({ content, components }: any) {
  return (
    <div className="grid grid-cols-2 gap-8">
      {content.columns.map((col: any, idx: number) => (
        <div key={idx} className="space-y-4">
          {col.components?.map((comp: any) => renderComponent(comp))}
        </div>
      ))}
    </div>
  );
}

function ChartComponent({ content, type }: any) {
  if (!content.data || content.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-center text-slate-500">Configure os dados do gráfico</p>
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
          <BarChart data={content.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={content.xKey || "name"} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={content.yKey || "value"} fill={content.color || "#3b82f6"} />
          </BarChart>
        )}
        {type === "lineChart" && (
          <LineChart data={content.data}>
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
          <AreaChart data={content.data}>
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
              data={content.data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey={content.yKey || "value"}
              nameKey={content.xKey || "name"}
              label
            >
              {content.data.map((_: any, index: number) => (
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

function renderComponent(component: SlideComponent) {
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
      return <MetricComponent content={content} />;
    case "twoColumns":
      return <TwoColumnsComponent content={content} components={component} />;
    case "barChart":
    case "lineChart":
    case "areaChart":
    case "pieChart":
      return <ChartComponent content={content} type={type} />;
    default:
      return null;
  }
}

export default function PresentationPage() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "1",
      title: "Slide 1",
      components: [],
      background: "#ffffff",
    },
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [presentationMode, setPresentationMode] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);
  const [showComponentPicker, setShowComponentPicker] = useState(false);

  const currentSlide = slides[currentSlideIndex];

  // Adicionar novo slide
  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slides.length + 1}`,
      components: [],
      background: "#ffffff",
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  // Deletar slide
  const deleteSlide = (index: number) => {
    if (slides.length === 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
  };

  // Adicionar componente ao slide
  const addComponent = (type: ComponentType) => {
    const newComponent: SlideComponent = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      styles: {},
    };

    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].components.push(newComponent);
    setSlides(updatedSlides);
    setShowComponentPicker(false);
    setEditingComponent(newComponent.id);
  };

  // Conteúdo padrão para cada tipo
  const getDefaultContent = (type: ComponentType) => {
    switch (type) {
      case "title":
        return { text: "Título Principal" };
      case "subtitle":
        return { text: "Subtítulo" };
      case "text":
        return { text: "Adicione seu texto aqui..." };
      case "image":
        return { url: "https://via.placeholder.com/800x400", alt: "Imagem", maxHeight: "400px" };
      case "metric":
        return { label: "Métrica", value: "1,234", subtitle: "Descrição" };
      case "barChart":
      case "lineChart":
      case "areaChart":
      case "pieChart":
        return {
          title: "Gráfico de Exemplo",
          data: [
            { name: "Jan", value: 400 },
            { name: "Fev", value: 300 },
            { name: "Mar", value: 600 },
            { name: "Abr", value: 800 },
          ],
          xKey: "name",
          yKey: "value",
          color: "#3b82f6",
          height: 300,
        };
      case "twoColumns":
        return {
          columns: [
            { components: [] },
            { components: [] },
          ],
        };
      default:
        return {};
    }
  };

  // Atualizar componente
  const updateComponent = (componentId: string, updates: any) => {
    const updatedSlides = [...slides];
    const component = updatedSlides[currentSlideIndex].components.find(c => c.id === componentId);
    if (component) {
      component.content = { ...component.content, ...updates };
      setSlides(updatedSlides);
    }
  };

  // Deletar componente
  const deleteComponent = (componentId: string) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].components = updatedSlides[currentSlideIndex].components.filter(
      c => c.id !== componentId
    );
    setSlides(updatedSlides);
    setEditingComponent(null);
  };

  // Mover componente
  const moveComponent = (componentId: string, direction: "up" | "down") => {
    const updatedSlides = [...slides];
    const components = updatedSlides[currentSlideIndex].components;
    const index = components.findIndex(c => c.id === componentId);
    
    if (direction === "up" && index > 0) {
      [components[index], components[index - 1]] = [components[index - 1], components[index]];
    } else if (direction === "down" && index < components.length - 1) {
      [components[index], components[index + 1]] = [components[index + 1], components[index]];
    }
    
    setSlides(updatedSlides);
  };

  // Navegação de slides no modo apresentação
  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (presentationMode) {
        if (e.key === "ArrowRight" || e.key === " ") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "Escape") setPresentationMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presentationMode, currentSlideIndex]);

  // Modo Apresentação (Fullscreen)
  if (presentationMode) {
    return (
      <div 
        className="fixed inset-0 z-50 flex flex-col"
        style={{ backgroundColor: currentSlide.background || "#ffffff" }}
      >
        {/* Slide Content */}
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-full max-w-6xl space-y-8">
            {currentSlide.components.map((component) => (
              <div key={component.id}>
                {renderComponent(component)}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 px-6 py-3 rounded-full">
          <button
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="text-white hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <span className="text-white font-medium">
            {currentSlideIndex + 1} / {slides.length}
          </span>
          
          <button
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="text-white hover:text-blue-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button
            onClick={() => setPresentationMode(false)}
            className="ml-4 text-white hover:text-red-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Modo Editor
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Editor de Apresentação</h1>
              <p className="text-sm text-slate-600">Crie apresentações personalizadas com seus dados</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPresentationMode(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Apresentar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Sidebar - Lista de Slides */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <button
              onClick={addSlide}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Slide
            </button>
          </div>

          <div className="space-y-2 px-4 pb-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => setCurrentSlideIndex(index)}
                className={`group relative p-3 rounded-lg cursor-pointer border-2 transition-all ${
                  index === currentSlideIndex
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-slate-700">
                    {index + 1}. {slide.title}
                  </span>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(index);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {slide.components.length} componente(s)
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            {/* Slide Preview */}
            <div 
              className="bg-white rounded-lg shadow-lg p-12 mb-8 min-h-[600px]"
              style={{ backgroundColor: currentSlide.background }}
            >
              <div className="space-y-6">
                {currentSlide.components.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">Slide vazio</p>
                    <p className="text-sm">Adicione componentes para começar</p>
                  </div>
                ) : (
                  currentSlide.components.map((component, index) => (
                    <div
                      key={component.id}
                      className={`relative group ${editingComponent === component.id ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                    >
                      {/* Component Controls */}
                      <div className="absolute -top-3 -right-3 z-10 opacity-0 group-hover:opacity-100 flex gap-2">
                        <button
                          onClick={() => moveComponent(component.id, "up")}
                          disabled={index === 0}
                          className="p-1 bg-slate-700 text-white rounded hover:bg-slate-800 disabled:opacity-30"
                          title="Mover para cima"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveComponent(component.id, "down")}
                          disabled={index === currentSlide.components.length - 1}
                          className="p-1 bg-slate-700 text-white rounded hover:bg-slate-800 disabled:opacity-30"
                          title="Mover para baixo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setEditingComponent(component.id)}
                          className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteComponent(component.id)}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                          title="Deletar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {renderComponent(component)}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Component Button */}
            <div className="relative">
              <button
                onClick={() => setShowComponentPicker(!showComponentPicker)}
                className="w-full px-6 py-3 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-200 hover:border-slate-400 text-slate-600 font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Componente
              </button>

              {/* Component Picker */}
              {showComponentPicker && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl p-4 z-20">
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { type: "title", icon: "T", label: "Título", desc: "Título grande" },
                      { type: "subtitle", icon: "t", label: "Subtítulo", desc: "Título menor" },
                      { type: "text", icon: "¶", label: "Texto", desc: "Parágrafo" },
                      { type: "image", icon: "🖼️", label: "Imagem", desc: "Adicionar foto" },
                      { type: "metric", icon: "📊", label: "Métrica", desc: "KPI destacado" },
                      { type: "barChart", icon: "📊", label: "Gráfico Barras", desc: "Gráfico de barras" },
                      { type: "lineChart", icon: "📈", label: "Gráfico Linha", desc: "Gráfico de linha" },
                      { type: "areaChart", icon: "📉", label: "Gráfico Área", desc: "Gráfico de área" },
                      { type: "pieChart", icon: "🍰", label: "Gráfico Pizza", desc: "Gráfico de pizza" },
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => addComponent(item.type as ComponentType)}
                        className="p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                      >
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="font-medium text-sm text-slate-900">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Component Editor */}
        {editingComponent && (
          <div className="w-80 bg-white border-l overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Editar Componente</h3>
              <button
                onClick={() => setEditingComponent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {(() => {
              const component = currentSlide.components.find(c => c.id === editingComponent);
              if (!component) return null;

              return (
                <div className="space-y-4">
                  {(component.type === "title" || component.type === "subtitle" || component.type === "text") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Texto</label>
                        <textarea
                          value={component.content.text}
                          onChange={(e) => updateComponent(component.id, { text: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
                        <input
                          type="color"
                          value={component.styles?.customColor || "#000000"}
                          onChange={(e) => {
                            const updatedSlides = [...slides];
                            const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                            if (comp) {
                              comp.styles = { ...comp.styles, customColor: e.target.value };
                              setSlides(updatedSlides);
                            }
                          }}
                          className="w-full h-10 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}

                  {component.type === "image" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">URL da Imagem</label>
                        <input
                          type="text"
                          value={component.content.url}
                          onChange={(e) => updateComponent(component.id, { url: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Altura Máxima (px)</label>
                        <input
                          type="number"
                          value={parseInt(component.content.maxHeight) || 400}
                          onChange={(e) => updateComponent(component.id, { maxHeight: e.target.value + "px" })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {component.type === "metric" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Label</label>
                        <input
                          type="text"
                          value={component.content.label}
                          onChange={(e) => updateComponent(component.id, { label: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Valor</label>
                        <input
                          type="text"
                          value={component.content.value}
                          onChange={(e) => updateComponent(component.id, { value: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subtítulo</label>
                        <input
                          type="text"
                          value={component.content.subtitle || ""}
                          onChange={(e) => updateComponent(component.id, { subtitle: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}

                  {(component.type === "barChart" || component.type === "lineChart" || component.type === "areaChart" || component.type === "pieChart") && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Título do Gráfico</label>
                        <input
                          type="text"
                          value={component.content.title || ""}
                          onChange={(e) => updateComponent(component.id, { title: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Dados (JSON)</label>
                        <textarea
                          value={JSON.stringify(component.content.data, null, 2)}
                          onChange={(e) => {
                            try {
                              const data = JSON.parse(e.target.value);
                              updateComponent(component.id, { data });
                            } catch (err) {
                              // Invalid JSON, ignore
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                          rows={8}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Formato: [{"{ name: 'Item', value: 100 }"}]
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
                        <input
                          type="color"
                          value={component.content.color || "#3b82f6"}
                          onChange={(e) => updateComponent(component.id, { color: e.target.value })}
                          className="w-full h-10 rounded cursor-pointer"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
