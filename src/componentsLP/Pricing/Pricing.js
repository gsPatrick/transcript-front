'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaCheckCircle } from 'react-icons/fa';
import styles from './Pricing.module.css';
import { publicApi } from '@/lib/api'; // Usamos a API pública para buscar os planos
import api from '@/lib/api'; // Usamos a API privada (autenticada) para o checkout

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inView, setInView] = useState(false);
  
  const sectionRef = useRef(null);
  const router = useRouter();

  // Efeito para buscar os dados dos planos da API
  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await publicApi.get('/public/plans');
        // Pega no máximo 3 planos, conforme solicitado
        setPlans(response.data.slice(0, 3)); 
      } catch (error) {
        console.error("Falha ao buscar os planos:", error);
        toast.error('Não foi possível carregar os planos.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlans();
  }, []);

  // Efeito para animação de fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if(sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [isLoading]); // Re-observa quando o loading termina

  // Função para lidar com a escolha do plano (lógica do PlanCard.js adaptada)
  const handleChoosePlan = async (e, planId, isCustom) => {
    e.preventDefault();

    if (isCustom) {
      router.push('/contato'); // ou a rota de contato
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (token) {
      // Usuário LOGADO: Inicia checkout
      const toastId = toast.loading('Criando seu link de pagamento...');
      try {
        const response = await api.post('/subscriptions/checkout', { planId });
        const { checkoutUrl } = response.data;
        toast.success('Redirecionando para o pagamento...', { id: toastId });
        window.location.href = checkoutUrl;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Não foi possível iniciar o checkout.';
        toast.error(errorMessage, { id: toastId });
      }
    } else {
      // Usuário NÃO LOGADO: Redireciona para registro com o ID do plano
      router.push(`/register?planId=${planId}`);
    }
  };

  // Função para traduzir as features do objeto da API para um array de strings
  const getFeaturesList = (features) => {
    if (typeof features !== 'object' || features === null) return [];
    
    const featureDescriptions = [];
    if (features.maxAudioTranscriptions) {
        featureDescriptions.push(`${features.maxAudioTranscriptions === -1 ? 'Ilimitadas' : features.maxAudioTranscriptions} transcrições/mês`);
    }
    if (features.maxTranscriptionMinutes) {
        featureDescriptions.push(`${features.maxTranscriptionMinutes === -1 ? 'Ilimitados' : features.maxTranscriptionMinutes} minutos/mês`);
    }
    if (features.maxAssistantUses) {
        featureDescriptions.push(`${features.maxAssistantUses === -1 ? 'Ilimitados' : features.maxAssistantUses} usos de IA`);
    }
    if (features.allowUserAssistantCreation) {
        featureDescriptions.push('Criação de assistentes de IA');
    }
    if (features.allowUserProvideOwnToken) {
        featureDescriptions.push('Uso de token de API próprio');
    }
    return featureDescriptions;
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className={styles.statusMessage}>Carregando planos...</div>;
    }

    if (plans.length === 0) {
      return (
        <div className={styles.statusMessage}>
          <h3>Novos Planos em Breve</h3>
          <p>Estamos preparando soluções incríveis para você. Volte em breve!</p>
        </div>
      );
    }

    // Adiciona uma classe dinâmica ao grid para controlar o alinhamento
    const gridClassName = `${styles.plansGrid} ${styles['gridCount' + plans.length]}`;

    return (
      <div className={gridClassName}>
        {plans.map((plan, index) => {
          const isCustom = plan.price.toLowerCase() === 'custom';
          // Você pode adicionar uma lógica para o 'highlighted' baseada no nome ou outra propriedade
          const isHighlighted = plan.name.toLowerCase().includes('profissional');

          return (
            <div key={plan.id} className={`${styles.planCard} ${isHighlighted ? styles.highlighted : ''}`}>
              {isHighlighted && <div className={styles.popularBadge}>MAIS POPULAR</div>}
              
              <div className={styles.planHeader}>
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
              </div>

              <div className={styles.planPrice}>
                {isCustom ? (
                  <span className={styles.priceCustom}>Customizável</span>
                ) : (
                  <>
                    <span className={styles.priceCurrency}>R$</span>
                    <span className={styles.priceAmount}>{parseFloat(plan.price).toFixed(2).split('.')[0]}</span>
                    <span className={styles.pricePeriod}>/mês</span>
                  </>
                )}
              </div>
              
              <ul className={styles.planFeatures}>
                {getFeaturesList(plan.features).map((feature, i) => (
                  <li key={i}>
                    <FaCheckCircle className={styles.featureIcon} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                href={isCustom ? '/contato' : `/register?planId=${plan.id}`}
                onClick={(e) => handleChoosePlan(e, plan.id, isCustom)}
                className={`${styles.btn} ${isHighlighted ? styles.btnPrimary : styles.btnSecondary}`}
              >
                {isCustom ? "Fale Conosco" : "Começar Agora"}
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

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

        {renderContent()}

        {/* Opcional: mostrar botão de "ver todos" apenas se houver mais planos não exibidos */}
        {/* <div className={styles.viewAllWrapper}> ... </div> */}
      </div>
    </section>
  );
}