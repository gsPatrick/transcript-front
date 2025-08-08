// src/componentsUser/AssistantForm/ConfigTab.js
import styles from './AssistantForm.module.css';
import { FiInfo } from 'react-icons/fi';

export default function ConfigTab({ formData, setFormData }) {
  const handleRunConfigChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      runConfiguration: {
        ...prev.runConfiguration,
        [name]: parseFloat(value) // Certifica que é um número
      }
    }));
  };

  const handleExecutionModeChange = (mode) => {
    setFormData(prev => ({ ...prev, executionMode: mode }));
  };


  return (
    <div className={styles.tabContent}>
      {/* Sliders existentes */}
      <div className={styles.sliderGroup}>
        <label htmlFor="temperature">Temperatura <span>{formData.runConfiguration.temperature}</span></label>
        <input type="range" id="temperature" name="temperature" min="0" max="2" step="0.1" value={formData.runConfiguration.temperature} onChange={handleRunConfigChange} />
        <p className={styles.helpText}>Valores mais altos significam respostas mais criativas e aleatórias.</p>
      </div>
      <div className={styles.sliderGroup}>
        <label htmlFor="top_p">Top-P (Diversidade) <span>{formData.runConfiguration.top_p}</span></label>
        <input type="range" id="top_p" name="top_p" min="0" max="1" step="0.01" value={formData.runConfiguration.top_p} onChange={handleRunConfigChange} />
        <p className={styles.helpText}>Controla a diversidade de palavras. Um valor menor foca em palavras mais prováveis.</p>
      </div>

      {/* Novos Sliders/Campos (baseados na imagem e API de Assistentes) */}
      <div className={styles.infoBox}><FiInfo /><span>**Nota:** Tokens são pedaços de palavras. A API de Assistants gerencia os tokens de forma otimizada. Estes controles são para fine-tuning.</span></div>

      <div className={styles.sliderGroup}>
        <label htmlFor="max_completion_tokens">Máx. Tokens de Resposta (Run) <span>{formData.runConfiguration.max_completion_tokens}</span></label>
        <input type="range" id="max_completion_tokens" name="max_completion_tokens" min="1" max="4096" step="1" value={formData.runConfiguration.max_completion_tokens} onChange={handleRunConfigChange} />
        <p className={styles.helpText}>Define o comprimento máximo da resposta gerada em um único "run".</p>
      </div>

      {/* Exemplo de outros campos da imagem - precisaria ser mapeado para API de Assistentes */}
      {/* 
      <div className={styles.sliderGroup}>
        <label htmlFor="max_prompt_tokens">Máx. Tokens de Contexto (Prompt) <span>{formData.runConfiguration.max_prompt_tokens || 'N/A'}</span></label>
        <input type="range" id="max_prompt_tokens" name="max_prompt_tokens" min="1" max="8192" step="1" value={formData.runConfiguration.max_prompt_tokens || 0} onChange={handleRunConfigChange} />
        <p className={styles.helpText}>Define o comprimento máximo da parte do histórico da conversa a ser incluída.</p>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="truncation_strategy">Estratégia de Truncagem</label>
        <select id="truncation_strategy" name="truncation_strategy" value={formData.runConfiguration.truncation_strategy || 'auto'} onChange={handleRunConfigChange}>
          <option value="auto">Automático</option>
          <option value="last_messages">Últimas Mensagens</option>
          <option value="none">Nenhum</option>
        </select>
        <p className={styles.helpText}>Como o histórico da conversa é encurtado se exceder o limite de tokens.</p>
      </div>
      */}

      {/* Seção de formato de saída, movida da PersonalityTab para Configurações */}
      <div className={styles.formGroup}>
        <label htmlFor="outputFormat">Formato de Saída Padrão</label>
        <select id="outputFormat" name="outputFormat" value={formData.outputFormat} onChange={(e) => setFormData(prev => ({ ...prev, outputFormat: e.target.value }))}>
          <option value="text">Texto</option>
          <option value="pdf">PDF</option>
        </select>
        <p className={styles.helpText}>Este será o formato de saída padrão. O usuário pode alterar na execução.</p>
      </div>

    </div>
  );
}