// src/app/dashboard/assistentes/editar/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import styles from '../../criar/page.module.css'; // Reutilizando o CSS da página de criação
import AssistantForm from '@/componentsUser/AssistantForm/AssistantForm'; // Importa o componente de formulário
import api from '@/lib/api';
import { FiAlertCircle } from 'react-icons/fi';

// Skeleton para a página de carregamento
const EditPageSkeleton = () => (
    <div className={styles.page}>
        <div className={styles.header}>
          <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
        </div>
        <div className={`${styles.skeleton} ${styles.stepperSkeleton}`}></div>
        <div className={`${styles.skeleton} ${styles.contentSkeleton}`}></div>
    </div>
);


export default function EditAssistantPage({ params }) {
  const { id: assistantId } = params;
  const router = useRouter();
  
  const [assistantData, setAssistantData] = useState(null); // Agora armazena o objeto completo
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carrega os dados do assistente
  useEffect(() => {
    if (!assistantId) return;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Busca o assistente completo. O backend já retorna knowledgeBase e runConfiguration
        const response = await api.get(`/assistants/my-assistants/${assistantId}`);
        setAssistantData(response.data); // Define o estado com os dados completos
      } catch (err) {
        const msg = err.response?.data?.message || 'Não foi possível carregar os dados do assistente.';
        setError(msg);
        toast.error(msg);
        // Redireciona se o assistente não for encontrado ou houver erro
        router.replace('/dashboard/assistentes'); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [assistantId, router]);

  const handleSave = async (formData) => {
    const toastId = toast.loading('Atualizando assistente...');

    try {
      // O formData já está no formato correto para o novo modelo de Assistant no backend
      const response = await api.put(`/assistants/my-assistants/${assistantId}`, formData);
      setAssistantData(response.data); // Atualiza os dados locais com a resposta do backend
      toast.success('Assistente atualizado com sucesso!', { id: toastId });
      router.push('/dashboard/assistentes'); // Redireciona para a lista de assistentes
    } catch (err) {
      toast.error(err.response?.data?.message || 'Falha ao atualizar o assistente.', { id: toastId });
    }
  };
  
  if (isLoading) return <EditPageSkeleton />;
  if (error) return <div className={styles.errorContainer}><FiAlertCircle size={48}/><h2>Erro ao Carregar</h2><p>{error}</p></div>;
  if (!assistantData) return null; // Não renderiza se os dados ainda não foram carregados (embora o loading já cubra)

  return (
    <div className={styles.page}>
        <header className={styles.header}>
            <div>
              <h1 className={styles.title}>Editar Assistente</h1>
              <p className={styles.subtitle}>Ajuste a personalidade, as configurações e a base de conhecimento.</p>
            </div>
            <div>
              <button className={styles.secondaryButton} onClick={() => router.back()}>Voltar</button>
              {/* O botão "Salvar" está dentro do AssistantForm agora */}
            </div>
        </header>
        
        {/* Renderiza o AssistantForm, passando os dados atuais do assistente para pré-preencher */}
        <AssistantForm 
          assistant={assistantData} // Passa o objeto completo do assistente para o formulário
          onSave={handleSave}
          onCancel={() => router.back()}
        />
    </div>
  );
}