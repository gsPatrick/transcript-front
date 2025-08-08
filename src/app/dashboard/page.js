// src/app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import StatCard from '@/componentsUser/StatCard/StatCard';
import { FiFilePlus, FiFileText, FiClock, FiCpu, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api'; // Importa a instância do axios
import { toast } from 'react-hot-toast';

// Helper de formatação (sem alterações)
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

// Componente de Esqueleto para a página
const DashboardSkeleton = () => (
    <div className={styles.dashboard}>
        <header className={styles.header}>
            <div>
                <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
            </div>
            <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
        </header>
        <div className={styles.statsGrid}>
            {[...Array(3)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
        </div>
        <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonTable}`}></div>
    </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentTranscriptions, setRecentTranscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/users/me/dashboard');
        setStats(response.data.stats);
        setRecentTranscriptions(response.data.recentTranscriptions);
      } catch (err) {
        const msg = err.response?.data?.message || 'Não foi possível carregar os dados do dashboard.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FiAlertCircle size={48} />
        <h2>Erro ao Carregar</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Seu Dashboard</h1>
          <p className={styles.subtitle}>Visão geral da sua atividade e atalhos rápidos.</p>
        </div>
        <Link href="/dashboard/nova-transcricao" className={styles.ctaButton}>
          <FiFilePlus />
          <span>Nova Transcrição</span>
        </Link>
      </header>

      {stats && (
        <div className={styles.statsGrid}>
          <StatCard
            icon={<FiFileText />}
            title="Transcrições Realizadas"
            value={stats.transcriptions.count}
            limit={stats.transcriptions.limit}
            unit="unidades"
          />
          <StatCard
            icon={<FiClock />}
            title="Minutos Processados"
            value={Math.round(stats.minutes.count)}
            limit={stats.minutes.limit}
            unit="min"
          />
          <StatCard
            icon={<FiCpu />}
            title="Conteúdos Gerados por IA"
            value={stats.assistants.count}
            limit={stats.assistants.limit}
            unit="usos"
          />
        </div>
      )}

      <h2 className={styles.sectionTitle}>Transcrições Recentes</h2>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableHeaderCell}>Nome do Arquivo</th>
              <th className={styles.tableHeaderCell}>Data</th>
              <th className={styles.tableHeaderCell}>Status</th>
              <th className={styles.tableHeaderCell}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {recentTranscriptions.length > 0 ? (
              recentTranscriptions.map((item) => (
                <tr key={item.id}>
                  <td className={styles.tableBodyCell}>
                    <span className={styles.fileName}>{item.originalFileName}</span>
                  </td>
                  <td className={styles.tableBodyCell}>{formatDate(item.createdAt)}</td>
                  <td className={styles.tableBodyCell}>
                    <span className={`${styles.status} ${styles[item.status.toLowerCase()]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className={styles.tableBodyCell}>
                    <Link href={`/dashboard/transcricoes/${item.id}`} className={styles.viewLink}>
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.emptyCell}>
                  Nenhuma transcrição foi realizada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}