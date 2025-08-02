// src/componentsUser/AssistantForm/ConfigTab.js
import styles from './AssistantForm.module.css';

export default function ConfigTab({ formData, setFormData }) {
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      runConfiguration: {
        ...prev.runConfiguration,
        [name]: parseFloat(value)
      }
    }));
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.sliderGroup}>
        <label htmlFor="temperature">Temperatura <span>{formData.runConfiguration.temperature}</span></label>
        <input type="range" id="temperature" name="temperature" min="0" max="2" step="0.1" value={formData.runConfiguration.temperature} onChange={handleConfigChange} />
        <p className={styles.helpText}>Valores mais altos significam respostas mais criativas e aleatórias.</p>
      </div>
      <div className={styles.sliderGroup}>
        <label htmlFor="top_p">Top-P (Diversidade) <span>{formData.runConfiguration.top_p}</span></label>
        <input type="range" id="top_p" name="top_p" min="0" max="1" step="0.01" value={formData.runConfiguration.top_p} onChange={handleConfigChange} />
        <p className={styles.helpText}>Controla a diversidade de palavras. Um valor menor foca em palavras mais prováveis.</p>
      </div>
      <div className={styles.sliderGroup}>
        <label htmlFor="max_completion_tokens">Máximo de Tokens de Resposta <span>{formData.runConfiguration.max_completion_tokens}</span></label>
        <input type="range" id="max_completion_tokens" name="max_completion_tokens" min="1" max="4096" step="1" value={formData.runConfiguration.max_completion_tokens} onChange={handleConfigChange} />
        <p className={styles.helpText}>Define o comprimento máximo da resposta gerada.</p>
      </div>
    </div>
  );
}