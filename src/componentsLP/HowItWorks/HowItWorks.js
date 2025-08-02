'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './HowItWorks.module.css';
import { FiUploadCloud, FiCpu, FiFileText, FiUserCheck, FiZap, FiClipboard } from 'react-icons/fi';
import { RiSoundModuleFill } from 'react-icons/ri';

// Dados para os cards
const transcriptionSteps = [
  {
    id: 1,
    icon: <RiSoundModuleFill />,
    title: "1. Áudio Recebido",
    description: "Sua gravação de áudio é enviada para nossa plataforma segura."
  },
  {
    id: 2,
    icon: <FiCpu />,
    title: "2. Transcrição em Ação",
    description: "Nossa IA converte a fala em texto com precisão superior a 98%."
  },
  {
    id: 3,
    icon: <FiFileText />,
    title: "3. Texto Pronto",
    description: "O texto transcrito e revisado fica disponível para a próxima etapa."
  }
];

const agentSteps = [
  {
    id: 4,
    icon: <FiUserCheck />,
    title: "4. Seleção do Agente",
    description: "Escolha um agente de IA especializado, como 'Resumo Clínico' ou 'SOAP'."
  },
  {
    id: 5,
    icon: <FiZap />,
    title: "5. Agente Analisa",
    description: "O agente processa o texto, identifica padrões e extrai informações-chave."
  },
  {
    id: 6,
    icon: <FiClipboard />,
    title: "6. Resumo Inteligente",
    description: "Receba um documento estruturado e pronto para uso em seu sistema."
  }
];

export default function HowItWorks() {
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if(sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.howItWorksSection} ${inView ? styles.inView : ''}`}
      id="features"
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>Um Fluxo de Trabalho Contínuo</h2>
          <p className={styles.subtitle}>
            Desde o som bruto até o insight clínico, nosso processo é transparente, rápido e poderoso.
          </p>
        </div>

        <div className={styles.processGrid}>
          {/* Pacote de dados animado */}
          <div className={styles.dataPacket}></div>

          {/* Primeira Linha: Transcrição */}
          {transcriptionSteps.map(step => (
            <div key={step.id} className={styles.card}>
              <div className={styles.cardIcon}>{step.icon}</div>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardDescription}>{step.description}</p>
            </div>
          ))}

          {/* Segunda Linha: Análise por IA */}
          {agentSteps.map(step => (
            <div key={step.id} className={`${styles.card} ${styles.agentCard}`}>
              <div className={styles.cardIcon}>{step.icon}</div>
              <h3 className={styles.cardTitle}>{step.title}</h3>
              <p className={styles.cardDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}