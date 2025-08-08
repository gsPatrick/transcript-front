// src/componentsAdmin/AssistantForm/AdminAssistantForm.js
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './AdminAssistantForm.module.css'; // NOVO CSS para este formulário
import TabNav from '@/componentsUser/Profile/TabNav'; // Reutiliza a navegação por abas
import PersonalityTab from '@/componentsUser/AssistantForm/PersonalityTab'; // Reutiliza PersonalityTab
import ConfigTab from '@/componentsUser/AssistantForm/ConfigTab'; // Reutiliza ConfigTab

// Importa KnowledgeTab dinamicamente SEM SSR, pois lida com File API
const KnowledgeTab = dynamic(() => import('@/componentsUser/AssistantForm/KnowledgeTab'), {
  ssr: false,
  loading: () => <p>Carregando base de conhecimento...</p>, 
});

// Abas do formulário
const TABS = ["Personalidade", "Configurações", "Base de conhecimento", "Funções", "Permissões"]; // NOVO: Aba de Permissões

// Valores iniciais para um novo assistente (totalmente alinhado com o DB e API OpenAI)
const initialFormData = {
  name: '',
  model: 'gpt-4o-mini', // Modelo padrão, exato como na API OpenAI
  instructions: 'Você é um assistente prestativo.',
  executionMode: 'FIXO', // Modo padrão
  runConfiguration: {
    temperature: 1,
    top_p: 1,
    max_completion_tokens: 2048,
    // Futuras configurações do Run Object podem vir aqui (ex: max_prompt_tokens, truncation_strategy)
  },
  knowledgeBase: {
    openaiFileIds: [], // IDs dos arquivos na OpenAI (para o DB)
    files: [],         // Objetos File JS para upload (apenas para o frontend/envio inicial)
    fileIdsToDelete: [], // IDs de arquivos da OpenAI a serem deletados (apenas para o frontend/envio inicial)
  },
  outputFormat: 'text',
  // Campos específicos de admin/sistema:
  planSpecific: false,
  allowedPlanIds: [],
  requiresUserOpenAiToken: false, // Admin pode definir se assistente do sistema exige token do usuário
  // openaiAssistantId e openaiVectorStoreId serão preenchidos pelo backend
};

export default function AdminAssistantForm({ assistant, onSave, onCancel, availablePlans = [] }) {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState(() => {
    // Ao inicializar o formulário, seja para um novo assistente ou edição:
    const initial = assistant ? { ...initialFormData, ...assistant } : initialFormData;
    
    // Assegura que `knowledgeBase` e seus sub-campos existem e têm os tipos corretos
    // para o formulário no frontend.
    initial.knowledgeBase = {
      openaiFileIds: initial.knowledgeBase?.openaiFileIds || [], // IDs já existentes na OpenAI
      files: [], // Reinicia a lista de arquivos a serem enviados para o novo formulário/edição
      fileIdsToDelete: [], // Reinicia a lista de arquivos a serem deletados
    };

    // Assegura que `runConfiguration` tenha todas as propriedades padrão,
    // caso o assistente carregado para edição não as possua (modelos antigos, etc.)
    initial.runConfiguration = {
      ...initialFormData.runConfiguration, // Garante que todos os defaults estejam presentes
      ...initial.runConfiguration,        // Sobrescreve com os valores do assistente existente
    };

    // Assegura que `allowedPlanIds` é um array para o `selectedAllowedPlanIds`
    initial.allowedPlanIds = initial.allowedPlanIds || [];

    return initial;
  });

  // Estado local para a lista de IDs de planos selecionados na aba de Permissões.
  // Sincroniza com formData.allowedPlanIds.
  const [selectedAllowedPlanIds, setSelectedAllowedPlanIds] = useState(formData.allowedPlanIds);

  // Efeito para manter formData.allowedPlanIds sincronizado com selectedAllowedPlanIds
  useEffect(() => {
    setFormData(prev => ({ ...prev, allowedPlanIds: selectedAllowedPlanIds }));
  }, [selectedAllowedPlanIds]); // Depende de selectedAllowedPlanIds

  // Lógica para o checkbox "Tornar este assistente específico para alguns planos?"
  const handlePlanSpecificChange = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({ ...prev, planSpecific: isChecked }));
    // Se desmarcar "planSpecific", limpa os planos permitidos selecionados
    if (!isChecked) {
      setSelectedAllowedPlanIds([]);
    }
  };

  // Lógica para os checkboxes de seleção de planos
  const handleAllowedPlanChange = (e) => {
    const { value, checked } = e.target;
    setSelectedAllowedPlanIds(prev =>
      checked ? [...prev, value] : prev.filter(id => id !== value)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData); // `onSave` é a prop passada pelo componente pai (AdminAssistantsPage)
  };

  // Componente interno para renderizar a aba de Permissões
  const renderPermissionsTab = () => (
    <div className={styles.tabContent}>
      <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
        <input 
          type="checkbox" 
          id="planSpecific" 
          name="planSpecific" 
          checked={formData.planSpecific} 
          onChange={handlePlanSpecificChange} 
        />
        <label htmlFor="planSpecific">Tornar este assistente específico para alguns planos?</label>
      </div>

      {/* Somente exibe a seleção de planos se 'planSpecific' estiver marcado */}
      {formData.planSpecific && (
        <div className={styles.plansSelectionGrid}>
          <h4>Selecione os planos permitidos:</h4>
          {availablePlans.length > 0 ? (
            availablePlans.map(plan => (
              <div key={plan.id} className={styles.planCheckboxItem}>
                <input
                  type="checkbox"
                  id={`plan-${plan.id}`}
                  value={plan.id}
                  checked={selectedAllowedPlanIds.includes(plan.id)}
                  onChange={handleAllowedPlanChange}
                />
                <label htmlFor={`plan-${plan.id}`}>{plan.name}</label>
              </div>
            ))
          ) : (
            <p className={styles.helpText}>Nenhum plano disponível. Crie planos primeiro.</p>
          )}
        </div>
      )}

      <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
        <input 
          type="checkbox" 
          id="requiresUserOpenAiToken" 
          name="requiresUserOpenAiToken" 
          checked={formData.requiresUserOpenAiToken} 
          onChange={(e) => setFormData(prev => ({ ...prev, requiresUserOpenAiToken: e.target.checked }))} 
        />
        <label htmlFor="requiresUserOpenAiToken">Este assistente exige que o usuário forneça seu próprio token da OpenAI?</label>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* 
        RENDERIZA TODAS AS ABAS. As inativas são escondidas com a classe 'hidden' no CSS.
        Isso preserva o estado dos componentes de cada aba quando o usuário navega entre elas.
      */}
      <div className={`${styles.tabContent} ${activeTab !== 'Personalidade' ? styles.hidden : ''}`}>
        <PersonalityTab formData={formData} setFormData={setFormData} />
      </div>
      <div className={`${styles.tabContent} ${activeTab !== 'Configurações' ? styles.hidden : ''}`}>
        <ConfigTab formData={formData} setFormData={setFormData} />
      </div>
      <div className={`${styles.tabContent} ${activeTab !== 'Base de conhecimento' ? styles.hidden : ''}`}>
        <KnowledgeTab formData={formData} setFormData={setFormData} />
      </div>
      <div className={`${styles.tabContent} ${activeTab !== 'Funções' ? styles.hidden : ''}`}>
        <div className={styles.comingSoon}>Em breve...</div>
      </div>
      <div className={`${styles.tabContent} ${activeTab !== 'Permissões' ? styles.hidden : ''}`}>
        {renderPermissionsTab()}
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>Salvar Assistente</button>
      </div>
    </form>
  );
}