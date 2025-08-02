import styles from './TabNav.module.css';

export default function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className={styles.tabNav}>
      {tabs.map(tab => (
        <button
          key={tab}
          className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}