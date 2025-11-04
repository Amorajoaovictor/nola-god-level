"use client";

import { useState } from "react";
import { PresentationStore } from "@/lib/presentation/presentation-store";

interface AddToSlideButtonProps {
  title: string;
  type: 'chart' | 'table' | 'metrics' | 'custom';
  data: any;
  config?: any;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function AddToSlideButton({ 
  title, 
  type, 
  data, 
  config = {},
  variant = 'ghost'
}: AddToSlideButtonProps) {
  const [added, setAdded] = useState(false);

  const handleAddToSlide = () => {
    try {
      console.group('🎬 Adicionando slide');
      console.log('Title:', title);
      console.log('Type:', type);
      console.log('Data:', data);
      console.log('Config:', config);
      console.groupEnd();
      
      PresentationStore.addSlide({
        title,
        type,
        data,
        config,
      });
      
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Erro ao adicionar slide:', error);
      alert('Erro ao adicionar slide. Tente novamente.');
    }
  };

  const buttonStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-200 text-slate-700 hover:bg-slate-300",
    ghost: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-blue-500"
  };

  return (
    <button
      onClick={handleAddToSlide}
      disabled={added}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
        ${buttonStyles[variant]}
        ${added ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title="Adicionar este componente à apresentação"
    >
      {added ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Adicionado!</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Adicionar ao Slide</span>
        </>
      )}
    </button>
  );
}
