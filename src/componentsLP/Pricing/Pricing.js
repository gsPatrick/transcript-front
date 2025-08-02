'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Pricing.module.css';
import { FaCheckCircle } from 'react-icons/fa';

// Dados mockados para os planos. O 'highlighted: true' marca o plano em destaque.
const plansData = [
  {
    name: "Essencial",
    price: "49",
    description: "Perfeito para profissionais individuais e pequenas clínicas.",
    features: [
      "10 horas de transcrição/mês",
      "Transcrição por IA",
      "Editor de texto online",
      "Suporte por e-mail"
    ],
    highlighted: false,
  },
  {
    name: "Profissional",
    price: "99",
    description: "O mais popular. Ideal para clínicas com fluxo moderado.",
    features: [
      "30 horas de transcrição/mês",
      "Tudo do plano Essencial",
      "Agentes de IA (Resumo, SOAP)",
      "Exportação em PDF e DOCX",
      "Suporte prioritário"
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Soluções sob medida para hospitais e grandes redes.",
    features: [
      "Horas de transcrição ilimitadas",
      "Tudo do plano Profissional",
      "Agentes de IA personalizados",
      "Integração com prontuários (API)",
      "Gerente de conta dedicado"
    ],
    highlighted: false,
  }
];

export default function Pricing() {
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
      className={`${styles.pricingSection} ${inView ? styles.inView : ''}`} 
      id="pricing"
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>Planos Flexíveis para Cada Necessidade</h2>
          <p className={styles.subtitle}>
            Escolha o plano que melhor se adapta ao seu volume de trabalho. Cancele quando quiser.
          </p>
        </div>

        <div className={styles.plansGrid}>
          {plansData.map((plan, index) => (
            <div key={index} className={`${styles.planCard} ${plan.highlighted ? styles.highlighted : ''}`}>
              {plan.highlighted && <div className={styles.popularBadge}>MAIS POPULAR</div>}
              
              <div className={styles.planHeader}>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>

              <div className={styles.planPrice}>
                {plan.price === "Custom" ? (
                  <span className={styles.priceCustom}>Customizável</span>
                ) : (
                  <>
                    <span className={styles.priceCurrency}>R$</span>
                    <span className={styles.priceAmount}>{plan.price}</span>
                    <span className={styles.pricePeriod}>/mês</span>
                  </>
                )}
              </div>
              
              <ul className={styles.planFeatures}>
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <FaCheckCircle className={styles.featureIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register" className={`${styles.btn} ${plan.highlighted ? styles.btnPrimary : styles.btnSecondary}`}>
                {plan.price === "Custom" ? "Fale Conosco" : "Começar Agora"}
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.viewAllWrapper}>
          <Link href="/planos-completos" className={styles.viewAllButton}>
            Ver todos os planos
          </Link>
        </div>
      </div>
    </section>
  );
}