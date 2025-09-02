// src/app/dashboard/transcricoes/page.js
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import { FiFilePlus, FiSearch, FiFileText, FiDownload, FiEye, FiAlertCircle, FiFile, FiMail, FiX, FiEdit, FiTrash2 } from 'react-icons/fi';
import api from '@/lib/api';

// --- COMPONENTE DO MODAL DE AÇÕES (ATUALIZADO) ---
const ActionModal = ({ isOpen, onClose, item, onRename, onDelete, onDownload }) => {
    if (!isOpen || !item) {
        return null;
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Ações para: <span>{item.title}</span></h3>
                    <button className={styles.modalCloseButton} onClick={onClose}><FiX /></button>
                </div>
                <div className={styles.modalBody}>
                    <Link href={`/dashboard/transcricoes/${item.id}`} className={styles.modalActionButton}>
                        <FiEye />
                        <span>Ver Detalhes e Usar IA</span>
                    </Link>
                    {/* Ações condicionais baseadas no status */}
                    {item.status === 'completed' && (
                        <>
                            <button onClick={() => { onDownload(item); onClose(); }} className={styles.modalActionButton}>
                                <FiDownload />
                                <span>Baixar TXT</span>
                            </button>
                            <button onClick={() => { onRename(item); onClose(); }} className={styles.modalActionButton}>
                                <FiEdit />
                                <span>Renomear</span>
                            </button>
                            <button onClick={() => { onDelete(item); onClose(); }} className={`${styles.modalActionButton} ${styles.deleteButton}`}>
                                <FiTrash2 />
                                <span>Excluir</span>
                            </button>
                        </>
                    )}
                     {item.status === 'processing' && (
                        <p className={styles.modalInfoText}>Aguarde a conclusão para mais ações.</p>
                     )}
                     {item.status === 'failed' && (
                        <p className={styles.modalInfoText}>Esta transcrição falhou. Crie uma nova.</p>
                     )}
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function TranscriptionsPage() {
  const [transcriptions, setTranscriptions] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState(null);

  const fetchTranscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: pagination.currentPage, limit: 12 });
      if (filterStatus !== 'Todos') {
        params.append('status', filterStatus.toLowerCase());
      }
      const response = await api.get(`/transcriptions/my-transcriptions?${params.toString()}`);
      setTranscriptions(response.data.transcriptions);
      setPagination({ currentPage: response.data.currentPage, totalPages: response.data.totalPages });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Não foi possível carregar as transcrições.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, filterStatus]);


  useEffect(() => {
    fetchTranscriptions();
  }, [fetchTranscriptions]);

  const handleDownload = async (item) => {
    const toastId = toast.loading('Preparando download...');
    try {
      // Busca o texto completo antes de baixar
      const response = await api.get(`/transcriptions/my-transcriptions/${item.id}`);
      const fullTranscription = response.data;
      
      const element = document.createElement("a");
      const file = new Blob([fullTranscription.transcriptionText], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${fullTranscription.title.replace(/\.[^/.]+$/, "")}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success('Download iniciado!', { id: toastId });
    } catch (err) {
      toast.error('Não foi possível baixar o arquivo.', { id: toastId });
    }
  };
  
  const handleRename = async (item) => {
    const newTitle = prompt("Digite o novo nome para a transcrição:", item.title);
    if (newTitle && newTitle.trim() !== '' && newTitle !== item.title) {
        const toastId = toast.loading('Renomeando...');
        try {
            await api.put(`/transcriptions/my-transcriptions/${item.id}`, { title: newTitle });
            toast.success('Transcrição renomeada!', { id: toastId });
            fetchTranscriptions(); // Recarrega a lista
        } catch (err) {
            toast.error('Não foi possível renomear.', { id: toastId });
        }
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Tem certeza que deseja excluir "${item.title}"? Esta ação não pode ser desfeita.`)) {
        const toastId = toast.loading('Excluindo...');
        try {
            await api.delete(`/transcriptions/my-transcriptions/${item.id}`);
            toast.success('Transcrição excluída!', { id: toastId });
            // Se for a última transcrição na página atual e não for a primeira página, volte uma página
            if (transcriptions.length === 1 && pagination.currentPage > 1) {
                setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
            } else {
                fetchTranscriptions(); // Recarrega a lista na página atual
            }
        } catch (err) {
            toast.error('Não foi possível excluir.', { id: toastId });
        }
    }
  };

  const filteredTranscriptions = useMemo(() => {
    return transcriptions; // A busca agora é feita no backend
  }, [transcriptions]);
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const CardSkeleton = () => <div className={`${styles.card} ${styles.skeleton}`}></div>;

  return (
    <>
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
          {/* A busca foi removida pois o backend não a implementava para transcrições. 
              Pode ser re-adicionada se o endpoint for atualizado. */}
          <select className={styles.filterSelect} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPagination(prev => ({ ...prev, currentPage: 1 })); }}>
            <option value="Todos">Todos os Status</option>
            <option value="completed">Concluído</option>
            <option value="processing">Processando</option>
            <option value="failed">Falhou</option>
          </select>
        </div>

        {isLoading ? (
          <div className={styles.grid}>
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className={styles.errorContainer}><FiAlertCircle size={48} /><h2>Erro ao Carregar</h2><p>{error}</p></div>
        ) : (
          <>
              {filteredTranscriptions.length > 0 ? (
                  <div className={styles.grid}>
                      {filteredTranscriptions.map(item => (
                          <div key={item.id} className={styles.card} onClick={() => {setSelectedTranscription(item); setIsModalOpen(true);}}>
                              <div className={styles.cardWave}></div>
                              <div className={styles.cardHeader}>
                                  <FiFileText className={styles.cardIcon} />
                                  <h3 className={styles.cardTitle}>{item.title}</h3>
                              </div>
                              <div className={styles.cardMeta}>
                                  <span>{formatDate(item.createdAt)}</span>
                              </div>
                              <div className={`${styles.status} ${styles[item.status.toLowerCase()]}`}>
                                  {item.status}
                              </div>
                              <div className={styles.cardFooter}>
                                  Clique para ver as ações
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className={styles.noResults}>
                      <FiFileText size={48}/>
                      <h3>Nenhuma Transcrição Encontrada</h3>
                      <p>Tente ajustar seus filtros ou <Link href="/dashboard/nova-transcricao">crie uma nova transcrição</Link>.</p>
                  </div>
              )}
          </>
        )}
        
        {!isLoading && !error && transcriptions.length > 0 && (
          <PaginationComponent currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))} />
        )}
      </div>

      <ActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedTranscription}
        onDownload={handleDownload}
        onRename={handleRename}
        onDelete={handleDelete}
      />
    </>
  );
}

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className={styles.pagination}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
      {pages.map(page => (<button key={page} onClick={() => onPageChange(page)} className={currentPage === page ? styles.active : ''}>{page}</button>))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Próxima</button>
    </nav>
  );
};