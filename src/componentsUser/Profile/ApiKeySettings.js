// src/componentsUser/Profile/ApiKeySettings.js
'use client';

import { useState } from 'react';
import styles from './ApiKeySettings.module.css';
import { FiExternalLink, FiAlertCircle, FiCpu, FiMic, FiCamera, FiPhoneCall } from 'react-icons/fi';

// Componente para os cards de recursos, agora com lógica de ativação
// O "enabled" é uma prop, o componente só exibe o estado visual
const FeatureCard = ({ icon, title, description, enabled }) => (
  <div className={`${styles.featureCard} ${enabled ? styles.enabled : styles.disabled}`}>
    <div className={styles.featureIcon}>{icon}</div>
    <div className={styles.featureInfo}>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
    {/* O toggle switch é puramente visual aqui, a lógica de ativação/desativação real
        é controlada pelo plano ou pela presença da chave API */}
    <div className={styles.toggleSwitch}>
      <div className={styles.toggleTrack}>
        <div className={styles.toggleThumb}></div>
      </div>
    </div>
  </div>
);


export default function ApiKeySettings({ apiKey, onSave, onRemove, planFeatures }) {
  const maskedKey = apiKey ? `sk-...${apiKey.substring(apiKey.length - 4)}` : '';
  const [newApiKey, setNewApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // <<< LÓGICA CORRIGIDA para determinar se um recurso está enabled >>>
  const hasUserApiKey = !!apiKey; // True se o usuário já tem uma chave API configurada

  // Os recursos são habilitados se o plano permitir explicitamente (limite > 0 ou -1)
  // OU se o usuário fornecer sua própria chave de API (que pode "desbloquear" o recurso).
  // Nota: O backend ainda faz a validação final se o token do usuário pode ser usado para um dado recurso.
  const canUseAssistants = (planFeatures?.allowUserAssistantCreation || hasUserApiKey); // Permite criar assistentes ou usar os que exigem chave.
  // A transcrição via Whisper usa o token do sistema se o plano permitir, ou o do usuário.
  // Então, se o plano permite (via maxAudioTranscriptions) ou se o usuário tem chave própria.
  const canUseTranscription = (planFeatures?.maxAudioTranscriptions !== undefined && planFeatures.maxAudioTranscriptions !== 0) || hasUserApiKey;
  // Ações de agentes/assistentes do sistema com token do sistema (se o plano permitir).
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
    <div className={styles.formWrapper}>
      <div className={styles.infoBanner}>
        <FiAlertCircle />
        <span>Para garantir a funcionalidade adequada, é obrigatório que seu cartão de crédito esteja vinculado à sua conta do OpenAI Playground. <a href="https://platform.openai.com/account/billing/overview" target="_blank" rel="noopener noreferrer">Clique aqui para fazer login na sua conta. <FiExternalLink/></a></span>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.apiKeySection}>
        <div className={styles.formGroup}>
          <label htmlFor="apiKey">Chave da API</label>
          <div className={styles.inputGroup}>
            <input 
              type="password" 
              id="apiKey" 
              placeholder={apiKey ? maskedKey : 'Cole sua chave sk-... aqui'} 
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              disabled={isSaving}
            />
            {apiKey && <button type="button" className={styles.removeButton} onClick={handleRemove} disabled={isSaving}>Excluir</button>}
          </div>
        </div>
        <button type="submit" className={styles.saveButton} disabled={isSaving || !newApiKey}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
      
      <div className={styles.featuresGrid}>
        <FeatureCard 
          icon={<FiCpu />}
          title="IA personalizada" 
          description="Ative esse recurso para criar suas respostas personalizadas de IA."
          // Um usuário pode criar assistentes personalizados se o plano permitir OU se ele tiver sua própria chave OpenAI (mesmo que o plano base não permita a criação de forma "gratuita").
          enabled={canUseAssistants || canRunSystemAgentsAssistants} 
        />
        <FeatureCard 
          icon={<FiMic />}
          title="Whisper - Áudio para texto" 
          description="Ative esse recurso para transcrever perfeitamente as mensagens de áudio."
          enabled={canUseTranscription || canRunSystemAgentsAssistants} // Pode usar Whisper se o plano permitir ou se tiver chave.
        />
        <FeatureCard 
          icon={<FiMic />}
          title="Whisper - Áudio para texto (Chat ao Vivo)" 
          description="Ative esse recurso para transcrever perfeitamente as mensagens de áudio enviadas do Chat ao Vivo em texto."
          enabled={false} // Feature futura
        />
         <FeatureCard 
          icon={<FiCamera />}
          title="Vision - Reconhecimento de Imagem" 
          description="Modelos de ponta para analisar e entender imagens e texto."
          enabled={false} // Feature futura
        />
         <FeatureCard 
          icon={<FiPhoneCall />}
          title="Chamadas de voz com IA" 
          description="Crie facilmente seus próprios agentes de IA de voz."
          enabled={false} // Feature futura
        />
      </div>
    </div>
  );
}