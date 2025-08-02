// src/componentsUser/SubscriptionCTA/SubscriptionCTA.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import styles from './SubscriptionCTA.module.css';
import { FiArrowRight, FiRepeat, FiZap } from 'react-icons/fi';
import api, { publicApi } from '@/lib/api'; // <<< 1. IMPORTAR a publicApi

// Um card de plano simplificado para o CTA
const PlanOptionCard = ({ plan, onChoose, isLoading }) => ( // Adicionado isLoading
  <div className={styles.planOption}>
    <h4>{plan.name}</h4>
    <p className={styles.price}>
      R$ <span>{parseFloat(plan.price).toFixed(2).replace('.', ',')}</span> /mês
    </p>
    <p className={styles.description}>{plan.description}</p>
    <button onClick={() => onChoose(plan.id)} className={styles.chooseButton} disabled={isLoading}>
      {isLoading ? 'Aguarde...' : 'Assinar Agora'} <FiArrowRight />
    </button>
  </div>
);

export default function SubscriptionCTA({ status, expiredPlan }) {
  const [featuredPlans, setFeaturedPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlansLoading, setIsPlansLoading] = useState(true); // Estado separado para o carregamento dos planos

  useEffect(() => {
    // Busca 2 ou 3 planos para exibir como sugestão
    const fetchPlans = async () => {
      setIsPlansLoading(true);
      try {
        // <<< 2. USAR a publicApi e o endpoint PÚBLICO >>>
        const response = await publicApi.get('/public/plans?limit=3'); // Assumindo que o backend suporta `limit`
        setFeaturedPlans(response.data);
      } catch (err) {
        console.error("Não foi possível carregar os planos em destaque.", err);
        // Não mostra toast aqui, pois pode poluir a UI para visitantes. Apenas loga.
      } finally {
        setIsPlansLoading(false);
      }
    };
    if (status === 'inactive') {
      fetchPlans();
    } else {
      setIsPlansLoading(false); // Se não for inativo, não precisa carregar planos
    }
  }, [status]);

  const handleCheckout = async (planId) => {
    setIsLoading(true);
    const toastId = toast.loading('Criando seu link de pagamento...');
    try {
      // Para o checkout, usamos a API PRIVADA (api), pois o usuário precisa estar logado
      const response = await api.post('/subscriptions/checkout', { planId });
      const { checkoutUrl } = response.data;
      
      toast.success('Redirecionando para o pagamento...', { id: toastId });
      window.location.href = checkoutUrl;

    } catch (err){
      const errorMessage = err.response?.data?.message || 'Não foi possível iniciar o checkout.';
      toast.error(errorMessage, { id: toastId });
      setIsLoading(false);
    }
  };

  const title = status === 'expired' ? 'Seu Plano Expirou!' : 'Ative sua Conta';
  const subtitle = status === 'expired' 
    ? 'Renove sua assinatura para continuar aproveitando todos os recursos.'
    : 'Escolha um plano para desbloquear o poder da transcrição e análise por IA.';

  return (
    <div className={styles.ctaContainer}>
      <div className={styles.ctaHeader}>
        <FiZap className={styles.ctaIcon} />
        <div>
          <h2 className={styles.ctaTitle}>{title}</h2>
          <p className={styles.ctaSubtitle}>{subtitle}</p>
        </div>
      </div>
      
      <div className={styles.plansGrid}>
        {status === 'expired' && expiredPlan && (
          <div className={`${styles.planOption} ${styles.renewOption}`}>
            <h4>{expiredPlan.name}</h4>
            <p className={styles.price}>
              R$ <span>{parseFloat(expiredPlan.price).toFixed(2).replace('.', ',')}</span> /mês
            </p>
            <p className={styles.description}>Seu plano anterior. Renove com um clique.</p>
            <button onClick={() => handleCheckout(expiredPlan.id)} className={styles.chooseButton} disabled={isLoading}>
              {isLoading ? 'Aguarde...' : 'Renovar Assinatura'} <FiRepeat />
            </button>
          </div>
        )}

        {status === 'inactive' && isPlansLoading && (
            // Skeleton loader para os cards de plano
            <>
                <div className={styles.planSkeleton}></div>
                <div className={styles.planSkeleton}></div>
            </>
        )}

        {status === 'inactive' && !isPlansLoading && featuredPlans.map(plan => (
          <PlanOptionCard key={plan.id} plan={plan} onChoose={handleCheckout} isLoading={isLoading} />
        ))}
      </div>

      <div className={styles.footerLink}>
        <Link href="/planos">
          Ver todos os planos <FiArrowRight />
        </Link>
      </div>
    </div>
  );
}