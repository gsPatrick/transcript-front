import Link from 'next/link';
import Image from 'next/image';
import styles from './AuthLayout.module.css';

export default function AuthLayout({ title, children }) {
  return (
    <div className={styles.authPage}>
      <div className={styles.auroraBackground}></div>
      <div className={styles.formContainer}>
        <div className={styles.logoWrapper}>
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Ícone TranscriMedX"
              width={100}
              height={50}
            />
          </Link>
        </div>
        <div className={styles.formBox}>
          <h2 className={styles.title}>{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}