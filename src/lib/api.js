// src/lib/api.js

import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// --- INSTÂNCIA PRIVADA (AUTENTICADA) ---
// Esta é a instância que usaremos para todas as rotas que precisam de login.
const api = axios.create({
  baseURL,
});

// Interceptor de Requisição (adiciona o token)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta (trata token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        // Apenas loga o erro. O redirecionamento pode ser tratado no componente.
        console.error("Sessão expirada ou token inválido. Por favor, faça login novamente.");
        // window.location.href = '/login'; // Descomente se preferir redirecionamento forçado
      }
    }
    return Promise.reject(error);
  }
);

// --- NOVA INSTÂNCIA PÚBLICA ---
// Esta instância NUNCA enviará o token de autenticação.
// Perfeita para buscar dados públicos como a lista de planos.
export const publicApi = axios.create({
  baseURL,
});

export default api;