// src/componentsUser/SoundWaveVisualizer/SoundWaveVisualizer.js

import styles from './SoundWaveVisualizer.module.css';

export default function SoundWaveVisualizer({ isRecording }) {
  return (
    <div className={`${styles.visualizer} ${isRecording ? styles.recording : ''}`}>
      {[...Array(60)].map((_, i) => (
        <div key={i} className={styles.bar} style={{ animationDelay: `${i * 0.05}s` }}></div>
      ))}
    </div>
  );
}