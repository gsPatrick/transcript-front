import styles from './StatCard.module.css';

export default function StatCard({ icon, title, value, limit, unit }) {
  const percentage = limit > 0 ? (value / limit) * 100 : 0;

  return (
    <div className={styles.statCard}>
      <div className={styles.header}>
        <div className={styles.icon}>{icon}</div>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.value}>
        {value} <span className={styles.limit}>/ {limit > 0 ? limit : '∞'} {unit}</span>
      </div>
      {limit > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progress} style={{ width: `${percentage}%` }}></div>
        </div>
      )}
    </div>
  );
}