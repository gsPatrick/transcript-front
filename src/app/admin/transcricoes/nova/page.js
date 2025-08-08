// src/app/admin/transcricoes/nova/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import { FiUploadCloud, FiFileText, FiX, FiMic, FiSquare, FiCpu, FiPlayCircle, FiDownload, FiMail } from 'react-icons/fi';
import api from '@/lib/api';
import AssistantCard from '@/componentsUser/AssistantCard/AssistantCard';
import AssistantProcessing from '../../../../componentsUser/AgentProcessing/AgentProcessing'; // CORRIGIDO: Caminho correto
import SoundWaveVisualizer from '@/componentsUser/SoundWaveVisualizer/SoundWaveVisualizer'; 
import ProcessingAnimation from '@/componentsUser/ProcessingAnimation/ProcessingAnimation'; 
import Modal from '@/componentsUser/Modal/Modal';
import emailModalStyles from '@/componentsUser/AssistantHistory/AssistantHistory.module.css';

export default function AdminNewTranscriptionPage() {
  const router = useRouter();
  
  const [processState, setProcessState] = useState('idle'); // idle, recording, uploading, transcribing, readyForAssistant, runningAssistant, assistantCompleted
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [availableAssistants, setAvailableAssistants] = useState([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState(null);
  
  const [assistantHistoryId, setAssistantHistoryId] = useState(null);
  const [assistantOutputText, setAssistantOutputText] = useState(null);

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailFormat, setEmailFormat] = useState('text'); 

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const recordedFile = new File([audioBlob], `gravacao-${new Date().toISOString()}.webm`, { type: 'audio/webm' });
        setFile(recordedFile);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setProcessState('recording');
      timerIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      toast.error("Não foi possível acessar o microfone.");
    }
  };
  
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setRecordingTime(0);
    setProcessState('idle');
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    } else {
      toast.error('Tipo de arquivo não suportado ou tamanho excedido (máx 25MB).');
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.aac'] },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024,
  });

  const removeFile = () => {
    setFile(null); setUploadProgress(0); setProcessState('idle');
    setTranscriptionResult(null); setAvailableAssistants([]);
    setSelectedAssistantId(null); 
    setAssistantHistoryId(null); setAssistantOutputText(null);
    setIsEmailModalOpen(false);
  };

  useEffect(() => {
    if (file && processState === 'idle') {
      handleUploadAndTranscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const handleUploadAndTranscribe = async () => {
    if (!file) return;
    setProcessState('uploading');
    const toastId = toast.loading('Enviando arquivo...');
    const formData = new FormData();
    formData.append('audioFile', file);

    try {
      const uploadResponse = await api.post('/transcriptions/upload', formData, {
        onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || file.size;
            setUploadProgress(Math.round((progressEvent.loaded * 100) / total));
        }
      });
      setProcessState('transcribing');
      await pollTranscriptionStatus(uploadResponse.data.transcriptionId, toastId);
    } catch (error) {
      const msg = error.response?.data?.message || 'Falha no upload ou transcrição.';
      toast.error(msg, { id: toastId });
      removeFile();
    }
  };

  const pollTranscriptionStatus = async (transcriptionId, toastId) => {
    const pollInterval = 3000;
    const maxAttempts = 40;
    let attempts = 0;
    const poll = setInterval(async () => {
      if (attempts >= maxAttempts) {
        clearInterval(poll);
        toast.error('A transcrição demorou muito. Tente novamente.', { id: toastId });
        removeFile(); return;
      }
      try {
        const res = await api.get(`/transcriptions/my-transcriptions/${transcriptionId}`);
        if (res.data.status === 'completed') {
          clearInterval(poll);
          toast.success('Transcrição concluída! Agora escolha um assistente.', { id: toastId });
          setTranscriptionResult(res.data);
          setProcessState('readyForAssistant');
          const assistantsRes = await api.get('/assistants/available');
          setAvailableAssistants(assistantsRes.data);
          if (assistantsRes.data.length > 0) {
            setSelectedAssistantId(assistantsRes.data[0].id);
          }
        } else if (res.data.status === 'failed') {
          clearInterval(poll);
          toast.error(`Falha na transcrição: ${res.data.errorMessage}`, { id: toastId });
          removeFile();
        }
      } catch (err) {
        clearInterval(poll);
        toast.error('Erro ao verificar status da transcrição.', { id: toastId });
        removeFile();
      }
      attempts++;
    }, pollInterval);
  };
  
  const handleRunAssistant = async () => {
    if (!selectedAssistantId || !transcriptionResult) return;
    setProcessState('runningAssistant');
    const toastId = toast.loading('Iniciando análise com assistente de IA...');
    try {
      const response = await api.post('/assistants/run', {
        assistantId: selectedAssistantId,
        transcriptionId: transcriptionResult.id,
      });
      await pollAssistantActionStatus(response.data.historyId, toastId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Não foi possível iniciar a ação do assistente.';
      toast.error(errorMessage, { id: toastId });
      setProcessState('readyForAssistant');
    }
  };

  const pollAssistantActionStatus = async (historyId, toastId) => {
    const pollInterval = 3000;
    const maxAttempts = 40;
    let attempts = 0;
    const poll = setInterval(async () => {
      if (attempts >= maxAttempts) {
        clearInterval(poll);
        toast.error('Processamento demorou muito. Verifique o resultado em "Conteúdo Gerado".', { id: toastId });
        removeFile();
        router.push('/dashboard/conteudo-gerado');
        return;
      }
      try {
        const res = await api.get(`/assistants/my-history/${historyId}`);
        if (res.data.status === 'completed') {
          clearInterval(poll);
          toast.success('Análise concluída!', { id: toastId });
          setAssistantHistoryId(historyId);
          setAssistantOutputText(res.data.outputText);
          setProcessState('assistantCompleted');
        } else if (res.data.status === 'failed') {
          clearInterval(poll);
          toast.error(`Falha no processamento: ${res.data.errorMessage}`, { id: toastId });
          setProcessState('readyForAssistant');
        }
      } catch (err) {
        clearInterval(poll);
        toast.error('Erro ao verificar status do processamento.', { id: toastId });
        setProcessState('readyForAssistant');
      }
      attempts++;
    }, pollInterval);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleOutputAction = async (action) => {
    if (!assistantHistoryId) {
      toast.error('ID do histórico não encontrado.');
      return;
    }

    const toastId = toast.loading(`Processando: ${action.replace('_', ' ')}...`);
    try {
      const response = await api.post(
        `/history/${assistantHistoryId}/actions`,
        { action },
        { responseType: 'blob' }
      );

      const disposition = response.headers['content-disposition'];
      const filenameFromServer = disposition?.split('filename=')[1]?.replaceAll('"', '');
      
      const assistantName = availableAssistants.find(a => a.id === selectedAssistantId)?.name.replace(/\s+/g, '_') || 'assistente';
      const fallbackFilename = `${transcriptionResult.originalFileName.replace(/\.[^/.]+$/, "")}_${assistantName}.${action.split('_')[1]}`;
      const filename = filenameFromServer || fallbackFilename;

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
      console.error("Erro na ação de saída:", err);
    }
  };

  const handleSendEmail = async () => {
    if (!assistantHistoryId || !emailRecipient) {
      toast.error("Por favor, preencha o email do destinatário.");
      return;
    }
    const action = emailFormat === 'pdf' ? 'email_pdf' : 'email_txt';
    const toastId = toast.loading(`Enviando email (${emailFormat.toUpperCase()})...`);
    try {
      await api.post(`/history/${assistantHistoryId}/actions`, {
        action,
        recipientEmail: emailRecipient,
      });
      toast.success('Email enviado com sucesso!', { id: toastId });
      setIsEmailModalOpen(false);
    } catch (err) {
      console.error("Erro ao enviar email:", err);
      toast.error(err.response?.data?.message || 'Não foi possível enviar o email.', { id: toastId });
    }
  };

  const renderContent = (isAdminPage = false) => { 
    const pageTitle = isAdminPage ? 'Transcrever Áudio (Admin)' : 'Nova Transcrição';
    
    switch (processState) {
      case 'recording':
        return (
          <div className={styles.recordingInterface}>
            <p className={styles.recordingStatus}>Gravando...</p>
            <SoundWaveVisualizer isRecording={isRecording} />
            <p className={styles.recordingTimer}>{formatTime(recordingTime)}</p>
            <button onClick={handleStopRecording} className={styles.stopButton}>
              <FiSquare />
            </button>
          </div>
        );
      
      case 'uploading':
      case 'transcribing':
        return (
          <div className={styles.statusPanel}>
             <div className={styles.fileInfo}>
                <FiFileText />
                <span>{file?.name}</span>
            </div>
            {processState === 'uploading' && (
                <>
                    <p className={styles.statusText}>Enviando arquivo...</p>
                    <div className={styles.progressBar}><div style={{ width: `${uploadProgress}%` }}></div></div>
                </>
            )}
            {processState === 'transcribing' && (
                <>
                    <p className={styles.statusText}>Transcrição em andamento. Aguarde...</p>
                    <ProcessingAnimation />
                </>
            )}
            <button onClick={removeFile} className={styles.cancelButton}>Cancelar</button>
          </div>
        );

      case 'readyForAssistant':
        return (
          <div className={styles.finalStepContainer}>
            <h2 className={styles.finalTitle}>Sua Transcrição está Pronta</h2>
            <p className={styles.finalSubtitle}>Agora, selecione um Assistente de IA para analisar e transformar o texto.</p>
            <textarea className={styles.transcriptionPreview} value={transcriptionResult.transcriptionText} readOnly />
            <h4>Selecione um Assistente:</h4>
            <div className={styles.assistantSelectionGrid}>
              {availableAssistants.length > 0 ? (
                availableAssistants.map(assistant => (
                  <label key={assistant.id} className={`${styles.assistantCardOption} ${selectedAssistantId === assistant.id ? styles.selected : ''}`}>
                    <input type="radio" name="assistantSelection" value={assistant.id} checked={selectedAssistantId === assistant.id} onChange={() => { setSelectedAssistantId(assistant.id); }} style={{ display: 'none' }}/>
                    <AssistantCard assistant={assistant} />
                  </label>
                ))
              ) : (
                <p className={styles.noAssistants}>Nenhum assistente disponível. Por favor, crie um ou verifique seu plano.</p>
              )}
            </div>
            {selectedAssistantId && (
              <button onClick={handleRunAssistant} className={styles.runAssistantButton}><FiPlayCircle /> Rodar Assistente</button>
            )}
            <button onClick={removeFile} className={styles.cancelButton}>Voltar ao Início</button>
          </div>
        );

      case 'runningAssistant':
        return <AssistantProcessing />;

      case 'assistantCompleted':
        return (
          <div className={styles.finalStepContainer}>
            <h2 className={styles.finalTitle}>Análise do Assistente Concluída!</h2>
            <p className={styles.finalSubtitle}>O Assistente gerou o seguinte conteúdo:</p>
            <textarea className={styles.transcriptionPreview} value={assistantOutputText} readOnly />
            
            <h4>Opções de Saída:</h4>
            <div className={styles.outputActionsGrid}>
                <button onClick={() => handleOutputAction('download_txt')} className={styles.outputActionButton}>
                    <FiDownload /> Baixar TXT
                </button>
                <button onClick={() => handleOutputAction('download_pdf')} className={styles.outputActionButton}>
                    <FiDownload /> Baixar PDF
                </button>
                <button onClick={() => setIsEmailModalOpen(true)} className={styles.outputActionButton}>
                    <FiMail /> Enviar por Email
                </button>
                <button onClick={() => router.push('/admin/conteudo-gerado')} className={styles.outputActionButton}>
                    <FiFileText /> Ver no Histórico
                </button>
            </div>
            <button onClick={removeFile} className={styles.cancelButton}>Fazer Nova Transcrição</button>
          </div>
        );

      case 'idle':
      default:
        return (
          <>
            <header className={styles.header}>
              <h1 className={styles.title}>{pageTitle}</h1>
              <p className={styles.subtitle}>Inicie uma gravação ou envie um arquivo de áudio para começar.</p>
            </header>
            <div className={styles.choiceContainer}>
              <div className={styles.choiceCard} onClick={handleStartRecording}>
                <FiMic />
                <h3>Gravar Áudio</h3>
                <p>Use seu microfone para capturar áudio em tempo real.</p>
              </div>
              <div {...getRootProps({ className: `${styles.choiceCard} ${isDragActive ? styles.dragActive : ''}` })}>
                <input {...getInputProps()} />
                <FiUploadCloud />
                <h3>Enviar Arquivo</h3>
                <p>Faça upload de um arquivo de áudio existente.</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
        <div className={styles.page}>{renderContent(true)}</div>
        {isEmailModalOpen && (
            <Modal 
            isOpen={isEmailModalOpen} 
            onClose={() => setIsEmailModalOpen(false)} 
            title="Enviar Conteúdo por Email"
            >
            <div className={emailModalStyles.emailModalContent}>
                <p><strong>Transcrição:</strong> {transcriptionResult?.originalFileName}</p>
                <p><strong>Assistente:</strong> {availableAssistants.find(a => a.id === selectedAssistantId)?.name || 'N/A'}</p>
                
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
                    <input 
                        type="radio" 
                        name="emailFormat" 
                        value="text" 
                        checked={emailFormat === 'text'} 
                        onChange={() => setEmailFormat('text')} 
                    /> TXT
                    </label>
                    <label>
                    <input 
                        type="radio" 
                        name="emailFormat" 
                        value="pdf" 
                        checked={emailFormat === 'pdf'} 
                        onChange={() => setEmailFormat('pdf')} 
                    /> PDF
                    </label>
                </div>
                </div>

                <div className={emailModalStyles.modalActions}>
                <button 
                    type="button" 
                    className={emailModalStyles.cancelButton} 
                    onClick={() => setIsEmailModalOpen(false)}
                >
                    Cancelar
                </button>
                <button 
                    type="button" 
                    className={emailModalStyles.saveButton} 
                    onClick={handleSendEmail}
                >
                    Enviar Email
                </button>
                </div>
            </div>
            </Modal>
        )}
    </>
  );
}