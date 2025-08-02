// src/app/dashboard/transcricoes/[id]/page.js

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import { FiDownload, FiCpu, FiArrowLeft, FiEdit, FiSave, FiAlertCircle, FiFileText, FiRefreshCw } from 'react-icons/fi';
import api from '@/lib/api';
import Modal from '@/componentsUser/Modal/Modal';
import AssistantProcessing from '@/componentsUser/AssistantProcessing/AssistantProcessing'; // <<< CORRIGIDO: Caminho e nome do componente de animação

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

export default function TranscriptionDetailPage({ params }) {
  const { id: transcriptionId } = params;
  const router = useRouter();

  const [transcription, setTranscription] = useState(null);
  const [availableAssistants, setAvailableAssistants] = useState([]);
  const [assistantHistory, setAssistantHistory] = useState([]); // Histórico de ações de assistentes
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewingHistoryItem, setViewingHistoryItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Estado para controlar a animação de processamento
  const dropdownRef = useRef(null);

  const fetchData = async () => {
    // Para evitar múltiplas requisições, só recarregamos o histórico se necessário
    if (!transcriptionId) return;
    try {
        const [transcriptionRes, assistantsRes, historyRes] = await Promise.all([
            // Só busca a transcrição se ainda não tiver sido carregada
            !transcription ? api.get(`/transcriptions/my-transcriptions/${transcriptionId}`) : Promise.resolve({ data: transcription }),
            // Só busca assistentes se ainda não tiverem sido carregados
            availableAssistants.length === 0 ? api.get('/assistants/available') : Promise.resolve({ data: availableAssistants }),
            // Sempre busca o histórico mais recente para a transcrição
            api.get(`/assistants/my-history?transcriptionId=${transcriptionId}`),
        ]);

        if (!transcription) { // Se a transcrição ainda não foi carregada
            setTranscription(transcriptionRes.data);
            setEditedText(transcriptionRes.data.transcriptionText);
        }
        if (availableAssistants.length === 0) { // Se os assistentes ainda não foram carregados
            setAvailableAssistants(assistantsRes.data);
        }
        
        // Mapeia os dados do histórico para incluir nomes completos de assistente e transcrição
        const formattedHistory = historyRes.data.history.map(item => ({
          ...item,
          assistantName: item.assistant ? item.assistant.name : 'Assistente Desconhecido',
          transcriptionName: item.transcription ? item.transcription.originalFileName : 'Transcrição Desconhecida',
        }));
        setAssistantHistory(formattedHistory);
        setError(null);

    } catch (err) {
      console.error("Erro ao buscar detalhes da transcrição:", err); // Log mais detalhado
      const errorMessage = err.response?.data?.message || 'Não foi possível carregar os dados.';
      setError(errorMessage);
      if (!transcription) toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    setIsLoading(true);
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcriptionId]); // Depende do ID da transcrição

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSave = () => {
    setTranscription(prev => ({ ...prev, transcriptionText: editedText }));
    setIsEditing(false);
    toast.success('Alterações salvas localmente!');
  };

  const handleUseAssistant = async (assistantId) => {
    setIsDropdownOpen(false); // Fecha o dropdown
    setIsProcessing(true); // Mostra a animação de processamento

    try {
      // 1. Chama o endpoint correto para executar a tarefa one-shot
      const response = await api.post('/assistants/run', {
        assistantId,
        transcriptionId,
      });

      const historyId = response.data.historyId;
      toast.loading('Assistente está processando o texto...', { id: historyId, duration: 300000 });

      // 2. Inicia o polling para verificar quando o resultado estiver pronto
      await pollHistoryStatus(historyId);

    } catch (err) {
      console.error('Erro ao iniciar ação do assistente:', err);
      const errorMessage = err.response?.data?.message || 'Não foi possível iniciar a ação.';
      toast.error(errorMessage);
      setIsProcessing(false); // Esconde a animação em caso de erro
    }
  };

  const pollHistoryStatus = async (historyId) => {
    const pollInterval = 3000; // 3 segundos
    const maxAttempts = 40;    // 40 tentativas * 3s = 120 segundos (2 minutos)
    let attempts = 0;

    const poll = setInterval(async () => {
      if (attempts >= maxAttempts) {
        clearInterval(poll);
        toast.error('O processamento demorou muito. Verifique o resultado mais tarde.', { id: historyId });
        setIsProcessing(false);
        fetchData(); // Recarrega os dados para mostrar o item como "processando"
        return;
      }
      try {
        const res = await api.get(`/assistants/my-history/${historyId}`);
        if (res.data.status === 'completed') {
          clearInterval(poll);
          toast.success('Análise concluída!', { id: historyId });
          setIsProcessing(false);
          fetchData(); // Recarrega todos os dados, incluindo o novo item no histórico
        } else if (res.data.status === 'failed') {
          clearInterval(poll);
          toast.error(`Falha no processamento: ${res.data.errorMessage}`, { id: historyId });
          setIsProcessing(false);
          fetchData();
        }
      } catch (err) {
        console.error("Erro ao verificar status do assistente:", err); // Log mais detalhado
        clearInterval(poll);
        toast.error('Erro ao verificar status do processamento.', { id: historyId });
        setIsProcessing(false);
      }
      attempts++;
    }, pollInterval);
  };
  
  const handleDownloadHistory = async (item) => {
    // Para baixar, precisamos do item completo do histórico que tem o outputText
    const toastId = toast.loading('Preparando download...');
    try {
        // Busca os detalhes completos do histórico para garantir outputText/outputFilePath
        const response = await api.get(`/assistants/my-history/${item.id}`);
        const fullHistoryItem = response.data;

        if (fullHistoryItem.outputFormat === 'pdf') {
            const pdfResponse = await api.get(`/assistants/my-history/${item.id}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
            const link = document.createElement('a');
            link.href = url;
            // Usa o nome da transcrição original e o nome do assistente para o download
            link.setAttribute('download', `${fullHistoryItem.transcription.originalFileName}-${fullHistoryItem.assistant.name}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } else {
            downloadTxtFile(`${fullHistoryItem.transcription.originalFileName}-${fullHistoryItem.assistant.name}`, fullHistoryItem.outputText);
        }
        toast.success('Download iniciado!', { id: toastId });
    } catch (err) {
        console.error("Erro ao baixar histórico do assistente:", err); // Log mais detalhado
        toast.error('Não foi possível realizar o download.', { id: toastId });
    }
  };

  if (isLoading) return <DetailPageSkeleton />;
  if (error) return <div className={styles.errorContainer}><FiAlertCircle size={48}/><h2>Erro ao Carregar</h2><p>{error}</p></div>;
  if (!transcription) return null; // Garante que a transcrição existe antes de renderizar

  return (
    <>
      <div className={styles.page}>
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.backButton} aria-label="Voltar">
            <FiArrowLeft />
          </button>
          <div className={styles.titleWrapper}>
            <h1 className={styles.title}>{transcription.originalFileName}</h1>
            <p className={styles.subtitle}>
              Data: {new Date(transcription.createdAt).toLocaleDateString('pt-BR')} | Duração: {transcription.durationSeconds ? `${parseFloat(transcription.durationSeconds).toFixed(1)}s` : 'N/A'}
            </p>
          </div>
        </header>

        {isProcessing ? (
            <AssistantProcessing />
        ) : (
            <div className={styles.mainContent}>
                <div className={styles.editorWrapper}>
                    <div className={styles.editorToolbar}>
                      <h4>Conteúdo da Transcrição</h4>
                      {isEditing ? (
                          <button className={`${styles.actionButton} ${styles.saveButton}`} onClick={handleSave}><FiSave /> Salvar Texto</button>
                      ) : (
                          <button className={styles.actionButton} onClick={() => setIsEditing(true)}><FiEdit /> Editar Texto</button>
                      )}
                    </div>
                    {isEditing ? (
                      <textarea className={styles.editorTextarea} value={editedText} onChange={(e) => setEditedText(e.target.value)} />
                    ) : (
                      <div className={styles.transcriptionText}><pre>{editedText || "Transcrição vazia ou em processamento."}</pre></div>
                    )}
                </div>
            
                <div className={styles.actionsBox}>
                    <h4>Ações Rápidas</h4>
                    <div className={styles.actionButtonsWrapper}>
                    <button className={styles.actionButton} onClick={() => downloadTxtFile(transcription.originalFileName, transcription.transcriptionText)}>
                        <FiDownload/> Baixar .txt
                    </button>
                    <div className={styles.agentDropdown} ref={dropdownRef}>
                        <button className={styles.actionButton} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <FiCpu/> Usar Assistente de IA
                        </button>
                        {isDropdownOpen && (
                        <div className={styles.dropdownContent}>
                            {availableAssistants.length > 0 ? (
                            availableAssistants.map(assistant => (
                                <a key={assistant.id} href="#" onClick={(e) => { e.preventDefault(); handleUseAssistant(assistant.id); }}>
                                {assistant.name} {assistant.isSystemAssistant && <span className={styles.systemTagSmall}>(Sistema)</span>}
                                </a>
                            ))
                            ) : (
                            <span className={styles.dropdownEmpty}>Nenhum assistente disponível</span>
                            )}
                        </div>
                        )}
                    </div>
                    </div>
                </div>

                <div className={styles.historyWrapper}>
                    <h4><FiRefreshCw /> Histórico de Ações</h4>
                    {assistantHistory.length > 0 ? (
                        <ul className={styles.historyList}>
                            {assistantHistory.map(item => (
                                <li key={item.id} className={styles.historyItem}>
                                    <div className={styles.historyInfo}>
                                        <span className={styles.historyAgentName}>{item.assistantName}</span> {/* Usa o nome mapeado */}
                                        <span className={styles.historyDate}>{new Date(item.createdAt).toLocaleString('pt-BR')}</span>
                                    </div>
                                    <span className={`${styles.statusTag} ${styles[item.status]}`}>{item.status}</span>
                                    <div className={styles.historyActions}>
                                        <button className={styles.historyButton} onClick={() => setViewingHistoryItem(item)} disabled={item.status !== 'completed'}><FiFileText/> Ver Resultado</button>
                                        <button className={styles.historyButton} onClick={() => handleDownloadHistory(item)} disabled={item.status !== 'completed'}><FiDownload/> Baixar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.historyEmpty}>Nenhuma ação de assistente foi executada para esta transcrição ainda.</p>
                    )}
                </div>
            </div>
        )}
      </div>
      
      {viewingHistoryItem && (
        <Modal isOpen={true} onClose={() => setViewingHistoryItem(null)} title={`Resultado de: ${viewingHistoryItem.assistantName}`}>
          <pre className={styles.modalTextContent}>{viewingHistoryItem.outputText}</pre>
        </Modal>
      )}
    </>
  );
}

const DetailPageSkeleton = () => (
    <div className={styles.page}>
        <header className={styles.header}>
            <div className={`${styles.skeleton} ${styles.skeletonBackButton}`}></div>
            <div className={styles.titleWrapper}>
                <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
            </div>
        </header>
        <div className={styles.mainContent}>
            <div className={`${styles.skeleton} ${styles.skeletonEditor}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonActions}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonHistory}`}></div>
        </div>
    </div>
);