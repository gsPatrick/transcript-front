import styles from './AgentProcessing.module.css';
import { FaBrain } from 'react-icons/fa';

export default function AgentProcessing() {
  return (
    <div className={styles.container}>
      <div className={styles.brainWrapper}>
        <FaBrain className={styles.brainIcon} />
        {/* Elementos para as ondas de energia */}
        <div className={`${styles.wave} ${styles.wave1}`}></div>
        <div className={`${styles.wave} ${styles.wave2}`}></div>
        <div className={`${styles.wave} ${styles.wave3}`}></div>
      </div>
      <p className={styles.statusText}>Agente de IA analisando o texto...</p>
    </div>
  );
}