// src/componentsUser/StatCard/StatCard.js

import styles from './StatCard.module.css';

export default function StatCard({ icon, title, value, limit, unit }) {
  // Garante que o valor e o limite sejam números para o cálculo
  const numericValue = Number(value) || 0;
  const numericLimit = Number(limit) || 0;
  
  const percentage = numericLimit > 0 ? (numericValue / numericLimit) * 100 : 0;

  return (
    <div className={styles.statCard}>
      <div className={styles.header}>
        <div className={styles.icon}>{icon}</div>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.value}>
        {numericValue.toLocaleString('pt-BR')} 
        <span className={styles.limit}>
          / {numericLimit > 0 ? numericLimit.toLocaleString('pt-BR') : '∞'} {unit}
        </span>
      </div>
      {numericLimit > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${percentage}%` }}></div>
        </div>
      )}
    </div>
  );
}