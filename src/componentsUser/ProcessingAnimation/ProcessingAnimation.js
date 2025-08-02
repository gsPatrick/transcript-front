import styles from './ProcessingAnimation.module.css';
import { FiMic, FiArrowRight, FiFileText } from 'react-icons/fi';

export default function ProcessingAnimation() {
  return (
    <div className={styles.processingContainer}>
      <div className={`${styles.iconWrapper} ${styles.iconMic}`}>
        <FiMic />
      </div>
      <div className={styles.dots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className={`${styles.iconWrapper} ${styles.iconArrow}`}>
        <FiArrowRight />
      </div>
      <div className={styles.dots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className={`${styles.iconWrapper} ${styles.iconFile}`}>
        <FiFileText />
      </div>
    </div>
  );
}