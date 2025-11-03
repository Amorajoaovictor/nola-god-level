"use client";

import { useState, useEffect } from "react";
import { PresentationStore } from "@/lib/presentation/presentation-store";
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

// Transformações disponíveis para dados da API
const applyTransform = (data: any, transform: string, config: ApiConfig) => {
  switch (transform) {
    case "salesByDay":
      // Transforma: { date: "2025-11-01", totalSales: 100 }
      // Para: { name: "01/11", value: 100 }
      return data.map((item: any) => ({
        name: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        value: item.totalSales || item.count || 0,
        revenue: item.totalRevenue || 0,
      }));
    
    case "topProducts":
      // Transforma: { product: { name: "Pizza" }, totalQuantity: 50 }
      // Para: { name: "Pizza", value: 50 }
      return data.map((item: any) => ({
        name: item.product?.name || item.name || "Produto",
        value: item.totalQuantity || item.quantity || 0,
        revenue: item.totalRevenue || 0,
      }));
    
    case "storesComparison":
      // Transforma: { store: { name: "Loja A" }, totalSales: 200 }
      // Para: { name: "Loja A", value: 200 }
      return data.map((item: any) => ({
        name: item.store?.name || item.name || "Loja",
        value: item.totalSales || item.sales || 0,
        revenue: item.totalRevenue || item.revenue || 0,
      }));
    
    case "summary":
      // Transforma objeto summary em array de métricas
      return [
        { label: "Total Vendas", value: data.totalSales || 0 },
        { label: "Faturamento", value: data.totalRevenue || 0 },
        { label: "Ticket Médio", value: data.averageTicket || 0 },
      ];
    
    case "statusDistribution":
      // Transforma: { completedSales: 100, cancelledSales: 10 }
      // Para: [{ name: "Completas", value: 100 }, ...]
      return [
        { name: "Completas", value: data.completedSales || 0 },
        { name: "Canceladas", value: data.cancelledSales || 0 },
        { name: "Pendentes", value: data.pendingSales || 0 },
      ];
    
    default:
      return data;
  }
};

// Configurações de API pré-definidas
const API_PRESETS = {
  salesSummary: {
    name: "Resumo de Vendas",
    endpoint: "/api/sales/summary",
    dataPath: "data",
    transform: "summary",
  },
  salesByDay: {
    name: "Vendas por Dia (30 dias)",
    endpoint: "/api/sales/by-day",
    params: { days: "30" },
    dataPath: "data",
    transform: "salesByDay",
    xKey: "name",
    yKey: "value",
  },
  topProducts: {
    name: "Top 10 Produtos",
    endpoint: "/api/products/top-selling",
    params: { limit: "10" },
    dataPath: "data",
    transform: "topProducts",
    xKey: "name",
    yKey: "value",
  },
  storesComparison: {
    name: "Comparação de Lojas",
    endpoint: "/api/stores",
    dataPath: "data",
    transform: "storesComparison",
    xKey: "name",
    yKey: "value",
  },
  statusDistribution: {
    name: "Distribuição por Status",
    endpoint: "/api/sales/summary",
    dataPath: "data",
    transform: "statusDistribution",
    xKey: "name",
    yKey: "value",
  },
};

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

type DataSource = "static" | "api";

interface ApiConfig {
  endpoint: string;
  params?: Record<string, string>;
  dataPath?: string; // Caminho para acessar os dados na resposta
  xKey?: string;
  yKey?: string;
  transform?: string; // Nome da transformação a aplicar
  valueKey?: string; // Para métricas
  format?: string; // Para métricas
  filters?: {
    startDate?: string;
    endDate?: string;
    storeIds?: number[];
    channelId?: number;
    daysOfWeek?: number[];
  };
}

interface DataSeries {
  id: string;
  name: string;
  apiConfig: ApiConfig;
  color: string;
  yKey: string;
}

interface SlideComponent {
  id: string;
  type: ComponentType;
  content: any;
  styles?: any;
  dataSource?: DataSource;
  apiConfig?: ApiConfig;
  dataSeries?: DataSeries[]; // Para gráficos com múltiplas linhas
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

function MetricComponent({ content, dataSource, apiConfig, refreshTrigger }: any) {
  const [data, setData] = useState<any>(content);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dataSource === "api" && apiConfig?.endpoint) {
      fetchMetricData();
    } else {
      setData(content);
    }
  }, [dataSource, refreshTrigger]); // Atualiza quando refreshTrigger mudar

  const fetchMetricData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(apiConfig.params || {});
      const url = `${apiConfig.endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      let apiData = result;
      if (apiConfig.dataPath) {
        const paths = apiConfig.dataPath.split('.');
        for (const path of paths) {
          apiData = apiData?.[path];
        }
      }

      // Extrair valor específico se indicado
      const value = apiConfig.valueKey ? apiData[apiConfig.valueKey] : apiData;
      
      setData({
        label: content.label,
        value: formatMetricValue(value, apiConfig.format),
        subtitle: content.subtitle,
      });
    } catch (err) {
      console.error('Error fetching metric data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMetricValue = (value: any, format?: string) => {
    if (format === "currency") {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(value));
    }
    if (format === "number") {
      return Number(value).toLocaleString("pt-BR");
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <p className="text-sm font-medium text-slate-600 mb-2">{data.label}</p>
      <p className="text-5xl font-bold text-blue-600">{data.value}</p>
      {data.subtitle && (
        <p className="text-sm text-slate-500 mt-2">{data.subtitle}</p>
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

function ChartComponent({ content, type, dataSource, apiConfig, dataSeries, refreshTrigger, onDataLoaded }: any) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados da API se dataSource for "api"
  useEffect(() => {
    if (dataSource === "api") {
      if (dataSeries && dataSeries.length > 0) {
        // Múltiplas séries de dados
        fetchMultipleSeriesData();
      } else if (apiConfig?.endpoint) {
        // Série única
        fetchApiData();
      }
    } else {
      setData(content.data || []);
    }
  }, [dataSource, refreshTrigger]); // Atualiza quando refreshTrigger mudar

  // Notificar quando dados forem carregados
  useEffect(() => {
    if (data && data.length > 0 && onDataLoaded) {
      onDataLoaded(data);
    }
  }, [data]);

  const buildApiUrl = (config: ApiConfig) => {
    const params = new URLSearchParams(config.params || {});
    
    // Adicionar filtros
    if (config.filters) {
      if (config.filters.startDate) params.append("startDate", config.filters.startDate);
      if (config.filters.endDate) params.append("endDate", config.filters.endDate);
      if (config.filters.channelId) params.append("channelId", config.filters.channelId.toString());
      if (config.filters.storeIds) {
        config.filters.storeIds.forEach(id => params.append("storeId", id.toString()));
      }
      if (config.filters.daysOfWeek) {
        config.filters.daysOfWeek.forEach(day => params.append("daysOfWeek", day.toString()));
      }
    }
    
    return `${config.endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  const fetchMultipleSeriesData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Buscar dados de todas as séries em paralelo
      const promises = dataSeries.map(async (series: DataSeries) => {
        const url = buildApiUrl(series.apiConfig);
        const response = await fetch(url);
        const result = await response.json();
        
        let apiData = result;
        if (series.apiConfig.dataPath) {
          const paths = series.apiConfig.dataPath.split('.');
          for (const path of paths) {
            apiData = apiData?.[path];
          }
        }

        if (series.apiConfig.transform && apiData) {
          apiData = applyTransform(apiData, series.apiConfig.transform, series.apiConfig);
        }

        return { series, data: Array.isArray(apiData) ? apiData : [] };
      });

      const results = await Promise.all(promises);
      
      // Combinar dados de todas as séries
      const combinedData = combineSeriesData(results);
      setData(combinedData);
    } catch (err) {
      console.error('Error fetching multiple series data:', err);
      setError('Erro ao carregar dados da API');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const combineSeriesData = (results: any[]) => {
    // Criar um mapa de todos os pontos únicos no eixo X
    const dataMap = new Map<string, any>();
    
    results.forEach(({ series, data }) => {
      data.forEach((item: any) => {
        const key = item.name || item[series.apiConfig.xKey || 'name'];
        if (!dataMap.has(key)) {
          dataMap.set(key, { name: key });
        }
        const entry = dataMap.get(key);
        entry[series.yKey] = item.value || item[series.yKey];
      });
    });

    return Array.from(dataMap.values());
  };

  const fetchApiData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = buildApiUrl(apiConfig);
      
      const response = await fetch(url);
      const result = await response.json();
      
      // Acessar dados no caminho especificado (ex: "data.items")
      let apiData = result;
      if (apiConfig.dataPath) {
        const paths = apiConfig.dataPath.split('.');
        for (const path of paths) {
          apiData = apiData?.[path];
        }
      }

      // Aplicar transformação se especificada
      if (apiConfig.transform && apiData) {
        apiData = applyTransform(apiData, apiConfig.transform, apiConfig);
      }

      setData(Array.isArray(apiData) ? apiData : []);
    } catch (err) {
      console.error('Error fetching API data:', err);
      setError('Erro ao carregar dados da API');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
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
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={apiConfig?.xKey || content.xKey || "name"} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataSeries && dataSeries.length > 0 ? (
              dataSeries.map((series: DataSeries) => (
                <Bar 
                  key={series.id}
                  dataKey={series.yKey} 
                  fill={series.color} 
                  name={series.name}
                />
              ))
            ) : (
              <Bar dataKey={apiConfig?.yKey || content.yKey || "value"} fill={content.color || "#3b82f6"} />
            )}
          </BarChart>
        )}
        {type === "lineChart" && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={apiConfig?.xKey || content.xKey || "name"} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataSeries && dataSeries.length > 0 ? (
              dataSeries.map((series: DataSeries) => (
                <Line 
                  key={series.id}
                  type="monotone" 
                  dataKey={series.yKey} 
                  stroke={series.color}
                  strokeWidth={2}
                  name={series.name}
                />
              ))
            ) : (
              <Line 
                type="monotone" 
                dataKey={apiConfig?.yKey || content.yKey || "value"} 
                stroke={content.color || "#3b82f6"}
                strokeWidth={2}
              />
            )}
          </LineChart>
        )}
        {type === "areaChart" && (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={apiConfig?.xKey || content.xKey || "name"} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataSeries && dataSeries.length > 0 ? (
              dataSeries.map((series: DataSeries) => (
                <Area 
                  key={series.id}
                  type="monotone" 
                  dataKey={series.yKey} 
                  stroke={series.color}
                  fill={series.color}
                  fillOpacity={0.6}
                  name={series.name}
                />
              ))
            ) : (
              <Area 
                type="monotone" 
                dataKey={apiConfig?.yKey || content.yKey || "value"} 
                stroke={content.color || "#3b82f6"}
                fill={content.color || "#3b82f6"}
                fillOpacity={0.6}
              />
            )}
          </AreaChart>
        )}
        {type === "pieChart" && (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey={apiConfig?.yKey || content.yKey || "value"}
              nameKey={apiConfig?.xKey || content.xKey || "name"}
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

function renderComponent(component: SlideComponent, refreshTrigger?: number, onDataLoaded?: (componentId: string, data: any[]) => void) {
  const { type, content, styles, dataSource, apiConfig, dataSeries } = component;

  // Criar callback específico para este componente
  const handleDataLoaded = onDataLoaded ? (data: any[]) => onDataLoaded(component.id, data) : undefined;

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
      return <MetricComponent content={content} dataSource={dataSource} apiConfig={apiConfig} refreshTrigger={refreshTrigger} />;
    case "twoColumns":
      return <TwoColumnsComponent content={content} components={component} />;
    case "barChart":
    case "lineChart":
    case "areaChart":
    case "pieChart":
      return <ChartComponent content={content} type={type} dataSource={dataSource} apiConfig={apiConfig} dataSeries={dataSeries} refreshTrigger={refreshTrigger} onDataLoaded={handleDataLoaded} />;
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  
  // Armazenar dados carregados de APIs para cada componente
  const [componentLoadedData, setComponentLoadedData] = useState<Map<string, any[]>>(new Map());

  const currentSlide = slides[currentSlideIndex];

  // Carregar slide em edição do sessionStorage
  useEffect(() => {
    const editingSlideData = sessionStorage.getItem('editingSlide');
    if (editingSlideData) {
      try {
        const slideData = JSON.parse(editingSlideData);
        
        console.group('📥 Carregando slide para edição');
        console.log('Slide original:', slideData);
        console.log('Type:', slideData.type);
        console.log('Data:', slideData.data);
        console.log('Data is array?', Array.isArray(slideData.data));
        
        // Converter o slide do formato de apresentação para o formato do editor
        if (slideData.type === 'custom' && Array.isArray(slideData.data)) {
          const convertedSlide: Slide = {
            id: slideData.id,
            title: slideData.title,
            components: slideData.data, // Os componentes já estão no formato correto
            background: slideData.config?.background || "#ffffff",
          };
          
          console.log('Slide convertido:', convertedSlide);
          console.log('Components:', convertedSlide.components);
          convertedSlide.components.forEach((comp: any, idx: number) => {
            console.log(`Component [${idx}]:`, {
              type: comp.type,
              id: comp.id,
              content: comp.content
            });
          });
          console.groupEnd();
          
          setSlides([convertedSlide]);
          setCurrentSlideIndex(0);
          setEditingSlideId(slideData.id);
          
          // Limpar o sessionStorage
          sessionStorage.removeItem('editingSlide');
        } else {
          console.error('Slide não é do tipo custom ou data não é array');
          console.groupEnd();
        }
      } catch (error) {
        console.error('Erro ao carregar slide para edição:', error);
      }
    }
  }, []);

  // Salvar slide atual na apresentação
  const saveCurrentSlideToPresentation = () => {
    if (!currentSlide || currentSlide.components.length === 0) {
      alert('Adicione componentes ao slide antes de salvar!');
      return;
    }

    setSaveStatus('saving');
    
    try {
      // Mesclar dados carregados da API nos componentes
      const componentsWithLoadedData = currentSlide.components.map(component => {
        if (component.dataSource === 'api' && componentLoadedData.has(component.id)) {
          // Se temos dados carregados da API, salvá-los no content.data
          const loadedData = componentLoadedData.get(component.id);
          console.log(`🔄 Mesclando dados da API para componente ${component.id}:`, {
            oldDataLength: component.content?.data?.length || 0,
            newDataLength: loadedData?.length || 0
          });
          
          return {
            ...component,
            content: {
              ...component.content,
              data: loadedData || component.content.data
            }
          };
        }
        return component;
      });
      
      const slideData = {
        title: currentSlide.title || 'Slide Customizado',
        data: componentsWithLoadedData,
        config: {
          background: currentSlide.background,
        },
      };
      
      console.log('💾 Salvando slide:', {
        editingSlideId,
        slideData,
        componentsCount: componentsWithLoadedData.length,
        componentsWithApiData: componentsWithLoadedData.filter(c => c.dataSource === 'api').length
      });
      
      if (editingSlideId) {
        // Atualizar slide existente
        PresentationStore.updateSlide(editingSlideId, slideData);
        
        // Limpar estado de edição após atualizar
        setEditingSlideId(null);
        
        console.log('✅ Slide atualizado com sucesso');
        alert('✅ Slide atualizado na apresentação com sucesso!');
      } else {
        // Criar novo slide
        PresentationStore.addSlide({
          title: slideData.title,
          type: 'custom',
          data: slideData.data,
          config: slideData.config,
        });
        console.log('✅ Novo slide criado com sucesso');
        alert('✅ Slide salvo na apresentação com sucesso!');
      }

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('❌ Erro ao salvar slide:', error);
      alert('❌ Erro ao salvar slide. Tente novamente.');
      setSaveStatus('idle');
    }
  };

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
                {renderComponent(component, refreshTrigger, (componentId, data) => {
                  setComponentLoadedData(prev => {
                    const newMap = new Map(prev);
                    newMap.set(componentId, data);
                    return newMap;
                  });
                })}
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
              <h1 className="text-2xl font-bold text-slate-900">
                Editor de Apresentação
                {editingSlideId && (
                  <span className="ml-3 text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    ✏️ Editando
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-600">
                {editingSlideId 
                  ? 'Editando slide salvo - clique em salvar para atualizar'
                  : 'Crie apresentações personalizadas com seus dados'
                }
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={saveCurrentSlideToPresentation}
                disabled={saveStatus === 'saving' || currentSlide.components.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Salvando...
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvo!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {editingSlideId ? 'Atualizar Slide' : 'Salvar na Apresentação'}
                  </>
                )}
              </button>
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
                      
                      {renderComponent(component, refreshTrigger, (componentId, data) => {
                        console.log(`📦 Dados carregados para componente ${componentId}:`, data.length, 'itens');
                        setComponentLoadedData(prev => {
                          const newMap = new Map(prev);
                          newMap.set(componentId, data);
                          return newMap;
                        });
                      })}
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

                      {/* Fonte de Dados */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Fonte de Dados</label>
                        <select
                          value={component.dataSource || "static"}
                          onChange={(e) => {
                            const updatedSlides = [...slides];
                            const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                            if (comp) {
                              comp.dataSource = e.target.value as DataSource;
                              if (e.target.value === "api") {
                                comp.apiConfig = { endpoint: "", params: {} };
                              }
                              setSlides(updatedSlides);
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="static">Valor Fixo</option>
                          <option value="api">API do Sistema</option>
                        </select>
                      </div>

                      {component.dataSource === "api" ? (
                        <>
                          {/* Preset de métricas */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Métrica Pré-configurada
                            </label>
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  const updatedSlides = [...slides];
                                  const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                  if (comp) {
                                    const configs: Record<string, any> = {
                                      totalSales: {
                                        endpoint: "/api/sales/summary",
                                        dataPath: "data",
                                        valueKey: "totalSales",
                                        format: "number",
                                        label: "Total de Vendas",
                                      },
                                      totalRevenue: {
                                        endpoint: "/api/sales/summary",
                                        dataPath: "data",
                                        valueKey: "totalRevenue",
                                        format: "currency",
                                        label: "Faturamento Total",
                                      },
                                      averageTicket: {
                                        endpoint: "/api/sales/summary",
                                        dataPath: "data",
                                        valueKey: "averageTicket",
                                        format: "currency",
                                        label: "Ticket Médio",
                                      },
                                      completedSales: {
                                        endpoint: "/api/sales/summary",
                                        dataPath: "data",
                                        valueKey: "completedSales",
                                        format: "number",
                                        label: "Vendas Completas",
                                      },
                                    };
                                    
                                    const config = configs[e.target.value];
                                    comp.apiConfig = config;
                                    comp.content = {
                                      ...comp.content,
                                      label: config.label,
                                    };
                                    setSlides(updatedSlides);
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                            >
                              <option value="">Selecione uma métrica...</option>
                              <option value="totalSales">📊 Total de Vendas</option>
                              <option value="totalRevenue">💰 Faturamento Total</option>
                              <option value="averageTicket">🎯 Ticket Médio</option>
                              <option value="completedSales">✅ Vendas Completas</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Endpoint da API
                            </label>
                            <input
                              type="text"
                              value={component.apiConfig?.endpoint || ""}
                              onChange={(e) => {
                                const updatedSlides = [...slides];
                                const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                if (comp && comp.apiConfig) {
                                  comp.apiConfig.endpoint = e.target.value;
                                  setSlides(updatedSlides);
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Chave do Valor
                            </label>
                            <input
                              type="text"
                              value={component.apiConfig?.valueKey || ""}
                              onChange={(e) => {
                                const updatedSlides = [...slides];
                                const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                if (comp && comp.apiConfig) {
                                  comp.apiConfig.valueKey = e.target.value;
                                  setSlides(updatedSlides);
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="totalSales"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Formato
                            </label>
                            <select
                              value={component.apiConfig?.format || ""}
                              onChange={(e) => {
                                const updatedSlides = [...slides];
                                const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                if (comp && comp.apiConfig) {
                                  comp.apiConfig.format = e.target.value;
                                  setSlides(updatedSlides);
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Texto</option>
                              <option value="number">Número (1.234)</option>
                              <option value="currency">Moeda (R$ 1.234,56)</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Valor</label>
                            <input
                              type="text"
                              value={component.content.value}
                              onChange={(e) => updateComponent(component.id, { value: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}

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

                      {/* Fonte de Dados */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Fonte de Dados</label>
                        <select
                          value={component.dataSource || "static"}
                          onChange={(e) => {
                            const updatedSlides = [...slides];
                            const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                            if (comp) {
                              comp.dataSource = e.target.value as DataSource;
                              if (e.target.value === "api") {
                                comp.apiConfig = { endpoint: "", params: {} };
                              }
                              setSlides(updatedSlides);
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="static">Dados Estáticos (JSON)</option>
                          <option value="api">API do Sistema</option>
                        </select>
                      </div>

                      {component.dataSource === "api" ? (
                        <>
                          {/* Preset de API */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              API Pré-configurada
                            </label>
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  const preset = API_PRESETS[e.target.value as keyof typeof API_PRESETS];
                                  const updatedSlides = [...slides];
                                  const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                  if (comp) {
                                    comp.apiConfig = {
                                      endpoint: preset.endpoint,
                                      params: preset.params,
                                      dataPath: preset.dataPath,
                                      transform: preset.transform,
                                      xKey: preset.xKey,
                                      yKey: preset.yKey,
                                    };
                                    comp.content = {
                                      ...comp.content,
                                      title: comp.content.title || preset.name,
                                    };
                                    setSlides(updatedSlides);
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
                            >
                              <option value="">Selecione uma API...</option>
                              <option value="salesByDay">📊 Vendas por Dia (30 dias)</option>
                              <option value="topProducts">🍔 Top 10 Produtos</option>
                              <option value="storesComparison">🏪 Comparação de Lojas</option>
                              <option value="statusDistribution">📈 Distribuição por Status</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                              Selecione para usar dados reais do sistema
                            </p>
                          </div>

                          {/* Endpoint customizado */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Endpoint da API
                            </label>
                            <input
                              type="text"
                              value={component.apiConfig?.endpoint || ""}
                              onChange={(e) => {
                                const updatedSlides = [...slides];
                                const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                if (comp && comp.apiConfig) {
                                  comp.apiConfig.endpoint = e.target.value;
                                  setSlides(updatedSlides);
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                              placeholder="/api/sales/summary"
                            />
                          </div>

                          {/* Parâmetros */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Parâmetros (JSON)
                            </label>
                            <textarea
                              value={JSON.stringify(component.apiConfig?.params || {}, null, 2)}
                              onChange={(e) => {
                                try {
                                  const params = JSON.parse(e.target.value);
                                  const updatedSlides = [...slides];
                                  const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                  if (comp && comp.apiConfig) {
                                    comp.apiConfig.params = params;
                                    setSlides(updatedSlides);
                                  }
                                } catch (err) {
                                  // Invalid JSON
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                              rows={3}
                              placeholder='{"days": "30"}'
                            />
                          </div>

                          {/* Filtros Adicionais */}
                          <div className="border-t pt-3 space-y-3">
                            <label className="block text-sm font-semibold text-slate-900">Filtros</label>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-slate-600">Data Início</label>
                                <input
                                  type="date"
                                  value={component.apiConfig?.filters?.startDate || ""}
                                  onChange={(e) => {
                                    const updatedSlides = [...slides];
                                    const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                    if (comp && comp.apiConfig) {
                                      if (!comp.apiConfig.filters) comp.apiConfig.filters = {};
                                      comp.apiConfig.filters.startDate = e.target.value;
                                      setSlides(updatedSlides);
                                    }
                                  }}
                                  className="w-full text-xs px-2 py-1 border border-slate-300 rounded mt-1"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-600">Data Fim</label>
                                <input
                                  type="date"
                                  value={component.apiConfig?.filters?.endDate || ""}
                                  onChange={(e) => {
                                    const updatedSlides = [...slides];
                                    const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                    if (comp && comp.apiConfig) {
                                      if (!comp.apiConfig.filters) comp.apiConfig.filters = {};
                                      comp.apiConfig.filters.endDate = e.target.value;
                                      setSlides(updatedSlides);
                                    }
                                  }}
                                  className="w-full text-xs px-2 py-1 border border-slate-300 rounded mt-1"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-xs text-slate-600 block mb-1">Dias da Semana</label>
                              <div className="flex flex-wrap gap-1">
                                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      const updatedSlides = [...slides];
                                      const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                      if (comp && comp.apiConfig) {
                                        if (!comp.apiConfig.filters) comp.apiConfig.filters = {};
                                        const current = comp.apiConfig.filters.daysOfWeek || [];
                                        if (current.includes(idx)) {
                                          comp.apiConfig.filters.daysOfWeek = current.filter(d => d !== idx);
                                        } else {
                                          comp.apiConfig.filters.daysOfWeek = [...current, idx];
                                        }
                                        setSlides(updatedSlides);
                                      }
                                    }}
                                    className={`text-xs px-2 py-1 rounded ${
                                      component.apiConfig?.filters?.daysOfWeek?.includes(idx)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {day}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Transformação */}
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Transformação dos Dados
                            </label>
                            <select
                              value={component.apiConfig?.transform || ""}
                              onChange={(e) => {
                                const updatedSlides = [...slides];
                                const comp = updatedSlides[currentSlideIndex].components.find(c => c.id === component.id);
                                if (comp && comp.apiConfig) {
                                  comp.apiConfig.transform = e.target.value;
                                  setSlides(updatedSlides);
                                }
                              }}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Nenhuma (usar dados brutos)</option>
                              <option value="salesByDay">📅 Vendas por Dia (formata datas)</option>
                              <option value="topProducts">🍔 Top Produtos (extrai nome/quantidade)</option>
                              <option value="storesComparison">🏪 Comparação de Lojas (agrupa por loja)</option>
                              <option value="statusDistribution">📊 Distribuição por Status (separa completas/canceladas)</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                              Converte os dados da API para o formato do gráfico (name/value)
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Dados estáticos */}
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
                        </>
                      )}
                      
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
