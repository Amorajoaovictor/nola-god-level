"use client";

import { useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  useEffect(() => {
    // Custom styling for Swagger UI
    document.title = 'API Documentation - Nola God Level';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">📚 API Documentation</h1>
          <p className="text-blue-100 text-lg">
            Nola God Level - Analytics & Reports API
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-8 px-6">
        <SwaggerUI url="/api/docs" />
      </div>
    </div>
  );
}
