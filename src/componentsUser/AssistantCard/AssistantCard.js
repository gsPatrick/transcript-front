// src/componentsUser/AssistantCard/AssistantCard.js

import styles from './AssistantCard.module.css'; // Mantenha o nome do CSS correspondente
import { FiCpu } from 'react-icons/fi';

// <<< 1. Renomear a função para AssistantCard para consistência >>>
export default function AssistantCard({ assistant }) {

  // <<< 2. Adicionar uma verificação de segurança >>>
  // Se a prop 'assistant' não for fornecida, renderiza um placeholder ou nada para evitar o erro.
  if (!assistant) {
    return (
      <div className={styles.assistantCard}>
        <p>Dados do assistente indisponíveis.</p>
      </div>
    );
  }

  // O restante do código permanece o mesmo. Agora é seguro acessar as propriedades.
  return (
    <div className={`${styles.assistantCard} ${assistant.isSystemAssistant ? styles.system : styles.user}`}>
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          <FiCpu />
        </div>
        <div className={styles.titleWrapper}>
          <h4>{assistant.name}</h4>
          <span className={styles.outputTag}>{assistant.outputFormat?.toUpperCase() || 'TXT'}</span>
        </div>
      </div>
      {/* CORREÇÃO: Usar instructions (para assistentes) ou description (para agentes antigos) */}
      <p className={styles.description}>{assistant.instructions || assistant.description || 'Este assistente não possui uma descrição detalhada.'}</p>
      
      {/* 
        A seção de ações (botões de editar/excluir) foi removida daqui
        e é controlada pela página pai (assistentes/page.js), o que está correto.
      */}
    </div>
  );
}