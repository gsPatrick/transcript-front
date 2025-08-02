// src/componentsAdmin/PlanForm/PlanForm.js

import styles from './PlanForm.module.css';

export default function PlanForm({ plan, onSave, onCancel }) {
  const isEditing = !!plan;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Constrói o objeto final com a estrutura correta, incluindo TODAS as features
    const planData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      durationInDays: parseInt(data.durationInDays, 10),
      features: {
        // Features de Transcrição
        maxAudioTranscriptions: parseInt(data.maxAudioTranscriptions, 10),
        maxTranscriptionMinutes: parseInt(data.maxTranscriptionMinutes, 10),

        // <<< ADICIONADO: Features de Assistente >>>
        maxAssistants: parseInt(data.maxAssistants, 10),
        allowUserAssistantCreation: data.allowUserAssistantCreation === 'on',
        assistantCreationResetPeriod: data.assistantCreationResetPeriod,

        // Features de Token (agora aplicáveis aos assistentes)
        maxAgentUses: parseInt(data.maxAgentUses, 10), // Reutilizamos este campo para o limite de uso de assistentes
        useSystemTokenForSystemAgents: data.useSystemTokenForSystemAgents === 'on',
        allowUserProvideOwnAgentToken: data.allowUserProvideOwnAgentToken === 'on',
      }
    };
    onSave(planData);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formSection}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome do Plano</label>
            <input type="text" id="name" name="name" defaultValue={plan?.name || ''} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="price">Preço (R$)</label>
            <input type="number" id="price" name="price" defaultValue={plan?.price || ''} step="0.01" required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="durationInDays">Duração (dias)</label>
            <input type="number" id="durationInDays" name="durationInDays" defaultValue={plan?.durationInDays || 30} required />
          </div>
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label htmlFor="description">Descrição</label>
            <textarea id="description" name="description" defaultValue={plan?.description || ''} rows="3"></textarea>
          </div>
        </div>
      </div>

      <fieldset className={styles.fieldset}>
        <legend>Limites de Uso</legend>
        <p className={styles.helpText}>Use -1 para valores ilimitados.</p>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="maxAudioTranscriptions">Máx. Transcrições</label>
            <input type="number" id="maxAudioTranscriptions" name="maxAudioTranscriptions" defaultValue={plan?.features?.maxAudioTranscriptions ?? ''} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="maxTranscriptionMinutes">Máx. Minutos</label>
            <input type="number" id="maxTranscriptionMinutes" name="maxTranscriptionMinutes" defaultValue={plan?.features?.maxTranscriptionMinutes ?? ''} required />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="maxAgentUses">Máx. Usos de Assistente (com token do sistema)</label>
            <input type="number" id="maxAgentUses" name="maxAgentUses" defaultValue={plan?.features?.maxAgentUses ?? ''} required />
          </div>
        </div>
      </fieldset>
      
      {/* <<< ADICIONADO: Fieldset para permissões de Assistente >>> */}
      <fieldset className={styles.fieldset}>
        <legend>Permissões de Assistentes</legend>
        <div className={styles.permissionsGrid}>
          <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
            <input type="checkbox" id="allowUserAssistantCreation" name="allowUserAssistantCreation" defaultChecked={plan?.features?.allowUserAssistantCreation || false} />
            <label htmlFor="allowUserAssistantCreation">Permitir que usuários criem seus próprios assistentes?</label>
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
                <label htmlFor="maxAssistants">Máx. de Assistentes por usuário</label>
                <input type="number" id="maxAssistants" name="maxAssistants" defaultValue={plan?.features?.maxAssistants ?? 0} required />
            </div>
            <div className={styles.formGroup}>
                <label htmlFor="assistantCreationResetPeriod">Período de Reset da Criação</label>
                <select id="assistantCreationResetPeriod" name="assistantCreationResetPeriod" defaultValue={plan?.features?.assistantCreationResetPeriod || 'never'}>
                    <option value="never">Nunca (Limite vitalício)</option>
                    <option value="monthly">Mensalmente</option>
                    <option value="yearly">Anualmente</option>
                </select>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Permissões de Tokens</legend>
        <div className={styles.permissionsGrid}>
          <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
            <input type="checkbox" id="useSystemTokenForSystemAgents" name="useSystemTokenForSystemAgents" defaultChecked={plan?.features?.useSystemTokenForSystemAgents ?? false} />
            <label htmlFor="useSystemTokenForSystemAgents">Permitir uso do token do sistema para assistentes do sistema?</label>
          </div>
          <div className={`${styles.formGroup} ${styles.checkboxGroup}`}>
            <input type="checkbox" id="allowUserProvideOwnAgentToken" name="allowUserProvideOwnAgentToken" defaultChecked={plan?.features?.allowUserProvideOwnAgentToken || false} />
            <label htmlFor="allowUserProvideOwnAgentToken">Permitir que usuários usem seu próprio token (se tiverem)?</label>
          </div>
        </div>
      </fieldset>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton}>{isEditing ? 'Salvar Plano' : 'Criar Plano'}</button>
      </div>
    </form>
  );
}