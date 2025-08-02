// src/app/dashboard/conteudo-gerado/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import AssistantHistory from '@/componentsUser/AssistantHistory/AssistantHistory'; // <<< Alterado
import { FiSearch, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={styles.pagination}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Anterior
      </button>
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={currentPage === page ? styles.active : ''}
        >
          {page}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Próxima
      </button>
    </nav>
  );
};

export default function GeneratedContentPage() {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: pagination.currentPage, limit: 10 });
        // <<< API ENDPOINT ALTERADO >>>
        const response = await api.get(`/assistants/my-history?${params.toString()}`);
        
        // Mapeia os dados da API para o formato esperado
        const formattedHistory = response.data.history.map(item => ({
          id: item.id,
          // Garante que o nome do assistente e transcrição venham do include
          assistantName: item.assistant ? item.assistant.name : 'Assistente Desconhecido',
          transcriptionName: item.transcription ? item.transcription.originalFileName : 'Transcrição Desconhecida',
          transcriptionId: item.transcription ? item.transcription.id : null,
          format: item.outputFormat,
          date: item.createdAt,
          outputText: item.outputText, // Pode vir nulo para downloads
        }));
        
        setHistory(formattedHistory);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Não foi possível carregar o histórico.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [pagination.currentPage]);

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    return history.filter(item =>
      (item.assistantName && item.assistantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.transcriptionName && item.transcriptionName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, history]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Conteúdo Gerado</h1>
          <p className={styles.subtitle}>Acesse todo o conteúdo gerado pelos seus assistentes de IA.</p>
        </div>
      </header>
      
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por assistente ou nome da transcrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <p>Carregando histórico...</p>
      ) : error ? (
        <div className={styles.errorContainer}><FiAlertCircle size={32}/> {error}</div>
      ) : (
        <>
          <AssistantHistory history={filteredHistory} /> {/* <<< Alterado */}
          {filteredHistory.length === 0 && (
            <p className={styles.noResults}>
              {history.length > 0 ? "Nenhum item corresponde à sua busca." : "Nenhum conteúdo gerado por assistentes ainda."}
            </p>
          )}
        </>
      )}

      {!isLoading && !error && history.length > 0 && (
        <PaginationComponent 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
        />
      )}
    </div>
  );
}