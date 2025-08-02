// src/app/dashboard/assistentes/criar/page.js
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import AssistantForm from '@/componentsUser/AssistantForm/AssistantForm'; // Importa o componente de formulário

export default function CreateAssistantPage() {
  const router = useRouter();

  const handleSave = async (formData) => {
    const toastId = toast.loading('Criando assistente...');
    try {
      const response = await api.post('/assistants/my-assistants', formData);
      toast.success('Assistente criado com sucesso!', { id: toastId });
      router.push('/dashboard/assistentes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ocorreu um erro ao criar assistente.', { id: toastId });
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Criar Novo Assistente</h1>
          <p className={styles.subtitle}>Defina a personalidade e as configurações do seu novo assistente.</p>
        </div>
        <div>
          <button className={styles.secondaryButton} onClick={() => router.back()}>Voltar</button>
        </div>
      </header>

      {/* Renderiza o AssistantForm, que contém todas as abas e a lógica interna */}
      {/* CORREÇÃO: No AssistantForm, a definição de `initialFormData` já foi atualizada
                   para usar os nomes exatos da API, então aqui não precisamos passar um `assistant` vazio
                   com valores padrão específicos para `model` */}
      <AssistantForm
        onSave={handleSave}
        onCancel={() => router.back()}
      />
    </div>
  );
}