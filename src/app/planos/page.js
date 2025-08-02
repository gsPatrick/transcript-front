// src/app/planos/page.js

'use client';

import { useState, useEffect } from 'react';
import Header from '@/componentsLP/Header/Header';
import Footer from '@/componentsLP/Footer/Footer';
import PlanCard from '@/componentsLP/Shared/PlanCard/PlanCard';
import styles from './page.module.css';
import { publicApi } from '@/lib/api'; // <<< 1. IMPORTAR A publicApi
import { FiAlertCircle } from 'react-icons/fi';

export default function AllPlansPage() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        // <<< 2. USAR A publicApi E A NOVA ROTA
        const response = await publicApi.get('/public/plans');
        setPlans(response.data);
      } catch (err) {
        setError('Não foi possível carregar os planos. Tente novamente mais tarde.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <>
      <Header />
      <main className={styles.pageWrapper}>
        <div className={styles.container}>
          <div className={styles.pageHeader}>
            <h1 className={styles.title}>Todos os Nossos Planos</h1>
            <p className={styles.subtitle}>
              Encontre a combinação perfeita de funcionalidades e limites para o seu fluxo de trabalho.
            </p>
          </div>
          
          {isLoading ? (
            <div className={styles.plansGrid}>
              {[...Array(3)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <FiAlertCircle size={40} />
              <p>{error}</p>
            </div>
          ) : (
            <div className={styles.plansGrid}>
              {plans.map(plan => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}