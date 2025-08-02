// src/app/dashboard/chat/[assistantId]/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import api from '@/lib/api';
import { FiSend, FiUser, FiCpu } from 'react-icons/fi';

export default function ChatPage({ params }) {
  const { assistantId } = params; // Este é o ID do nosso banco de dados
  const searchParams = useSearchParams();
  const initialThreadId = searchParams.get('threadId');

  const [assistant, setAssistant] = useState(null);
  const [threadId, setThreadId] = useState(initialThreadId);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Para o carregamento inicial
  const [isResponding, setIsResponding] = useState(false); // Para o indicador de "digitando"
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      try {
        const asstResponse = await api.get(`/assistants/${assistantId}`);
        setAssistant(asstResponse.data);

        if (initialThreadId) {
          // Cenário 1: Continuando uma conversa existente (ex: vindo de uma transcrição)
          setThreadId(initialThreadId);
          setIsResponding(true); // Mostra o indicador de "digitando" desde o início

          // Busca as mensagens já existentes na thread para exibir (a primeira será o prompt da transcrição)
          const messagesResponse = await api.get(`/assistants/threads/${initialThreadId}/messages`);
          setMessages(messagesResponse.data.data.reverse()); // A API retorna as mais novas primeiro

          // Executa o run para obter a primeira resposta do assistente ao contexto
          const firstResponse = await api.post(`/assistants/threads/${initialThreadId}/runs`, { assistant_id: assistantId });
          setMessages(prev => [...prev, firstResponse.data]);

        } else {
          // Cenário 2: Iniciando um chat completamente novo
          const threadResponse = await api.post('/assistants/threads');
          setThreadId(threadResponse.data.id);
          setMessages([{ role: 'assistant', content: [{ type: 'text', text: { value: `Olá! Eu sou ${asstResponse.data.name}. Como posso te ajudar hoje?` } }] }]);
        }
      } catch (error) {
        toast.error("Erro ao iniciar o chat. Por favor, tente novamente.");
        console.error("Chat initialization error:", error);
      } finally {
        setIsLoading(false);
        setIsResponding(false);
      }
    };

    if (assistantId) {
      initializeChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assistantId, initialThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !threadId || isResponding) return;

    setIsResponding(true);
    const userMessageText = userInput;
    const userMessageForUI = { role: 'user', content: [{ type: 'text', text: { value: userMessageText } }] };
    setMessages(prev => [...prev, userMessageForUI]);
    setUserInput('');

    try {
      // 1. Adiciona a nova mensagem do usuário na thread
      await api.post(`/assistants/threads/${threadId}/messages`, {
        content: userMessageText,
      });

      // 2. Executa o assistente para obter a resposta
      const assistantResponse = await api.post(`/assistants/threads/${threadId}/runs`, {
        assistant_id: assistantId,
      });

      // 3. Adiciona a nova resposta do assistente à UI
      setMessages(prev => [...prev, assistantResponse.data]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao obter resposta do assistente.");
      setMessages(prev => prev.slice(0, -1)); // Remove a mensagem otimista do usuário em caso de erro
    } finally {
      setIsResponding(false);
    }
  };

  if (isLoading) {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Carregando assistente e preparando a conversa...</p>
        </div>
    );
  }

  return (
    <div className={styles.chatPage}>
      <header className={styles.chatHeader}>
        <h2>{assistant?.name}</h2>
        <p>{assistant?.instructions}</p>
      </header>
      <div className={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
            <div className={styles.avatar}>
              {msg.role === 'user' ? <FiUser /> : <FiCpu />}
            </div>
            <div className={styles.messageContent}>
              {msg.content[0]?.text?.value || "..."}
            </div>
          </div>
        ))}
        {isResponding && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.avatar}><FiCpu /></div>
            <div className={styles.messageContent}><span className={styles.typingIndicator}></span></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={isResponding || isLoading}
        />
        <button type="submit" disabled={isResponding || isLoading || !userInput.trim()}>
          <FiSend />
        </button>
      </form>
    </div>
  );
}