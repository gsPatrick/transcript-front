// src/app/admin/page.js

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import { FiUsers, FiDollarSign, FiPackage, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api'; // Usaremos nosso cliente de API

// Componente de Card reutilizado e melhorado
const StatCard = ({ icon, title, value, detail }) => (
  <div className={styles.statCard}>
    <div className={styles.iconWrapper}>{icon}</div>
    <div className={styles.infoWrapper}>
      <span className={styles.value}>{value}</span>
      <span className={styles.title}>{title}</span>
      {detail && <span className={styles.detail}>{detail}</span>}
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard-stats');
        setStats(response.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Não foi possível carregar as estatísticas.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FiAlertCircle size={48} />
        <h2>Ocorreu um Erro</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Dashboard Administrativo</h1>
        <p>Visão geral dos resultados e crescimento da plataforma.</p>
      </header>
      
      <div className={styles.statsGrid}>
        <StatCard 
          icon={<FiDollarSign />} 
          title="Receita Total" 
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
        />
        <StatCard 
          icon={<FiTrendingUp />} 
          title="Receita Este Mês" 
          value={`R$ ${stats.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
        />
        <StatCard 
          icon={<FiPackage />} 
          title="Assinaturas Ativas" 
          value={stats.activeSubscriptions}
        />
        <StatCard 
          icon={<FiUsers />} 
          title="Novos Usuários (Mês)" 
          value={stats.newUsersThisMonth}
        />
      </div>
      
      <div className={styles.chartContainer}>
        <h2>Crescimento da Receita (Últimos 6 meses)</h2>
        <div className={styles.chartPlaceholder}>
          <p>Gráfico de Linhas Viria Aqui</p>
        </div>
      </div>
    </div>
  );
}

// Componente Skeleton para a tela de carregamento
const DashboardSkeleton = () => (
    <div className={styles.page}>
        <header className={styles.header}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
        </header>
        <div className={styles.statsGrid}>
            {[...Array(4)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
        </div>
        <div className={styles.chartContainer}>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonChart}`}></div>
        </div>
    </div>
);