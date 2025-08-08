// src/app/dashboard/conteudo-gerado/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import styles from './page.module.css';
import { FiSearch, FiAlertCircle, FiCpu, FiFileText, FiMail, FiX } from 'react-icons/fi';
import api from '@/lib/api';
import Modal from '@/componentsUser/Modal/Modal';
import emailModalStyles from '@/componentsUser/AssistantHistory/AssistantHistory.module.css';

// Componente de Ações refatorado
const ActionModal = ({ isOpen, onClose, item, onAction }) => {
  if (!isOpen || !item) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Ações para: <span>{item.transcriptionName}</span></h3>
          <button className={styles.modalCloseButton} onClick={onClose}><FiX /></button>
        </div>
        <div className={styles.modalBody}>
          <button onClick={() => { onAction('download_txt'); onClose(); }} className={styles.modalActionButton}>
            <FiFileText /> <span>Baixar TXT</span>
          </button>
          <button onClick={() => { onAction('download_pdf'); onClose(); }} className={styles.modalActionButton}>
            <FiFileText /> <span>Baixar PDF</span>
          </button>
          <button onClick={() => { onAction('email'); onClose(); }} className={styles.modalActionButton}>
            <FiMail /> <span>Enviar por Email</span>
          </button>
          {item.transcriptionId && (
            <Link href={`/dashboard/transcricoes/${item.transcriptionId}`} className={`${styles.modalActionButton} ${styles.secondaryAction}`}>
              <FiCpu /> <span>Ver Transcrição Original</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default function GeneratedContentPage() {
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] = useState(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailFormat, setEmailFormat] = useState('pdf');

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page: pagination.currentPage, limit: 9 });
        const response = await api.get(`/assistants/my-history?${params.toString()}`);
        
        const formattedHistory = response.data.history.map(item => ({
          id: item.id,
          assistantName: item.assistant ? item.assistant.name : 'Assistente Desconhecido',
          transcriptionName: item.transcription ? item.transcription.originalFileName : 'Transcrição Desconhecida',
          transcriptionId: item.transcription ? item.transcription.id : null,
          format: item.assistant.outputFormat || 'TEXT',
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
    };
    fetchHistory();
  }, [pagination.currentPage]);

  const openActionModal = (item) => {
    setSelectedItemForAction(item);
    setIsActionModalOpen(true);
  };

  const handleHistoryAction = async (action) => {
    if (!selectedItemForAction) return;

    if (action === 'email') {
      setIsEmailModalOpen(true);
      return;
    }

    const toastId = toast.loading(`Processando: ${action.replace('_', ' ')}...`);
    try {
      const response = await api.post(
        `/history/${selectedItemForAction.id}/actions`,
        { action },
        { responseType: 'blob' }
      );

      const disposition = response.headers['content-disposition'];
      const filename = disposition?.split('filename=')[1]?.replaceAll('"', '') || `${selectedItemForAction.transcriptionName}.${action.split('_')[1]}`;
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download iniciado!', { id: toastId });
    } catch (err) {
      toast.error('Não foi possível processar a sua solicitação.', { id: toastId });
      console.error("Erro na ação do histórico:", err);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedItemForAction || !emailRecipient) {
      toast.error("Destinatário ou item inválido.");
      return;
    }

    const action = emailFormat === 'pdf' ? 'email_pdf' : 'email_txt';
    const toastId = toast.loading(`Enviando e-mail com ${emailFormat.toUpperCase()}...`);
    
    try {
      await api.post(`/history/${selectedItemForAction.id}/actions`, {
        action,
        recipientEmail: emailRecipient,
      });
      
      toast.success('Email enviado com sucesso!', { id: toastId });
      setIsEmailModalOpen(false);
      setSelectedItemForAction(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível enviar o e-mail.', { id: toastId });
    }
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    return history.filter(item =>
      (item.assistantName && item.assistantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.transcriptionName && item.transcriptionName.toLowerCase().includes(searchTerm.toLowerCase()))
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
                      <div key={item.id} className={`${styles.card} ${item.status !== 'completed' ? styles.disabledCard : ''}`} onClick={() => item.status === 'completed' && openActionModal(item)}>
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

      <ActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        item={selectedItemForAction}
        onAction={handleHistoryAction}
      />
      
      {isEmailModalOpen && (
          <Modal
            isOpen={isEmailModalOpen}
            onClose={() => setIsEmailModalOpen(false)}
            title="Enviar Conteúdo por Email"
          >
          <div className={emailModalStyles.emailModalContent}>
              <p><strong>Assistente:</strong> {selectedItemForAction?.assistantName}</p>
              <p><strong>Transcrição:</strong> {selectedItemForAction?.transcriptionName}</p>
              
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
              <label>Formato:</label>
              <div className={emailModalStyles.radioGroup}>
                  <label>
                  <input type="radio" name="emailFormat" value="txt" checked={emailFormat === 'txt'} onChange={() => setEmailFormat('txt')} /> Texto
                  </label>
                  <label>
                  <input type="radio" name="emailFormat" value="pdf" checked={emailFormat === 'pdf'} onChange={() => setEmailFormat('pdf')} /> PDF
                  </label>
              </div>
              </div>

              <div className={emailModalStyles.modalActions}>
              <button type="button" className={emailModalStyles.cancelButton} onClick={() => setIsEmailModalOpen(false)}>Cancelar</button>
              <button type="button" className={emailModalStyles.saveButton} onClick={handleSendEmail}>Enviar Email</button>
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