import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Filtrar advertencias inofensivas de dimensiones de Recharts en la consola
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('width') || args[0].includes('height')) &&
    args[0].includes('chart should be greater than 0')
  ) {
    return;
  }
  originalWarn(...args);
};

// Creamos una instancia del cliente
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Evita que vuelva a pedir datos al cambiar de ventana para mantener estados actualizados
      refetchOnWindowFocus: false, 
      staleTime: Infinity, // Mantenemos los datos en caché "frescos"
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </BrowserRouter>
);