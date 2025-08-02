import styles from './SoundWaveVisualizer.module.css';

// Este é um componente puramente visual para simular a onda sonora.
// Em um app real, ele poderia ser integrado com a Web Audio API.
export default function SoundWaveVisualizer({ isRecording }) {
  return (
    <div className={`${styles.visualizer} ${isRecording ? styles.recording : ''}`}>
      {/* Criamos múltiplas barras para a animação */}
      {[...Array(50)].map((_, i) => (
        <div key={i} className={styles.bar}></div>
      ))}
    </div>
  );
}