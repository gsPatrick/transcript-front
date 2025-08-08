// src/componentsUser/AssistantForm/PersonalityTab.js
import styles from './AssistantForm.module.css';

// CORREÇÃO: Usar os nomes de modelo exatos da API da OpenAI
const gptModels = [
  { label: "GPT-4o Mini", value: "gpt-4o-mini" },
  { label: "GPT-4o", value: "gpt-4o" }, // Adicionado GPT-4o
  { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
  { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" }
];

export default function PersonalityTab({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStrategyChange = (strategy) => {
    setFormData(prev => ({ ...prev, executionMode: strategy }));
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.grid}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome do Assistente de IA</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="model">Selecione o modelo GPT</label>
          {/* CORREÇÃO: Renderiza as opções com os valores corretos para a API */}
          <select id="model" name="model" value={formData.model} onChange={handleChange} required>
            {gptModels.map(model => <option key={model.value} value={model.value}>{model.label}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="instructions">PROMPT</label>
        {/* CORREÇÃO: Ajustar maxLength para o limite do Assistente (128k caracteres) */}
        <textarea id="instructions" name="instructions" value={formData.instructions} onChange={handleChange} rows="8" maxLength="128000" required />
        <p className={styles.helpText}>Máximo 128,000 caracteres permitidos para o prompt.</p>
      </div>
      <div className={styles.formGroup}>
        <label>Estratégia do modelo</label>
        <div className={styles.strategyGrid}>
          <div className={`${styles.strategyCard} ${formData.executionMode === 'FIXO' ? styles.active : ''}`} onClick={() => handleStrategyChange('FIXO')}>
            <h4>FIXO</h4>
            <p>Simples e mais econômico, as instruções são definidas uma vez e a conversa é isolada por execução.</p>
          </div>
          <div className={`${styles.strategyCard} ${formData.executionMode === 'DINAMICO' ? styles.active : ''}`} onClick={() => handleStrategyChange('DINAMICO')}>
            <h4>DINÂMICO</h4>
            <p>Mantém o histórico da conversa. O Assistente "aprende" e se adapta a cada interação.</p>
          </div>
        </div>
      </div>
    </div>
  );
}