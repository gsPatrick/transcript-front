// src/app/dashboard/nova-transcricao/page.js

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import { FiUploadCloud, FiFileText, FiX, FiMic, FiSquare, FiLoader, FiCpu, FiPlayCircle } from 'react-icons/fi';
import api from '@/lib/api';
import AssistantCard from '@/componentsUser/AssistantCard/AssistantCard'; // Importar o AssistantCard
import AssistantProcessing from '@/componentsUser/AssistantProcessing/AssistantProcessing'; // Importar a animação do assistente

export default function NewTranscriptionPage() {
  const router = useRouter();
  
  // Estados para o fluxo da transcrição
  const [processState, setProcessState] = useState('idle'); // idle, recording, uploading, transcribing, readyForAssistant, runningAssistant
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Estados para o fluxo do assistente
  const [transcriptionResult, setTranscriptionResult] = useState(null); // { id, text, originalFileName, durationSeconds }
  const [availableAssistants, setAvailableAssistants] = useState([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState(null);
  const [selectedOutputFormat, setSelectedOutputFormat] = useState('text'); // 'text' ou 'pdf'

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
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
    setProcessState('idle'); // Reseta para idle para escolher nova opção ou arquivo
  };

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    } else {
      toast.error('Tipo de arquivo não suportado ou tamanho excedido (máximo 25MB).');
    }
  };
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.aac'] },
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024,
  });

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setProcessState('idle');
    setTranscriptionResult(null);
    setAvailableAssistants([]);
    setSelectedAssistantId(null);
    setSelectedOutputFormat('text');
  };

  // Chama o upload e transcrição assim que um arquivo é selecionado (ou gravado)
  useEffect(() => {
    if (file && processState === 'idle') { // Só inicia se o estado for 'idle' e um arquivo estiver presente
      handleUploadAndTranscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, processState]);

  const handleUploadAndTranscribe = async () => {
    if (!file) return;
    setProcessState('uploading');
    const toastId = toast.loading('Enviando arquivo...');
    const formData = new FormData();
    formData.append('audioFile', file);

    try {
      const uploadResponse = await api.post('/transcriptions/upload', formData, {
        onUploadProgress: (progressEvent) => setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total)),
      });
      toast.success('Upload concluído!', { id: toastId });
      setProcessState('transcribing');
      toast.loading('Transcrição em processamento...', { id: toastId, duration: 300000 });
      await pollTranscriptionStatus(uploadResponse.data.transcriptionId, toastId);
    } catch (error) {
      console.error('Erro no upload ou transcrição:', error);
      const msg = error.response?.data?.message || 'Falha no upload ou transcrição.';
      toast.error(msg, { id: toastId });
      removeFile(); // Limpa o estado para permitir nova tentativa
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
        removeFile();
        return;
      }
      try {
        const res = await api.get(`/transcriptions/my-transcriptions/${transcriptionId}`);
        if (res.data.status === 'completed') {
          clearInterval(poll);
          toast.success('Transcrição concluída! Agora escolha um assistente.', { id: toastId });
          
          // <<< MUDANÇA CRÍTICA AQUI: Não redireciona, mas prepara para o próximo passo >>>
          setTranscriptionResult({ 
            id: res.data.id, 
            text: res.data.transcriptionText, 
            originalFileName: res.data.originalFileName,
            durationSeconds: res.data.durationSeconds
          });
          setProcessState('readyForAssistant');
          
          // Busca os assistentes disponíveis para o próximo passo
          const assistantsRes = await api.get('/assistants/available');
          setAvailableAssistants(assistantsRes.data);
          setSelectedAssistantId(assistantsRes.data.length > 0 ? assistantsRes.data[0].id : null); // Pré-seleciona o primeiro

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
  
  // Função para executar o assistente sobre a transcrição
  const handleRunAssistant = async () => {
    if (!selectedAssistantId || !transcriptionResult) {
      toast.error('Selecione um assistente e verifique se a transcrição está pronta.');
      return;
    }

    setProcessState('runningAssistant');
    const toastId = toast.loading('Iniciando análise com assistente de IA...');

    try {
      const response = await api.post('/assistants/run', {
        assistantId: selectedAssistantId,
        transcriptionId: transcriptionResult.id,
        outputFormat: selectedOutputFormat,
      });

      const historyId = response.data.historyId;
      toast.loading('Assistente está processando o texto...', { id: historyId, duration: 300000 });

      // Inicia o polling para verificar quando o resultado do assistente estiver pronto
      await pollAssistantActionStatus(historyId);

    } catch (err) {
      console.error('Erro ao iniciar ação do assistente:', err);
      const errorMessage = err.response?.data?.message || 'Não foi possível iniciar a ação do assistente.';
      toast.error(errorMessage, { id: toastId });
      setProcessState('readyForAssistant'); // Volta para o estado de seleção
    }
  };

  const pollAssistantActionStatus = async (historyId) => {
    const pollInterval = 3000;
    const maxAttempts = 40;
    let attempts = 0;

    const poll = setInterval(async () => {
      if (attempts >= maxAttempts) {
        clearInterval(poll);
        toast.error('O processamento do assistente demorou muito. Verifique o resultado em "Conteúdo Gerado".', { id: historyId });
        setProcessState('idle'); // Reseta o estado para uma nova transcrição
        removeFile(); // Limpa os dados
        router.push('/dashboard/conteudo-gerado'); // Redireciona para o histórico
        return;
      }
      try {
        const res = await api.get(`/assistants/my-history/${historyId}`);
        if (res.data.status === 'completed') {
          clearInterval(poll);
          toast.success('Análise do assistente concluída! Redirecionando para o histórico.', { id: historyId });
          setProcessState('idle'); // Reseta o estado
          removeFile(); // Limpa os dados
          router.push('/dashboard/conteudo-gerado'); // Redireciona para o histórico de conteúdo gerado
        } else if (res.data.status === 'failed') {
          clearInterval(poll);
          toast.error(`Falha no processamento do assistente: ${res.data.errorMessage}`, { id: historyId });
          setProcessState('readyForAssistant'); // Volta para o estado de seleção
        }
      } catch (err) {
        clearInterval(poll);
        toast.error('Erro ao verificar status do processamento do assistente.', { id: historyId });
        setProcessState('readyForAssistant'); // Volta para o estado de seleção
      }
      attempts++;
    }, pollInterval);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Nova Transcrição</h1>
        <p className={styles.subtitle}>Grave um áudio ou envie um arquivo para transcrever e interagir com a IA.</p>
      </header>

      {/* Etapa 1: Escolha Inicial (Upload ou Gravação) */}
      {(processState === 'idle' && !file) && (
        <div className={styles.choiceContainer}>
          <div className={styles.choiceCard} onClick={handleStartRecording}>
            <FiMic size={48} />
            <h3>Gravar Áudio</h3>
            <p>Use seu microfone para gravar diretamente.</p>
          </div>
          <div {...getRootProps({ className: styles.choiceCard })}>
            <input {...getInputProps()} />
            <FiUploadCloud size={48} />
            <h3>Enviar Arquivo</h3>
            <p>Faça upload de um arquivo existente (MP3, WAV...)</p>
          </div>
        </div>
      )}

      {/* Etapa 2: Gravando */}
      {processState === 'recording' && (
        <div className={styles.recordingContainer}>
            <div className={styles.recordingIndicator}><span className={styles.recDot}></span>REC</div>
            <p className={styles.recordingTimer}>{formatTime(recordingTime)}</p>
            <button onClick={handleStopRecording} className={styles.stopButton}><FiSquare/> Parar Gravação</button>
        </div>
      )}

      {/* Etapa 3 e 4: Upload e Transcrição */}
      {(processState === 'uploading' || processState === 'transcribing') && file && (
        <div className={styles.statusContainer}>
          <div className={styles.filePreview}>
            <FiFileText />
            <span>{file.name}</span>
            <button onClick={removeFile} className={styles.removeButton}><FiX /></button>
          </div>
          {processState === 'uploading' && (
            <div className={styles.progressWrapper}>
              <p>Enviando...</p>
              <div className={styles.progressBar}><div style={{ width: `${uploadProgress}%` }}></div></div>
            </div>
          )}
          {processState === 'transcribing' && (
            <div className={styles.transcribingAnimation}>
              <FiLoader className={styles.spinner} />
              <p>Transcrevendo áudio, por favor aguarde...</p>
            </div>
          )}
        </div>
      )}
      
      {/* Etapa 5: Transcrição Concluída e Seleção do Assistente */}
      {processState === 'readyForAssistant' && transcriptionResult && (
        <div className={styles.finalStepContainer}>
          <h3>Transcrição Concluída!</h3>
          <p>Seu áudio foi transcrito com sucesso. Agora, selecione um Assistente de IA para analisar e transformar o texto.</p>
          
          <h4>Prévia da Transcrição:</h4>
          <textarea className={styles.transcriptionPreview} value={transcriptionResult.text} readOnly />

          <h4>Selecione um Assistente:</h4>
          {availableAssistants.length > 0 ? (
            <div className={styles.assistantSelectionGrid}>
              {availableAssistants.map(assistant => (
                <label key={assistant.id} className={`${styles.assistantCardOption} ${selectedAssistantId === assistant.id ? styles.selected : ''}`}>
                  <input
                    type="radio"
                    name="assistantSelection"
                    value={assistant.id}
                    checked={selectedAssistantId === assistant.id}
                    onChange={() => setSelectedAssistantId(assistant.id)}
                    style={{ display: 'none' }}
                  />
                  <AssistantCard assistant={assistant} />
                </label>
              ))}
            </div>
          ) : (
            <p className={styles.noAssistants}>Nenhum assistente disponível. Por favor, crie um ou verifique seu plano.</p>
          )}

          {selectedAssistantId && (
            <>
              <h4>Escolha o formato de saída:</h4>
              <div className={styles.outputFormatOptions}>
                <label>
                  <input
                    type="radio"
                    name="outputFormat"
                    value="text"
                    checked={selectedOutputFormat === 'text'}
                    onChange={() => setSelectedOutputFormat('text')}
                  /> Texto
                </label>
                <label>
                  <input
                    type="radio"
                    name="outputFormat"
                    value="pdf"
                    checked={selectedOutputFormat === 'pdf'}
                    onChange={() => setSelectedOutputFormat('pdf')}
                  /> PDF
                </label>
              </div>

              <button 
                onClick={handleRunAssistant} 
                className={styles.runAssistantButton}
                disabled={!selectedAssistantId}
              >
                <FiPlayCircle /> Rodar Assistente de IA
              </button>
            </>
          )}
           <button onClick={removeFile} className={styles.resetButton}>
              <FiX /> Cancelar e Voltar ao Início
            </button>
        </div>
      )}

      {/* Etapa 6: Assistente em Processamento */}
      {processState === 'runningAssistant' && (
        <AssistantProcessing />
      )}
    </div>
  );
}