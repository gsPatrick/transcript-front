import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';
import { FaPlay, FaArrowRight, FaCheckCircle, FaShieldAlt, FaBrain } from 'react-icons/fa';
import { RiLeafFill } from 'react-icons/ri';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.aurora}></div> {/* Elemento para o efeito aurora no fundo */}
      <div className={styles.container}>
        {/* Coluna da Esquerda: Conteúdo de Texto */}
        <div className={styles.contentLeft}>
          <h1 className={styles.headline}>
            <div className={styles.headlineLine}>A IA que escreve seus</div>
            <div className={styles.headlineLine}><span className={styles.highlightText}>prontuários médicos</span></div>
            <div className={styles.headlineLine}>por você</div>
          </h1>

          <p className={styles.subheadline}>
            Grave. Transcreva. Analise. Ganhe tempo para focar no que importa: seu paciente.
          </p>

          <div className={styles.benefitBox}>
            <FaCheckCircle className={styles.benefitIcon} />
            <span>Reduza até <strong>70%</strong> do tempo gasto com documentação</span>
          </div>

          <div className={styles.ctaWrapper}>
            <Link href="/demonstracao" className={`${styles.btn} ${styles.btnPrimary}`}>
              <FaPlay />
              Solicitar Demonstração
            </Link>
            <Link href="/teste-gratis" className={`${styles.btn} ${styles.btnSecondary}`}>
              Começar Teste Grátis
              <FaArrowRight />
            </Link>
          </div>

          <div className={styles.trustBadges}>
            <div className={styles.badgeItem}>
              <RiLeafFill className={styles.badgeIcon} style={{ color: '#2ecc71' }} />
              <span>Conforme LGPD</span>
            </div>
            <div className={styles.badgeItem}>
              <FaShieldAlt className={styles.badgeIcon} style={{ color: 'var(--color-accent)' }} />
              <span>Dados Seguros</span>
            </div>
            <div className={styles.badgeItem}>
              <FaBrain className={styles.badgeIcon} style={{ color: '#9b59b6' }} />
              <span>IA Brasileira</span>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Imagem */}
        <div className={styles.imageRight}>
          <div className={styles.imageWrapper}>
             <div className={styles.mockUiHeader}>
              <div className={styles.mockUiHeaderLeft}>
                <Image src="/logo.png" width={18} height={18} alt="Ícone"/>
                <span>Conduta Medx</span>
              </div>
              <div className={styles.mockUiHeaderRight}>
                <span>...</span>
              </div>
            </div>
            <Image
              src="/hero-doctor.png"
              alt="Médico utilizando o Conduta Medx em um tablet"
              width={620} // Aumentamos o tamanho
              height={620} // Aumentamos o tamanho
              className={styles.heroImage}
              priority
            />
             <div className={styles.mockUiOverlay}>
                <FaShieldAlt size={14} />
                <span>Uso da memória: 64,9 MB</span>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}