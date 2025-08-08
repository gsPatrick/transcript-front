// src/app/dashboard/transcricoes/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
// --- CORREÇÃO APLICADA AQUI ---
import { FiFilePlus, FiSearch, FiDownload, FiEye, FiAlertCircle, FiFile, FiMail, FiX, FiCpu, FiFileText } from 'react-icons/fi';
import api from '@/lib/api';

// --- COMPONENTE DO MODAL DE AÇÕES ---
const ActionModal = ({ isOpen, onClose, item, onDownload, onGeneratePdf, onSendEmail }) => {
    if (!isOpen || !item) {
        return null;
    }

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Ações para: <span>{item.originalFileName}</span></h3>
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
                            <button onClick={() => { onGeneratePdf(item); onClose(); }} className={styles.modalActionButton} disabled>
                                <FiFile />
                                <span>Gerar PDF (Em breve)</span>
                            </button>
                            <button onClick={() => { onSendEmail(item); onClose(); }} className={styles.modalActionButton} disabled>
                                <FiMail />
                                <span>Enviar por Email (Em breve)</span>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTranscription, setSelectedTranscription] = useState(null);

  const openModal = (item) => {
    setSelectedTranscription(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTranscription(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchTranscriptions = async () => {
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
    };
    fetchTranscriptions();
  }, [pagination.currentPage, filterStatus]);

  const handleDownload = async (item) => {
    const toastId = toast.loading('Preparando download...');
    try {
      // Busca o texto completo antes de baixar
      const response = await api.get(`/transcriptions/my-transcriptions/${item.id}`);
      const fullTranscription = response.data;
      
      const element = document.createElement("a");
      const file = new Blob([fullTranscription.transcriptionText], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${fullTranscription.originalFileName.replace(/\.[^/.]+$/, "")}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success('Download iniciado!', { id: toastId });
    } catch (err) {
      toast.error('Não foi possível baixar o arquivo.', { id: toastId });
    }
  };

  const handleGeneratePdf = (item) => toast.info(`A geração de PDF para "${item.originalFileName}" estará disponível em breve.`);
  const handleSendEmail = (item) => toast.info(`O envio por e-mail para "${item.originalFileName}" estará disponível em breve.`);

  const filteredTranscriptions = useMemo(() => {
    if (!searchTerm) return transcriptions;
    return transcriptions.filter(item =>
      item.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, transcriptions]);
  
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
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input type="text" placeholder="Buscar por nome do arquivo..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className={styles.filterSelect} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPagination(prev => ({ ...prev, currentPage: 1 })); }}>
            <option value="Todos">Todos os Status</option>
            <option value="Completed">Concluído</option>
            <option value="Processing">Processando</option>
            <option value="Failed">Falhou</option>
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
                          <div key={item.id} className={styles.card} onClick={() => openModal(item)}>
                              <div className={styles.cardWave}></div>
                              <div className={styles.cardHeader}>
                                  <FiFileText className={styles.cardIcon} />
                                  <h3 className={styles.cardTitle}>{item.originalFileName}</h3>
                              </div>
                              <div className={styles.cardMeta}>
                                  <span>{formatDate(item.createdAt)}</span>
                                  <span>•</span>
                                  <span>{item.durationSeconds ? `${Math.round(item.durationSeconds)}s` : '-'}</span>
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
        onClose={closeModal}
        item={selectedTranscription}
        onDownload={handleDownload}
        onGeneratePdf={handleGeneratePdf}
        onSendEmail={handleSendEmail}
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