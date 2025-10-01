// src/app/dashboard/conteudo-gerado/page.js
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import { FiSearch, FiAlertCircle, FiCpu, FiFileText, FiMail, FiX, FiDownload, FiEye } from 'react-icons/fi';
import api from '@/lib/api';
import Modal from '@/componentsUser/Modal/Modal';
import emailModalStyles from '@/componentsUser/AssistantHistory/AssistantHistory.module.css'; // Reutilizando CSS do modal

export default function GeneratedContentPage() {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedItemForAction, setSelectedItemForAction] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailFormat, setEmailFormat] = useState('pdf');

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: pagination.currentPage, limit: 9 });
      // Se a busca no backend estiver implementada, adicione o searchTerm aqui
      // params.append('searchTerm', searchTerm);
      const response = await api.get(`/assistants/my-history?${params.toString()}`);
      
      const formattedHistory = response.data.history.map(item => ({
        id: item.id,
        assistantName: item.assistant?.name || 'Assistente Desconhecido',
        transcriptionName: item.transcription?.originalFileName || 'Transcrição Desconhecida',
        transcriptionId: item.transcription?.id || null,
        format: item.outputFormat || 'text',
        date: item.createdAt,
        status: item.status,
      }));
      
      setHistory(formattedHistory);
      setPagination({ currentPage: response.data.currentPage, totalPages: response.data.totalPages });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Não foi possível carregar o histórico.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const openEmailModal = (item) => {
    setSelectedItemForAction(item);
    setIsEmailModalOpen(true);
  };
  
  const handleAction = async (item, action) => {
    if (!item || !action) return;

    const isDownload = action.startsWith('download');
    const toastMessage = isDownload ? 'Iniciando download...' : 'Enviando email...';
    const toastId = toast.loading(toastMessage);

    try {
        const response = await api.post(
            `/history/${item.id}/actions`,
            { action },
            // Configuração crucial para downloads
            { responseType: isDownload ? 'blob' : 'json' }
        );

        if (isDownload) {
            const disposition = response.headers['content-disposition'];
            const filename = disposition?.split('filename=')[1]?.replaceAll('"', '') || `${item.transcriptionName.replace(/\.[^/.]+$/, "")}.${action.split('_')[1]}`;
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Download iniciado!', { id: toastId });
        } else {
            // Se for email, a resposta será um JSON com uma mensagem de sucesso
            toast.success(response.data.message || 'Email enviado com sucesso!', { id: toastId });
        }
    } catch (err) {
        const errorMessage = err.response?.data?.message || `Não foi possível ${isDownload ? 'baixar o arquivo' : 'enviar o email'}.`;
        toast.error(errorMessage, { id: toastId });
        console.error(`Erro na ação '${action}':`, err);
    }
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    return history.filter(item =>
      (item.assistantName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.transcriptionName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, history]);

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
            <h1 className={styles.title}>Conteúdo Gerado</h1>
            <p className={styles.subtitle}>Acesse todo o conteúdo gerado pelos seus assistentes de IA.</p>
          </div>
        </header>
        
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input type="text" placeholder="Buscar por assistente ou nome da transcrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className={styles.grid}>
              {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className={styles.errorContainer}><FiAlertCircle size={48}/><h2>Erro ao Carregar</h2><p>{error}</p></div>
        ) : (
          <>
            {filteredHistory.length > 0 ? (
              <div className={styles.grid}>
                  {filteredHistory.map(item => (
                      <div key={item.id} className={`${styles.card} ${item.status !== 'completed' ? styles.disabledCard : ''}`}>
                          <div className={styles.cardHeader}>
                              <FiCpu className={styles.cardIcon} />
                              <h3 className={styles.cardTitle}>{item.assistantName}</h3>
                          </div>
                          <p className={styles.cardSubtitle}>
                              Baseado em: <span>{item.transcriptionName}</span>
                          </p>
                          
                          <div className={styles.cardFooter}>
                              <div className={styles.metaInfo}>
                                  <span className={styles.date}>{formatDate(item.date)}</span>
                                  <span className={`${styles.formatTag} ${styles[item.format.toLowerCase()]}`}>{item.format}</span>
                              </div>
                              <span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status}</span>
                          </div>

                          {item.status === 'completed' && (
                            <div className={styles.cardActions}>
                                <button onClick={() => handleAction(item, 'download_txt')}><FiDownload/> TXT</button>
                                <button onClick={() => handleAction(item, 'download_pdf')}><FiDownload/> PDF</button>
                                <button onClick={() => openEmailModal(item)}><FiMail/> Email</button>
                                <Link href={`/dashboard/transcricoes/${item.transcriptionId}`}><FiEye/> Ver</Link>
                            </div>
                          )}
                      </div>
                  ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                <FiCpu size={48}/>
                <h3>Nenhum Conteúdo Encontrado</h3>
                <p>{history.length > 0 ? "Nenhum item corresponde à sua busca." : "Use um assistente em uma transcrição para gerar conteúdo."}</p>
              </div>
            )}
          </>
        )}

        {!isLoading && !error && history.length > 0 && (
          <PaginationComponent currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))} />
        )}
      </div>
      
      {isEmailModalOpen && selectedItemForAction && (
          <Modal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            title="Enviar Conteúdo por Email"
          >
            <div className={emailModalStyles.emailModalContent}>
                <p><strong>Assistente:</strong> {selectedItemForAction.assistantName}</p>
                <p><strong>Transcrição:</strong> {selectedItemForAction.transcriptionName}</p>
                
                <div className={emailModalStyles.formGroup}>
                  <label htmlFor="emailRecipient">Email do Destinatário:</label>
                  <input 
                      type="email" 
                      id="emailRecipient"
                      value={emailRecipient} 
                      onChange={(e) => setEmailRecipient(e.target.value)} 
                      placeholder="exemplo@dominio.com"
                      required
                  />
                </div>

                <div className={emailModalStyles.formGroup}>
                  <label>Formato do Anexo:</label>
                  <div className={emailModalStyles.radioGroup}>
                      <label>
                        <input type="radio" name="emailFormat" value="txt" checked={emailFormat === 'txt'} onChange={() => setEmailFormat('txt')} /> Texto (TXT)
                      </label>
                      <label>
                        <input type="radio" name="emailFormat" value="pdf" checked={emailFormat === 'pdf'} onChange={() => setEmailFormat('pdf')} /> PDF
                      </label>
                  </div>
                </div>

                <div className={emailModalStyles.modalActions}>
                  <button type="button" className={emailModalStyles.cancelButton} onClick={() => setIsEmailModalOpen(false)}>Cancelar</button>
                  <button type="button" className={emailModalStyles.saveButton} onClick={() => handleAction(selectedItemForAction, `email_${emailFormat}`)}>Enviar Email</button>
                </div>
            </div>
          </Modal>
      )}
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