// src/componentsUser/AssistantForm/AssistantForm.js

'use client'; // Manter a diretiva 'use client' aqui

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

const TABS = ["Personalidade", "Configurações", "Base de conhecimento", "Funções"];

// CORREÇÃO: Atualizar o valor padrão do modelo para o nome exato da API
const initialFormData = {
  name: '',
  model: 'gpt-4o-mini', // <-- CORRIGIDO
  instructions: 'Você é um assistente prestativo.',
  executionMode: 'FIXO',
  runConfiguration: {
    temperature: 1,
    top_p: 1,
    max_completion_tokens: 2048,
  },
  knowledgeBase: {
    files: [],
  },
  outputFormat: 'text',
};

export default function AssistantForm({ assistant, onSave, onCancel }) {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState(assistant ? { ...initialFormData, ...assistant } : initialFormData);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'Personalidade' && <PersonalityTab formData={formData} setFormData={setFormData} />}
      {activeTab === 'Configurações' && <ConfigTab formData={formData} setFormData={setFormData} />}
      
      {activeTab === 'Base de conhecimento' && <KnowledgeTab formData={formData} setFormData={setFormData} />}
      
      {activeTab === 'Funções' && <div className={styles.comingSoon}>Em breve...</div>}

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar Assistente</button>
      </div>
    </form>
  );
}