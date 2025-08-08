'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './TrustSection.module.css';
// --- CORREÇÃO AQUI ---
// Trocamos os ícones do pacote 'ri' por alternativas mais estáveis e comuns de 'fa' e 'fi'.
import { FaShieldAlt, FaServer, FaGavel } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';

// Dados para os pilares de confiança (com os ícones corrigidos)
const trustPillars = [
  {
    icon: <FaShieldAlt />,
    title: "Segurança de Ponta a Ponta",
    description: "Utilizamos criptografia AES-256 para seus dados, tanto em trânsito quanto em repouso. O mesmo padrão usado por bancos e governos."
  },
  {
    icon: <FaGavel />, // Ícone corrigido
    title: "Conformidade com a LGPD",
    description: "Nossa plataforma é construída sobre os princípios da Lei Geral de Proteção de Dados, garantindo a privacidade e os direitos do paciente."
  },
  {
    icon: <FaServer />,
    title: "Disponibilidade Garantida",
    description: "Com uma infraestrutura robusta e redundante, garantimos 99.9% de uptime, para que você acesse seus dados sempre que precisar."
  },
  {
    icon: <FiUsers />, // Ícone corrigido
    title: "Suporte Humano e Ágil",
    description: "Nossa equipe de especialistas está pronta para ajudar a resolver qualquer questão, garantindo que seu fluxo de trabalho nunca seja interrompido."
  }
];

export default function TrustSection() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    
    return () => {
      if(sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.trustSection} ${inView ? styles.inView : ''}`}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>Sua Confiança é Nossa Prioridade</h2>
          <p className={styles.subtitle}>
            Construímos o Conduta Medx sobre pilares de segurança, conformidade e confiabilidade.
          </p>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.pillarsLeft}>
            {trustPillars.slice(0, 2).map((pillar, index) => (
              <div key={index} className={styles.pillarCard}>
                <div className={styles.pillarIcon}>{pillar.icon}</div>
                <div className={styles.pillarText}>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.centralVisual}>
            <div className={styles.core}></div>
          </div>

          <div className={styles.pillarsRight}>
            {trustPillars.slice(2, 4).map((pillar, index) => (
              <div key={index} className={styles.pillarCard}>
                <div className={styles.pillarIcon}>{pillar.icon}</div>
                <div className={styles.pillarText}>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}