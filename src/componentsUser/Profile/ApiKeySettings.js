// src/componentsUser/Profile/ApiKeySettings.js
'use client';

import { useState } from 'react';
import styles from './ApiKeySettings.module.css';
import { FiExternalLink, FiAlertCircle, FiCpu, FiMic, FiCamera, FiPhoneCall, FiKey, FiEye, FiEyeOff } from 'react-icons/fi';

const FeatureCard = ({ icon, title, description, enabled }) => (
  <div className={`${styles.featureCard} ${enabled ? styles.enabled : ''}`}>
    <div className={styles.featureIcon}>{icon}</div>
    <div className={styles.featureInfo}>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
    <div className={styles.toggleSwitch}>
      <div className={styles.toggleTrack}></div>
      <div className={styles.toggleThumb}></div>
    </div>
  </div>
);

export default function ApiKeySettings({ apiKey, onSave, onRemove, planFeatures }) {
  const [newApiKey, setNewApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  const hasUserApiKey = !!apiKey;
  const canUseAssistants = (planFeatures?.allowUserAssistantCreation || hasUserApiKey);
  const canUseTranscription = (planFeatures?.maxAudioTranscriptions !== undefined && planFeatures.maxAudioTranscriptions !== 0) || hasUserApiKey;
  const canRunSystemAgentsAssistants = planFeatures?.useSystemTokenForSystemAgents || hasUserApiKey;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(newApiKey);
    setIsSaving(false);
    setNewApiKey('');
  };

  const handleRemove = async () => {
    setIsSaving(true);
    await onRemove();
    setIsSaving(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.apiKeySection}>
        <h3 className={styles.cardTitle}><FiKey /> Sua Chave de API OpenAI</h3>
        <div className={styles.infoBanner}>
          <FiAlertCircle />
          <span>Para usar sua própria chave, vincule um cartão de crédito à sua conta OpenAI. <a href="https://platform.openai.com/account/billing/overview" target="_blank" rel="noopener noreferrer">Verificar Faturamento <FiExternalLink/></a></span>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="apiKey">Chave da API (sk-...)</label>
            <div className={styles.inputGroup}>
              <input 
                type={isKeyVisible ? 'text' : 'password'} 
                id="apiKey" 
                placeholder={apiKey ? '••••••••••••••••••••••••••••••••••' + apiKey.slice(-4) : 'Cole sua chave aqui'} 
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                disabled={isSaving}
              />
              <button type="button" className={styles.visibilityToggle} onClick={() => setIsKeyVisible(!isKeyVisible)}>
                {isKeyVisible ? <FiEyeOff/> : <FiEye/>}
              </button>
            </div>
          </div>
          <div className={styles.formActions}>
              {apiKey && <button type="button" className={styles.removeButton} onClick={handleRemove} disabled={isSaving}>Excluir Chave</button>}
              <button type="submit" className={styles.saveButton} disabled={isSaving || !newApiKey}>
                {isSaving ? 'Salvando...' : 'Salvar Chave'}
              </button>
          </div>
        </form>
      </div>
      
      <div className={styles.featuresSection}>
        <h3 className={styles.cardTitle}><FiCpu /> Recursos Ativados</h3>
        <div className={styles.featuresGrid}>
          <FeatureCard 
            icon={<FiCpu />}
            title="IA Personalizada" 
            description="Crie e execute assistentes com seus próprios prompts e configurações."
            enabled={canUseAssistants || canRunSystemAgentsAssistants} 
          />
          <FeatureCard 
            icon={<FiMic />}
            title="Transcrição (Whisper)" 
            description="Transcreva áudios com o modelo de ponta da OpenAI."
            enabled={canUseTranscription || canRunSystemAgentsAssistants}
          />
          <FeatureCard 
            icon={<FiCamera />}
            title="Vision (Em Breve)" 
            description="Analise e entenda imagens e textos visuais."
            enabled={false}
          />
          <FeatureCard 
            icon={<FiPhoneCall />}
            title="Agentes de Voz (Em Breve)" 
            description="Crie e interaja com assistentes de IA por voz."
            enabled={false}
          />
        </div>
      </div>
    </div>
  );
}