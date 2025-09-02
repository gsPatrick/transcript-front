// src/app/dashboard/transcricoes/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import { 
  FiDownload, 
  FiCpu, 
  FiArrowLeft, 
  FiEdit, 
  FiSave, 
  FiAlertCircle, 
  FiFileText, 
  FiRefreshCw,
  FiPlayCircle,
  FiClock,
  FiCalendar,
  FiEye,
  FiMail,
  FiX,
  FiTrash2
} from 'react-icons/fi';
import api from '@/lib/api';
import Modal from '@/componentsUser/Modal/Modal';
import AssistantProcessing from '../../../../componentsUser/AgentProcessing/AgentProcessing';

// Helper para download de arquivos .txt
const downloadTxtFile = (filename, text) => {
  const element = document.createElement("a");
  const file = new Blob([text], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${filename.replace(/\.[^/.]+$/, "")}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Componente de Esqueleto para a página
const DetailPageSkeleton = () => (
    <div className={styles.page}>
        <header className={styles.header}>
            <div className={`${styles.skeleton} ${styles.skeletonBackButton}`}></div>
            <div className={styles.titleWrapper}>
                <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
            </div>
        </header>
        <div className={styles.layoutGrid}>
            <div className={`${styles.skeleton} ${styles.skeletonMainContent}`}></div>
            <div className={styles.sidebar}>
                <div className={`${styles.skeleton} ${styles.skeletonSidebarCard}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonSidebarCard}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonSidebarCard}`}></div>
            </div>
        </div>
    </div>
);


export default function TranscriptionDetailPage({ params }) {
  const { id: transcriptionId } = params;
  const router = useRouter();

  const [transcription, setTranscription] = useState(null);
  const [availableAssistants, setAvailableAssistants] = useState([]);
  const [assistantHistory, setAssistantHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [viewingHistoryItem, setViewingHistoryItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedHistoryItemForEmail, setSelectedHistoryItemForEmail] = useState(null);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailFormat, setEmailFormat] = useState('pdf');
  
  // Estados para edição do título
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const fetchData = async (forceReloadHistoryOnly = false) => {
    if (!transcriptionId) return;

    try {
        const promises = [
            api.get(`/assistants/my-history?transcriptionId=${transcriptionId}&limit=100`),
        ];

        if (!forceReloadHistoryOnly) {
            promises.unshift(api.get(`/transcriptions/my-transcriptions/${transcriptionId}`));
            promises.push(api.get('/assistants/available'));
            setIsLoading(true);
        }

        const responses = await Promise.all(promises);
        
        let historyRes;
        let localTranscription;

        if (forceReloadHistoryOnly) {
            [historyRes] = responses;
            localTranscription = transcription;
        } else {
            const [transcriptionRes, _historyRes, assistantsRes] = responses;
            historyRes = _historyRes;
            localTranscription = transcriptionRes.data;
            setTranscription(localTranscription);
            setEditedText(localTranscription.transcriptionText);
            setAvailableAssistants(assistantsRes.data);
            setNewTitle(localTranscription.title); // Inicializa o novo título com o título atual
        }
        
        const detailedHistoryPromises = historyRes.data.history.map(item => 
          item.status === 'completed' ? api.get(`/assistants/my-history/${item.id}`) : Promise.resolve({ data: item })
        );
        const detailedHistoryResponses = await Promise.all(detailedHistoryPromises);

        const formattedHistory = detailedHistoryResponses.map(res => ({
          ...res.data,
          assistantName: res.data.assistant ? res.data.assistant.name : 'Assistente Desconhecido',
          transcriptionName: localTranscription.title, // Usa o título editável
        }));

        setAssistantHistory(formattedHistory);
        setError(null);

    } catch (err) {
      console.error("Erro ao buscar detalhes:", err);
      const errorMessage = err.response?.data?.message || 'Não foi possível carregar os dados.';
      setError(errorMessage);
      if (!forceReloadHistoryOnly) {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptionId]);

  const handleSave = () => {
    setTranscription(prev => ({ ...prev, transcriptionText: editedText }));
    setIsEditing(false);
    toast.success('Alterações salvas localmente para esta sessão!');
  };

  const handleUseAssistant = async (assistantId) => {
    setIsProcessing(true);
    const toastId = toast.loading('Iniciando análise do assistente...');
    try {
      const response = await api.post('/assistants/run', { 
        assistantId, 
        transcriptionId,
      });
      toast.loading('Assistente está processando o texto...', { id: response.data.historyId, duration: 300000 });
      await pollHistoryStatus(response.data.historyId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Não foi possível iniciar a ação do assistente.';
      toast.error(errorMessage, { id: toastId });
      setIsProcessing(false);
    }
  };

  const pollHistoryStatus = async (historyId) => {
    const pollInterval = 3000;
    const maxAttempts = 40;
    let attempts = 0;

    const poll = setInterval(async () => {
      if (attempts >= maxAttempts) {
        clearInterval(poll);
        toast.error('O processamento demorou muito. O resultado aparecerá no histórico.', { id: historyId });
        setIsProcessing(false);
        fetchData(true);
        return;
      }
      try {
        const res = await api.get(`/assistants/my-history/${historyId}`);
        if (res.data.status === 'completed') {
          clearInterval(poll);
          toast.success('Análise do assistente concluída!', { id: historyId });
          setIsProcessing(false);
          fetchData(true);
        } else if (res.data.status === 'failed') {
          clearInterval(poll);
          toast.error(`Falha no processamento: ${res.data.errorMessage}`, { id: historyId });
          setIsProcessing(false);
          fetchData(true);
        }
      } catch (err) {
        clearInterval(poll);
        toast.error('Erro ao verificar status do processamento.', { id: historyId });
        setIsProcessing(false);
      }
      attempts++;
    }, pollInterval);
  };
  
  const handleHistoryAction = async (item, action) => {
    if (action === 'email') {
      setSelectedHistoryItemForEmail(item);
      setIsEmailModalOpen(true);
      return;
    }

    const toastId = toast.loading(`Processando: ${action.replace('_', ' ')}...`);
    try {
      const response = await api.post(
        `/history/${item.id}/actions`,
        { action },
        { responseType: 'blob' }
      );

      const disposition = response.headers['content-disposition'];
      const filename = disposition?.split('filename=')[1]?.replaceAll('"', '') || `${item.transcriptionName}.${action.split('_')[1]}`;
      
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
    }
  };

  const handleSendEmail = async () => {
    if (!selectedHistoryItemForEmail || !emailRecipient) {
      toast.error("Por favor, preencha o email do destinatário.");
      return;
    }
    const action = emailFormat === 'pdf' ? 'email_pdf' : 'email_txt';
    const toastId = toast.loading(`Enviando email (${emailFormat.toUpperCase()})...`);
    try {
      await api.post(`/history/${selectedHistoryItemForEmail.id}/actions`, {
        action,
        recipientEmail: emailRecipient,
      });
      toast.success('Email enviado com sucesso!', { id: toastId });
      setIsEmailModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Não foi possível enviar o email.', { id: toastId });
    }
  };
  
  const handleTitleSave = async () => {
    if (newTitle.trim() === '' || newTitle === transcription.title) {
        setIsEditingTitle(false);
        setNewTitle(transcription.title); // Garante que o estado reflita o valor real
        return;
    }
    const toastId = toast.loading('Salvando novo nome...');
    try {
        const response = await api.put(`/transcriptions/my-transcriptions/${transcriptionId}`, { title: newTitle });
        setTranscription(prev => ({ ...prev, title: response.data.title }));
        toast.success('Nome atualizado!', { id: toastId });
    } catch (err) {
        toast.error('Não foi possível salvar.', { id: toastId });
        setNewTitle(transcription.title); // Reverte em caso de erro
    } finally {
        setIsEditingTitle(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir "${transcription.title}"? Todos os conteúdos de IA gerados a partir dela também serão perdidos.`)) {
        const toastId = toast.loading('Excluindo transcrição...');
        try {
            await api.delete(`/transcriptions/my-transcriptions/${transcriptionId}`);
            toast.success('Excluído com sucesso!', { id: toastId });
            router.push('/dashboard/transcricoes');
        } catch (err) {
            toast.error('Falha ao excluir.', { id: toastId });
        }
    }
  };

  if (isLoading) return <DetailPageSkeleton />;
  if (error) return <div className={styles.errorContainer}><FiAlertCircle size={48}/><h2>Erro ao Carregar</h2><p>{error}</p></div>;
  if (!transcription) return null;

  return (
    <>
      {isProcessing && (
          <div className={styles.processingOverlay}>
              <AssistantProcessing />
          </div>
      )}
      <div className={styles.page}>
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.backButton} aria-label="Voltar">
            <FiArrowLeft />
          </button>
          <div className={styles.titleWrapper}>
            {isEditingTitle ? (
                <div className={styles.titleEditor}>
                    <input 
                      type="text" 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      autoFocus 
                      onBlur={handleTitleSave} 
                      onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()} 
                    />
                    <button onClick={handleTitleSave} title="Salvar"><FiSave/></button>
                    <button onClick={() => { setIsEditingTitle(false); setNewTitle(transcription.title); }} title="Cancelar"><FiX/></button>
                </div>
            ) : (
                <h1 className={styles.title} onClick={() => setIsEditingTitle(true)} title="Clique para editar">
                    {transcription.title} <FiEdit className={styles.editIcon}/>
                </h1>
            )}
            <p className={styles.subtitle}>{transcription.originalFileName}</p>
          </div>
          <button onClick={handleDelete} className={styles.deleteHeaderButton}><FiTrash2/> Excluir</button>
        </header>

        <div className={styles.layoutGrid}>
            <main className={styles.mainContent}>
                <div className={styles.editorWrapper}>
                    <div className={styles.editorToolbar}>
                      <h4>Conteúdo da Transcrição</h4>
                      <div className={styles.toolbarActions}>
                        {isEditing ? (
                            <button className={`${styles.actionButton} ${styles.saveButton}`} onClick={handleSave}><FiSave /> Salvar</button>
                        ) : (
                            <button className={styles.actionButton} onClick={() => setIsEditing(true)}><FiEdit /> Editar</button>
                        )}
                        <button className={styles.actionButton} onClick={() => downloadTxtFile(transcription.title, editedText)}>
                            <FiDownload/> Baixar .txt
                        </button>
                      </div>
                    </div>
                    {isEditing ? (
                      <textarea className={styles.editorTextarea} value={editedText} onChange={(e) => setEditedText(e.target.value)} />
                    ) : (
                      <div className={styles.transcriptionText}><pre>{editedText || "Esta transcrição não possui conteúdo."}</pre></div>
                    )}
                </div>
            </main>

            <aside className={styles.sidebar}>
                <div className={styles.sidebarCard}>
                    <h4 className={styles.sidebarTitle}>Detalhes do Arquivo</h4>
                    <ul className={styles.detailsList}>
                        <li><FiFileText/><span>{transcription.originalFileName}</span></li>
                        <li><FiCalendar/><span>{new Date(transcription.createdAt).toLocaleDateString('pt-BR')}</span></li>
                        <li><FiClock/><span>{transcription.durationSeconds ? `${parseFloat(transcription.durationSeconds).toFixed(1)} segundos` : 'Duração indisponível'}</span></li>
                    </ul>
                </div>

                <div className={styles.sidebarCard}>
                    <h4 className={styles.sidebarTitle}>Executar Assistente de IA</h4>
                    <div className={styles.assistantList}>
                        {availableAssistants.length > 0 ? availableAssistants.map(assistant => (
                            <button key={assistant.id} className={styles.assistantButton} onClick={() => handleUseAssistant(assistant.id)} disabled={isProcessing}>
                                <FiCpu />
                                <span>{assistant.name}</span>
                                <FiPlayCircle className={styles.playIcon}/>
                            </button>
                        )) : <p className={styles.emptyText}>Nenhum assistente disponível.</p>}
                    </div>
                </div>

                <div className={styles.sidebarCard}>
                    <h4 className={styles.sidebarTitle}><FiRefreshCw /> Histórico de Ações</h4>
                    <div className={styles.historyList}>
                        {assistantHistory.length > 0 ? assistantHistory.map(item => (
                            <div key={item.id} className={styles.historyItem}>
                                <div className={styles.historyInfo}>
                                    <span className={styles.historyAgentName}>{item.assistantName}</span>
                                    <span className={styles.historyDate}>{new Date(item.createdAt).toLocaleString('pt-BR')}</span>
                                </div>
                                <div className={styles.historyStatus}>
                                    <span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status}</span>
                                    {item.status === 'completed' && (
                                        <div className={styles.historyActions}>
                                            <button onClick={() => setViewingHistoryItem(item)} title="Ver Resultado"><FiEye/></button>
                                            <button onClick={() => handleHistoryAction(item, 'download_txt')} title="Baixar TXT"><FiDownload/></button>
                                            <button onClick={() => handleHistoryAction(item, 'download_pdf')} title="Baixar PDF"><FiFileText/></button>
                                            <button onClick={() => handleHistoryAction(item, 'email')} title="Enviar por Email"><FiMail/></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : <p className={styles.emptyText}>Nenhuma ação foi executada nesta transcrição.</p>}
                    </div>
                </div>
            </aside>
        </div>
      </div>
      
      {viewingHistoryItem && (
        <Modal isOpen={true} onClose={() => setViewingHistoryItem(null)} title={`Resultado de: ${viewingHistoryItem.assistantName}`}>
          <pre className={styles.modalTextContent}>{viewingHistoryItem.outputText}</pre>
        </Modal>
      )}

      {isEmailModalOpen && (
        <Modal 
          isOpen={isEmailModalOpen} 
          onClose={() => setIsEmailModalOpen(false)} 
          title="Enviar Conteúdo por Email"
        >
          <div className={styles.emailModalContent}>
            <p><strong>Assistente:</strong> {selectedHistoryItemForEmail?.assistantName}</p>
            <p><strong>Transcrição:</strong> {selectedHistoryItemForEmail?.transcriptionName}</p>
            
            <div className={styles.formGroup}>
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

            <div className={styles.formGroup}>
              <label>Formato:</label>
              <div className={styles.radioGroup}>
                <label>
                  <input type="radio" name="emailFormat" value="txt" checked={emailFormat === 'txt'} onChange={() => setEmailFormat('txt')} /> Texto
                </label>
                <label>
                  <input type="radio" name="emailFormat" value="pdf" checked={emailFormat === 'pdf'} onChange={() => setEmailFormat('pdf')} /> PDF
                </label>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelButton} onClick={() => setIsEmailModalOpen(false)}>Cancelar</button>
              <button type="button" className={styles.saveButton} onClick={handleSendEmail}>Enviar Email</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}