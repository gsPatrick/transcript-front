// src/componentsAdmin/PlanForm/PlanForm.js
'use client';

import { useState } from 'react';
import styles from './PlanForm.module.css';

export default function PlanForm({ plan, onSave, onCancel }) {
  const isEditing = !!plan;

  // Estado para controlar a visibilidade dos campos condicionais
  const [allowCreation, setAllowCreation] = useState(plan?.features?.allowUserAssistantCreation || false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    const planData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      durationInDays: parseInt(data.durationInDays, 10),
      features: {
        maxAudioTranscriptions: parseInt(data.maxAudioTranscriptions, 10),
        maxTranscriptionMinutes: parseInt(data.maxTranscriptionMinutes, 10),
        maxAssistantUses: parseInt(data.maxAssistantUses, 10), 
        allowUserAssistantCreation: data.allowUserAssistantCreation === 'on',
        maxAssistants: data.allowUserAssistantCreation === 'on' ? parseInt(data.maxAssistants, 10) : 0,
        assistantCreationResetPeriod: data.assistantCreationResetPeriod,
        useSystemTokenForAI: data.useSystemTokenForAI === 'on', 
        allowUserProvideOwnToken: data.allowUserProvideOwnToken === 'on',
        allowedSystemAssistantIds: [], // Este campo agora é gerenciado no form de assistente
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
        <p className={styles.helpText}>Use -1 para valores ilimitados.</p>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}><label htmlFor="maxAudioTranscriptions">Máx. Áudios</label><input type="number" id="maxAudioTranscriptions" name="maxAudioTranscriptions" defaultValue={plan?.features?.maxAudioTranscriptions ?? -1} required /></div>
          <div className={styles.formGroup}><label htmlFor="maxTranscriptionMinutes">Máx. Minutos</label><input type="number" id="maxTranscriptionMinutes" name="maxTranscriptionMinutes" defaultValue={plan?.features?.maxTranscriptionMinutes ?? -1} required /></div>
        </div>
      </fieldset>
      
      <fieldset className={styles.fieldset}>
        <legend>Limites de Assistentes de IA</legend>
        <p className={styles.helpText}>Controle o uso e a criação de Assistentes de IA.</p>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}><label htmlFor="maxAssistantUses">Máx. Usos (c/ token do sistema)</label><input type="number" id="maxAssistantUses" name="maxAssistantUses" defaultValue={plan?.features?.maxAssistantUses ?? 0} required /></div>
        </div>
        <div className={`${styles.formGroup} ${styles.checkboxGroup}`} style={{marginTop: '1rem'}}>
          <input type="checkbox" id="allowUserAssistantCreation" name="allowUserAssistantCreation" defaultChecked={allowCreation} onChange={(e) => setAllowCreation(e.target.checked)} />
          <label htmlFor="allowUserAssistantCreation">Permitir que usuários criem seus próprios Assistentes?</label>
        </div>
        {allowCreation && (
            <div className={styles.formGrid} style={{marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem'}}>
                <div className={styles.formGroup}><label htmlFor="maxAssistants">Máx. de Assistentes por usuário</label><input type="number" id="maxAssistants" name="maxAssistants" defaultValue={plan?.features?.maxAssistants ?? 1} required /></div>
                <div className={styles.formGroup}><label htmlFor="assistantCreationResetPeriod">Período de Reset</label><select id="assistantCreationResetPeriod" name="assistantCreationResetPeriod" defaultValue={plan?.features?.assistantCreationResetPeriod || 'never'}><option value="never">Nunca</option><option value="monthly">Mensal</option></select></div>
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