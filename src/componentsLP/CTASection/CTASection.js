'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './CTASection.module.css';
import { FiArrowRight } from 'react-icons/fi';

export default function CTASection() {
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
      { threshold: 0.4 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    
    return () => {
      if(sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`${styles.ctaSection} ${inView ? styles.inView : ''}`}
    >
      {/* Elementos para o background animado */}
      <div className={styles.chaoticLines}></div>
      <div className={styles.orderedGrid}></div>
      <div className={styles.vignette}></div>

      <div className={styles.container}>
        <h2 className={styles.title}>
          Encontre o Plano Perfeito para Sua Evolução
        </h2>
        <p className={styles.subtitle}>
          Do profissional autônomo a grandes hospitais, temos a solução que se adapta e escala com você.
        </p>
        <Link href="/planos-completos" className={styles.ctaButton}>
          <span>Explorar Planos e Funcionalidades</span>
          <FiArrowRight className={styles.arrowIcon} />
        </Link>
      </div>
    </section>
  );
}