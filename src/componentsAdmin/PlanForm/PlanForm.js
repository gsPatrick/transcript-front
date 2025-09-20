// src/componentsAdmin/PlanForm/PlanForm.js
'use client';

import { useState, useEffect } from 'react';
import styles from './PlanForm.module.css';

export default function PlanForm({ plan, onSave, onCancel }) {
  const isEditing = !!plan;

  // --- ESTADOS PARA CONTROLE DA UI DINÂMICA ---
  const [isTranscriptionsUnlimited, setIsTranscriptionsUnlimited] = useState(plan?.features?.maxAudioTranscriptions === -1);
  const [isMinutesUnlimited, setIsMinutesUnlimited] = useState(plan?.features?.maxTranscriptionMinutes === -1);
  const [isAssistantUsesUnlimited, setIsAssistantUsesUnlimited] = useState(plan?.features?.maxAssistantUses === -1);
  const [allowCreation, setAllowCreation] = useState(plan?.features?.allowUserAssistantCreation || false);

  // Garante que o estado seja atualizado se o 'plan' mudar (ao reabrir modal)
  useEffect(() => {
    if (plan?.features) {
      setIsTranscriptionsUnlimited(plan.features.maxAudioTranscriptions === -1);
      setIsMinutesUnlimited(plan.features.maxTranscriptionMinutes === -1);
      setIsAssistantUsesUnlimited(plan.features.maxAssistantUses === -1);
      setAllowCreation(plan.features.allowUserAssistantCreation || false);
    }
  }, [plan]);


  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // --- LÓGICA DE TRADUÇÃO DA UI PARA DADOS DO BACKEND ---
    // Converte os checkboxes "Ilimitado" para o valor numérico -1 que o backend espera.
    const planData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      durationInDays: parseInt(data.durationInDays, 10),
      features: {
        maxAudioTranscriptions: isTranscriptionsUnlimited ? -1 : parseInt(data.maxAudioTranscriptions, 10),
        maxTranscriptionMinutes: isMinutesUnlimited ? -1 : parseInt(data.maxTranscriptionMinutes, 10),
        maxAssistantUses: isAssistantUsesUnlimited ? -1 : parseInt(data.maxAssistantUses, 10), 
        allowUserAssistantCreation: data.allowUserAssistantCreation === 'on',
        maxAssistants: data.allowUserAssistantCreation === 'on' ? parseInt(data.maxAssistants, 10) : 0,
        assistantCreationResetPeriod: data.assistantCreationResetPeriod,
        useSystemTokenForAI: data.useSystemTokenForAI === 'on', 
        allowUserProvideOwnToken: data.allowUserProvideOwnToken === 'on',
        allowedSystemAssistantIds: [],
      }
    };
    onSave(planData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend>Detalhes do Plano</legend>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}><label htmlFor="name">Nome do Plano</label><input type="text" id="name" name="name" defaultValue={plan?.name || ''} required /></div>
          <div className={styles.formGroup}><label htmlFor="price">Preço (R$)</label><input type="number" id="price" name="price" defaultValue={plan?.price || ''} step="0.01" required /></div>
          <div className={styles.formGroup}><label htmlFor="durationInDays">Duração (dias)</label><input type="number" id="durationInDays" name="durationInDays" defaultValue={plan?.durationInDays || 30} required /></div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}><label htmlFor="description">Descrição</label><textarea id="description" name="description" defaultValue={plan?.description || ''} rows="3"></textarea></div>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Limites de Transcrição</legend>
        <div className={styles.formGrid}>
          {/* Campo de Máximo de Áudios */}
          <div className={styles.limitGroup}>
            <label htmlFor="maxAudioTranscriptions">Máx. Áudios</label>
            <div className={styles.inputWrapper}>
              <input type="number" id="maxAudioTranscriptions" name="maxAudioTranscriptions" defaultValue={plan?.features?.maxAudioTranscriptions !== -1 ? plan?.features?.maxAudioTranscriptions : 0} disabled={isTranscriptionsUnlimited} required />
              <div className={styles.unlimitedCheckbox}>
                <input type="checkbox" id="transcriptionsUnlimited" checked={isTranscriptionsUnlimited} onChange={(e) => setIsTranscriptionsUnlimited(e.target.checked)} />
                <label htmlFor="transcriptionsUnlimited">Ilimitado</label>
              </div>
            </div>
          </div>
          {/* Campo de Máximo de Minutos */}
          <div className={styles.limitGroup}>
            <label htmlFor="maxTranscriptionMinutes">Máx. Minutos</label>
            <div className={styles.inputWrapper}>
              <input type="number" id="maxTranscriptionMinutes" name="maxTranscriptionMinutes" defaultValue={plan?.features?.maxTranscriptionMinutes !== -1 ? plan?.features?.maxTranscriptionMinutes : 0} disabled={isMinutesUnlimited} required />
              <div className={styles.unlimitedCheckbox}>
                <input type="checkbox" id="minutesUnlimited" checked={isMinutesUnlimited} onChange={(e) => setIsMinutesUnlimited(e.target.checked)} />
                <label htmlFor="minutesUnlimited">Ilimitado</label>
              </div>
            </div>
          </div>
        </div>
      </fieldset>
      
      <fieldset className={styles.fieldset}>
        <legend>Limites de Assistentes de IA</legend>
        <div className={styles.formGrid}>
          {/* Campo de Máximo de Usos de Assistente */}
          <div className={styles.limitGroup}>
            <label htmlFor="maxAssistantUses">Máx. Usos (c/ token do sistema)</label>
            <div className={styles.inputWrapper}>
              <input type="number" id="maxAssistantUses" name="maxAssistantUses" defaultValue={plan?.features?.maxAssistantUses !== -1 ? plan?.features?.maxAssistantUses : 0} disabled={isAssistantUsesUnlimited} required />
              <div className={styles.unlimitedCheckbox}>
                <input type="checkbox" id="assistantUsesUnlimited" checked={isAssistantUsesUnlimited} onChange={(e) => setIsAssistantUsesUnlimited(e.target.checked)} />
                <label htmlFor="assistantUsesUnlimited">Ilimitado</label>
              </div>
            </div>
          </div>
        </div>
        <div className={`${styles.formGroup} ${styles.checkboxGroup}`} style={{marginTop: '1.5rem'}}>
          <input type="checkbox" id="allowUserAssistantCreation" name="allowUserAssistantCreation" checked={allowCreation} onChange={(e) => setAllowCreation(e.target.checked)} />
          <label htmlFor="allowUserAssistantCreation">Permitir que usuários criem seus próprios Assistentes?</label>
        </div>
        {allowCreation && (
            <div className={styles.conditionalSection}>
                <div className={styles.formGroup}>
                    <label htmlFor="maxAssistants">Máx. de Assistentes por usuário</label>
                    <input type="number" id="maxAssistants" name="maxAssistants" defaultValue={plan?.features?.maxAssistants ?? 1} required />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="assistantCreationResetPeriod">Período de Reset da Criação</label>
                    <select id="assistantCreationResetPeriod" name="assistantCreationResetPeriod" defaultValue={plan?.features?.assistantCreationResetPeriod || 'never'}>
                      <option value="never">Nunca</option>
                      <option value="monthly">Mensal</option>
                    </select>
                </div>
            </div>
        )}
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Permissões de Tokens de IA</legend>
        <div className={styles.permissionsGrid}>
          <div className={`${styles.formGroup} ${styles.checkboxGroup}`}><input type="checkbox" id="useSystemTokenForAI" name="useSystemTokenForAI" defaultChecked={plan?.features?.useSystemTokenForAI ?? true} /><label htmlFor="useSystemTokenForAI">Permitir uso do token da plataforma para Assistentes?</label></div>
          <div className={`${styles.formGroup} ${styles.checkboxGroup}`}><input type="checkbox" id="allowUserProvideOwnToken" name="allowUserProvideOwnToken" defaultChecked={plan?.features?.allowUserProvideOwnToken || false} /><label htmlFor="allowUserProvideOwnToken">Permitir que usuários usem seu próprio token da OpenAI?</label></div>
        </div>
      </fieldset>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>{isEditing ? 'Salvar Plano' : 'Criar Plano'}</button>
      </div>
    </form>
  );
}