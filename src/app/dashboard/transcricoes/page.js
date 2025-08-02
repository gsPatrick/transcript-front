// src/app/dashboard/transcricoes/page.js

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import { FiFilePlus, FiSearch, FiDownload, FiCpu, FiEye, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

// Helper para formatar a data
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Helper para download de texto
const downloadTxtFile = (filename, text) => {
  const element = document.createElement("a");
  const file = new Blob([text], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${filename.replace(/\.[^/.]+$/, "")}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export default function TranscriptionsPage() {
  const [transcriptions, setTranscriptions] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTranscriptions = async () => {
      setIsLoading(true);
      setError(null); // Limpa erros anteriores
      try {
        const params = new URLSearchParams({
          page: pagination.currentPage,
          limit: 10,
        });
        if (filterStatus !== 'Todos') {
          params.append('status', filterStatus.toLowerCase());
        }

        const response = await api.get(`/transcriptions/my-transcriptions?${params.toString()}`);
        setTranscriptions(response.data.transcriptions);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
        });
      } catch (err) {
        // <<< ADICIONADO: Log completo do erro para depuração >>>
        console.error("Erro ao buscar transcrições:", err); 
        const errorMessage = err.response?.data?.message || 'Não foi possível carregar as transcrições. Por favor, tente novamente mais tarde.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranscriptions();
  }, [pagination.currentPage, filterStatus]);

  const handleDownload = async (item) => {
    toast.loading('Preparando download...');
    try {
      const response = await api.get(`/transcriptions/my-transcriptions/${item.id}`);
      const fullTranscription = response.data;
      downloadTxtFile(fullTranscription.originalFileName, fullTranscription.transcriptionText);
      toast.dismiss();
      toast.success('Download iniciado!');
    } catch (err) {
      toast.dismiss();
      toast.error('Não foi possível baixar o arquivo.');
    }
  };

  const filteredTranscriptions = useMemo(() => {
    if (!searchTerm) return transcriptions;
    return transcriptions.filter(item =>
      item.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transcriptions]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Minhas Transcrições</h1>
          <p className={styles.subtitle}>Gerencie, visualize e utilize suas transcrições de áudio.</p>
        </div>
        <Link href="/dashboard/nova-transcricao" className={styles.ctaButton}>
          <FiFilePlus />
          Nova Transcrição
        </Link>
      </header>
      
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nome do arquivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPagination(prev => ({ ...prev, currentPage: 1 })); // Reseta para a primeira página ao mudar filtro
          }}
        >
          <option value="Todos">Todos os Status</option>
          <option value="Completed">Concluído</option>
          <option value="Processing">Processando</option>
          <option value="Failed">Falhou</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : error ? (
        <div className={styles.errorContainer}><FiAlertCircle size={32} /> {error}</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableRow}>
                <th className={styles.tableHeaderCell}>Nome do Arquivo</th>
                <th className={styles.tableHeaderCell}>Data</th>
                <th className={styles.tableHeaderCell}>Duração (s)</th>
                <th className={styles.tableHeaderCell}>Status</th>
                <th className={styles.tableHeaderCell}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTranscriptions.length > 0 ? (
                filteredTranscriptions.map(item => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.tableBodyCell}>{item.originalFileName}</td>
                    <td className={styles.tableBodyCell}>{formatDate(item.createdAt)}</td>
                    <td className={styles.tableBodyCell}>{item.durationSeconds ? parseFloat(item.durationSeconds).toFixed(1) : '-'}</td>
                    <td className={styles.tableBodyCell}>
                      <span className={`${styles.status} ${styles[item.status.toLowerCase()]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className={`${styles.tableBodyCell} ${styles.actionsCell}`}>
                      <ActionMenu>
                        <Link href={`/dashboard/transcricoes/${item.id}`} className={styles.menuItem}>
                          <FiEye /> Ver Detalhes
                        </Link>
                        {item.status === 'completed' && (
                          <>
                            <button onClick={() => handleDownload(item)} className={styles.menuItem}>
                              <FiDownload /> Baixar .txt
                            </button>
                            {/* O botão "Usar Agente de IA" foi removido daqui pois agora a interação com IA
                                acontece na página de detalhes da transcrição com os Assistentes. */}
                          </>
                        )}
                      </ActionMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className={styles.tableRow}>
                  <td colSpan="5" className={styles.noResults}>
                    Nenhuma transcrição encontrada com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {!isLoading && !error && filteredTranscriptions.length > 0 && (
        <PaginationComponent 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
        />
      )}
    </div>
  );
}

const TableSkeleton = () => (
    <div className={styles.tableWrapper}>
        <table className={styles.table}>
            <thead>
                <tr>
                    {[...Array(5)].map((_, i) => <th key={i}><div className={`${styles.skeleton} ${styles.skeletonHeader}`}></div></th>)}
                </tr>
            </thead>
            <tbody>
                {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                        {[...Array(5)].map((_, j) => <td key={j}><div className={`${styles.skeleton} ${styles.skeletonCell}`}></div></td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

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