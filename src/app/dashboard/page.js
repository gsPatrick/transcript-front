'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import StatCard from '@/componentsUser/StatCard/StatCard';
import SubscriptionCTA from '@/componentsUser/SubscriptionCTA/SubscriptionCTA';
import styles from './page.module.css';
import { FiMic, FiClock, FiCpu, FiUsers, FiFilePlus, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

const formatDate = (dateString) => {
  if (!dateString) return 'Data indisponível';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [usageData, setUsageData] = useState(null);
  const [recentTranscriptions, setRecentTranscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, usageRes, transcriptionsRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/users/me/plan-usage'),
          api.get('/transcriptions/my-transcriptions?limit=4'),
        ]);

        setUserProfile(profileRes.data);
        setUsageData(usageRes.data);
        setRecentTranscriptions(transcriptionsRes.data.transcriptions);
        console.log('usageData:', usageRes.data); // opcional: debug
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Não foi possível carregar os dados do dashboard.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FiAlertCircle size={48} />
        <h2>Ocorreu um Erro</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Desestruturação segura
  const { plan = {}, usage = {}, expiresAt, status } = usageData || {};

  const getSubtitle = () => {
    if (status === 'active') {
      return `Seu plano ${plan.name} está ativo até ${formatDate(expiresAt)}.`;
    }
    if (status === 'expired') {
      return `Seu plano ${plan.name} expirou. Renove para continuar.`;
    }
    return 'Bem-vindo! Escolha um plano para começar a transcrever.';
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Bem-vindo(a), {userProfile?.name?.split(' ')[0] || 'Usuário'}!</h1>
          <p className={styles.subtitle}>{getSubtitle()}</p>
        </div>
        <Link href="/dashboard/nova-transcricao" className={styles.ctaButton}>
          <FiFilePlus />
          Nova Transcrição
        </Link>
      </header>

      {(status === 'inactive' || status === 'expired') && (
        <SubscriptionCTA status={status} expiredPlan={plan} />
      )}

      <div className={styles.statsGrid}>
        <StatCard
          icon={<FiMic />}
          title="Transcrições Usadas"
          value={usage?.transcriptions?.used ?? 0}
          limit={usage?.transcriptions?.limit ?? 0}
          unit="áudios"
        />
        <StatCard
          icon={<FiClock />}
          title="Minutos Usados"
          value={
            usage?.minutes?.used ? parseFloat(usage.minutes.used).toFixed(1) : '0.0'
          }
          limit={usage?.minutes?.limit ?? 0}
          unit="min"
        />
        {/* MODIFICADO: Mapeado para os novos contadores de Assistentes */}
        <StatCard
          icon={<FiCpu />}
          title="Ações de Assistentes"
          value={usage?.assistantUses?.used ?? 0}
          limit={usage?.assistantUses?.limit ?? 0}
          unit="usos"
        />
        {/* MODIFICADO: Mapeado para os novos contadores de Assistentes Criados */}
        <StatCard
          icon={<FiUsers />}
          title="Assistentes Criados"
          value={usage?.userCreatedAssistants?.used ?? 0}
          limit={usage?.userCreatedAssistants?.limit ?? 0}
          unit="assistentes"
        />
      </div>

      <div className={styles.recentActivity}>
        <h2 className={styles.sectionTitle}>Atividade Recente</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableRow}>
                <th className={styles.tableHeaderCell}>Nome do Arquivo</th>
                <th className={styles.tableHeaderCell}>Data</th>
                <th className={styles.tableHeaderCell}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTranscriptions.length > 0 ? (
                recentTranscriptions.map(item => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td className={styles.tableBodyCell}>{item.originalFileName}</td>
                    <td className={styles.tableBodyCell}>{formatDate(item.createdAt)}</td>
                    <td className={styles.tableBodyCell}>
                      <span className={`${styles.status} ${styles[item.status.toLowerCase()]}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className={styles.tableRow}>
                  <td colSpan="3" className={styles.emptyCell}>Nenhuma atividade recente encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const DashboardSkeleton = () => (
  <div className={styles.dashboard}>
    <header className={styles.header}>
      <div>
        <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
      </div>
      <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
    </header>
    <div className={styles.statsGrid}>
      <div className={`${styles.skeleton} ${styles.skeletonCard}`}></div>
      <div className={`${styles.skeleton} ${styles.skeletonCard}`}></div>
      <div className={`${styles.skeleton} ${styles.skeletonCard}`}></div>
      <div className={`${styles.skeleton} ${styles.skeletonCard}`}></div>
    </div>
    <div className={styles.recentActivity}>
      <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
      <div className={`${styles.skeleton} ${styles.skeletonTable}`}></div>
    </div>
  </div>
);