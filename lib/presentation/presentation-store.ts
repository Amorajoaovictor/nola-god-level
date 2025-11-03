/**
 * Sistema de gerenciamento de slides para apresentações
 * Salva em localStorage
 */

export interface Slide {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'metrics' | 'custom';
  data: any;
  config: any;
  createdAt: string;
  order: number;
}

export interface Presentation {
  id: string;
  name: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'nola-presentations';
const CURRENT_PRESENTATION_KEY = 'nola-current-presentation';

export class PresentationStore {
  
  // Obter todas as apresentações
  static getAll(): Presentation[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Obter apresentação atual
  static getCurrent(): Presentation | null {
    if (typeof window === 'undefined') return null;
    const presentations = this.getAll();
    const currentId = localStorage.getItem(CURRENT_PRESENTATION_KEY);
    
    if (!currentId || presentations.length === 0) {
      // Criar uma apresentação padrão se não existir
      const newPresentation = this.create('Minha Apresentação');
      this.setCurrent(newPresentation.id);
      return newPresentation;
    }
    
    return presentations.find(p => p.id === currentId) || presentations[0];
  }

  // Criar nova apresentação
  static create(name: string): Presentation {
    const presentations = this.getAll();
    const newPresentation: Presentation = {
      id: `pres-${Date.now()}`,
      name,
      slides: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    presentations.push(newPresentation);
    this.saveAll(presentations);
    return newPresentation;
  }

  // Adicionar slide à apresentação atual
  static addSlide(slide: Omit<Slide, 'id' | 'order' | 'createdAt'>): Slide {
    const current = this.getCurrent();
    if (!current) throw new Error('Nenhuma apresentação ativa');

    const newSlide: Slide = {
      ...slide,
      id: `slide-${Date.now()}`,
      order: current.slides.length,
      createdAt: new Date().toISOString(),
    };

    current.slides.push(newSlide);
    current.updatedAt = new Date().toISOString();
    
    this.update(current);
    return newSlide;
  }

  // Remover slide
  static removeSlide(slideId: string): void {
    const current = this.getCurrent();
    if (!current) return;

    current.slides = current.slides.filter(s => s.id !== slideId);
    current.slides.forEach((s, idx) => s.order = idx);
    current.updatedAt = new Date().toISOString();
    
    this.update(current);
  }

  // Reordenar slides
  static reorderSlides(slideIds: string[]): void {
    const current = this.getCurrent();
    if (!current) return;

    const slideMap = new Map(current.slides.map(s => [s.id, s]));
    current.slides = slideIds.map((id, idx) => {
      const slide = slideMap.get(id);
      if (slide) {
        slide.order = idx;
        return slide;
      }
      return null;
    }).filter(Boolean) as Slide[];
    
    current.updatedAt = new Date().toISOString();
    this.update(current);
  }

  // Atualizar apresentação
  static update(presentation: Presentation): void {
    const presentations = this.getAll();
    const index = presentations.findIndex(p => p.id === presentation.id);
    
    if (index !== -1) {
      presentations[index] = presentation;
      this.saveAll(presentations);
    }
  }

  // Deletar apresentação
  static delete(presentationId: string): void {
    let presentations = this.getAll();
    presentations = presentations.filter(p => p.id !== presentationId);
    this.saveAll(presentations);
    
    // Se deletou a atual, mudar para outra
    const currentId = localStorage.getItem(CURRENT_PRESENTATION_KEY);
    if (currentId === presentationId && presentations.length > 0) {
      this.setCurrent(presentations[0].id);
    }
  }

  // Definir apresentação atual
  static setCurrent(presentationId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CURRENT_PRESENTATION_KEY, presentationId);
  }

  // Salvar todas as apresentações
  private static saveAll(presentations: Presentation[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));
  }

  // Exportar apresentação para JSON
  static exportToJSON(presentationId?: string): string {
    const presentation = presentationId 
      ? this.getAll().find(p => p.id === presentationId)
      : this.getCurrent();
    
    if (!presentation) throw new Error('Apresentação não encontrada');
    return JSON.stringify(presentation, null, 2);
  }

  // Importar apresentação de JSON
  static importFromJSON(json: string): Presentation {
    const presentation: Presentation = JSON.parse(json);
    presentation.id = `pres-${Date.now()}`; // Novo ID
    presentation.slides.forEach((s, idx) => {
      s.id = `slide-${Date.now()}-${idx}`;
    });
    
    const presentations = this.getAll();
    presentations.push(presentation);
    this.saveAll(presentations);
    
    return presentation;
  }
}
