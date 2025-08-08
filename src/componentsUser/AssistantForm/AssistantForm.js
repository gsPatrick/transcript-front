// src/componentsUser/AssistantForm/AssistantForm.js
'use client'; 

import { useState } from 'react';
import dynamic from 'next/dynamic'; 
import styles from './AssistantForm.module.css';
import TabNav from '@/componentsUser/Profile/TabNav';
import PersonalityTab from './PersonalityTab';
import ConfigTab from './ConfigTab';

const KnowledgeTab = dynamic(() => import('./KnowledgeTab'), {
  ssr: false,
  loading: () => <p>Carregando base de conhecimento...</p>, 
});

const TABS = ["Personalidade", "Configurações", "Base de conhecimento"];

// Estrutura de dados inicial para um assistente, alinhada com o backend
const initialFormData = {
  name: '',
  model: 'gpt-4o-mini', 
  instructions: 'Você é um assistente prestativo.',
  executionMode: 'DINAMICO', // API de Assistentes é dinâmica por padrão
  runConfiguration: {
    temperature: 1,
    top_p: 1,
    max_completion_tokens: 2048,
  },
  knowledgeBase: {
    openaiFileIds: [], // IDs de arquivos existentes na OpenAI
    files: [],         // Novos arquivos para upload (objetos File do JS)
    fileIdsToDelete: [],// IDs de arquivos existentes para deletar
  },
  outputFormat: 'text',
};

export default function AssistantForm({ assistant, onSave, onCancel }) {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  // Inicializa o estado do formulário, fundindo os dados iniciais com os do assistente (se estiver editando)
  const [formData, setFormData] = useState(() => {
    if (!assistant) return initialFormData;

    // Garante que a estrutura aninhada exista e tenha todos os campos padrão
    return {
      ...initialFormData,
      ...assistant,
      runConfiguration: {
        ...initialFormData.runConfiguration,
        ...(assistant.runConfiguration || {}),
      },
      knowledgeBase: {
        openaiFileIds: assistant.knowledgeBase?.openaiFileIds || [],
        files: [], // Sempre começa vazio
        fileIdsToDelete: [], // Sempre começa vazio
      },
    };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Oculta abas inativas com CSS para uma experiência mais fluida */}
      <div className={`${styles.tabContent} ${activeTab !== 'Personalidade' ? styles.hidden : ''}`}>
        <PersonalityTab formData={formData} setFormData={setFormData} />
      </div>
      <div className={`${styles.tabContent} ${activeTab !== 'Configurações' ? styles.hidden : ''}`}>
        <ConfigTab formData={formData} setFormData={setFormData} />
      </div>
      <div className={`${styles.tabContent} ${activeTab !== 'Base de conhecimento' ? styles.hidden : ''}`}>
        <KnowledgeTab formData={formData} setFormData={setFormData} />
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar Assistente</button>
      </div>
    </form>
  );
}