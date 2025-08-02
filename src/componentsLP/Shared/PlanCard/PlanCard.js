// src/componentsLP/Shared/PlanCard/PlanCard.js

'use client'; // Necessário para usar hooks como o useRouter

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import styles from './PlanCard.module.css';
import { FiCheckCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function PlanCard({ plan }) {
  const router = useRouter();

  // Função para lidar com o clique no botão
  const handleChoosePlan = async (e) => {
    e.preventDefault(); // Previne a navegação padrão do Link
    
    // Verifica se o usuário está logado (procurando pelo token)
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (token) {
      // Usuário está LOGADO: Iniciar checkout diretamente
      const toastId = toast.loading('Criando seu link de pagamento...');
      try {
        const response = await api.post('/subscriptions/checkout', { planId: plan.id });
        const { checkoutUrl } = response.data;
        toast.success('Redirecionando para o pagamento...', { id: toastId });
        window.location.href = checkoutUrl;
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Não foi possível iniciar o checkout.';
        toast.error(errorMessage, { id: toastId });
      }
    } else {
      // Usuário NÃO está logado: Redirecionar para o registro com o ID do plano
      router.push(`/register?planId=${plan.id}`);
    }
  };

  const getFeatures = () => {
    if (typeof plan.features !== 'object' || plan.features === null) return [];
    
    const apiFeatures = [];
    if (plan.features.maxAudioTranscriptions) {
      apiFeatures.push(`${plan.features.maxAudioTranscriptions === -1 ? 'Ilimitadas' : plan.features.maxAudioTranscriptions} transcrições/mês`);
    }
    if (plan.features.maxTranscriptionMinutes) {
      apiFeatures.push(`${plan.features.maxTranscriptionMinutes === -1 ? 'Ilimitados' : plan.features.maxTranscriptionMinutes} minutos/mês`);
    }
    if (plan.features.maxAgentUses) {
      apiFeatures.push(`${plan.features.maxAgentUses === -1 ? 'Ilimitados' : plan.features.maxAgentUses} usos de agente`);
    }
    if (plan.features.allowUserAgentCreation) {
      apiFeatures.push('Criação de agentes personalizados');
    }
    if(plan.features.allowUserProvideOwnAgentToken){
      apiFeatures.push('Uso de token de API próprio');
    }
    return apiFeatures;
  };

  const featuresList = getFeatures();

  return (
    // Usamos um Link envolvendo o card para semântica, mas o clique é tratado pelo botão
    <Link href={`/register?planId=${plan.id}`} onClick={handleChoosePlan} className={styles.planCardLink}>
      <div className={styles.planCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.planName}>{plan.name}</h3>
          <p className={styles.planDescription}>{plan.description}</p>
        </div>
        <div className={styles.priceSection}>
          <span className={styles.priceCurrency}>R$</span>
          <span className={styles.priceAmount}>{parseFloat(plan.price).toFixed(2).split('.')[0]}</span>
          <span className={styles.priceCents}>,{parseFloat(plan.price).toFixed(2).split('.')[1]}</span>
          <span className={styles.pricePeriod}>/mês</span>
        </div>
        <ul className={styles.featuresList}>
          {featuresList.slice(0, 5).map((feature, index) => (
            <li key={index} className={styles.featureItem}>
              <FiCheckCircle className={styles.featureIcon} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <div className={styles.ctaWrapper}>
          <button className={styles.ctaButton}>
            Escolher Plano
          </button>
        </div>
      </div>
    </Link>
  );
}