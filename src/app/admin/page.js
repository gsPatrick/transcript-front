// src/app/admin/page.js
'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { toast } from 'react-hot-toast';
import { FiDollarSign, FiBarChart2, FiUsers, FiUserCheck, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

// Componente de Esqueleto (sem alterações)
const DashboardSkeleton = () => (
    <div className={styles.page}>
        <header className={styles.header}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
        </header>
        <div className={styles.statsGrid}>
            {[...Array(4)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
        </div>
    </div>
);

export default function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/admin/dashboard-stats');
                setStats(response.data);
            } catch (err) {
                const msg = err.response?.data?.message || 'Não foi possível carregar as estatísticas.';
                setError(msg);
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (value) => {
        const number = Number(value);
        if (isNaN(number)) {
            return 'R$ 0,00';
        }
        return number.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    // --- MUDANÇA PRINCIPAL AQUI ---
    // Checa por erro OU se os stats não foram carregados, e mostra uma mensagem clara.
    if (error || !stats) {
        return (
            <div className={styles.errorContainer}>
                <FiAlertCircle size={48} />
                <h2>{error ? 'Erro ao Carregar Dashboard' : 'Não foi possível carregar os dados'}</h2>
                <p>{error || 'O servidor não retornou as estatísticas necessárias. Verifique o backend.'}</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Dashboard do Administrador</h1>
                    <p>Visão geral e métricas chave da plataforma.</p>
                </div>
            </header>
            
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#0ea5e9' }}>
                            <FiDollarSign />
                        </div>
                        <h4>Receita Total</h4>
                    </div>
                    <div className={styles.cardValue}>
                        {formatCurrency(stats.totalRevenue)}
                    </div>
                </div>
                
                <div className={styles.statCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper} style={{ backgroundColor: '#dcfce7', color: '#22c55e' }}>
                            <FiBarChart2 />
                        </div>
                        <h4>Receita do Mês</h4>
                    </div>
                    <div className={styles.cardValue}>
                        {formatCurrency(stats.monthlyRevenue)}
                    </div>
                </div>
                
                <div className={styles.statCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper} style={{ backgroundColor: '#eef2ff', color: '#6366f1' }}>
                            <FiUserCheck />
                        </div>
                        <h4>Assinaturas Ativas</h4>
                    </div>
                    <div className={styles.cardValue}>
                        {stats.activeSubscriptions.toLocaleString('pt-BR')}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.iconWrapper} style={{ backgroundColor: '#fefce8', color: '#eab308' }}>
                            <FiUsers />
                        </div>
                        <h4>Novos Usuários (Mês)</h4>
                    </div>
                    <div className={styles.cardValue}>
                        {stats.newUsersThisMonth.toLocaleString('pt-BR')}
                    </div>
                </div>
            </div>
        </div>
    );
}