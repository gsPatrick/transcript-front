'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './ContactSection.module.css';
import { FaWhatsapp, FaInstagram, FaEnvelope } from 'react-icons/fa';

// Dados para os cards de contato
const contactMethods = [
  {
    icon: <FaEnvelope />,
    title: "E-mail",
    info: "contato@transcrimedx.com",
    actionText: "Enviar um e-mail",
    href: "mailto:contato@transcrimedx.com"
  },
  {
    icon: <FaWhatsapp />,
    title: "WhatsApp",
    info: "(11) 99999-8888",
    actionText: "Iniciar conversa",
    href: "https://wa.me/5511999998888" // Use um link real do WhatsApp
  },
  {
    icon: <FaInstagram />,
    title: "Instagram",
    info: "@transcrimedx",
    actionText: "Seguir novidades",
    href: "https://instagram.com/transcrimedx" // Use o link real do Instagram
  }
];

export default function ContactSection() {
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
      className={`${styles.contactSection} ${inView ? styles.inView : ''}`}
    >
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>Tem Alguma Dúvida?</h2>
          <p className={styles.subtitle}>
            Nossa equipe está pronta para ajudar. Entre em contato através do seu canal preferido.
          </p>
        </div>

        <div className={styles.cardsGrid}>
          {contactMethods.map((method, index) => (
            <Link key={index} href={method.href} target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
              <div className={styles.cardIcon}>{method.icon}</div>
              <h3 className={styles.cardTitle}>{method.title}</h3>
              <p className={styles.cardInfo}>{method.info}</p>
              <div className={styles.cardAction}>
                <span>{method.actionText}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}