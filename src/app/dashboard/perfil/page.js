// src/app/dashboard/perfil/page.js

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import TabNav from '@/componentsUser/Profile/TabNav';
import ProfileInfo from '@/componentsUser/Profile/ProfileInfo';
import ApiKeySettings from '@/componentsUser/Profile/ApiKeySettings';
import api from '@/lib/api';

const TABS = ["Perfil", "Configuração de API"];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [userData, setUserData] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [userRes, planRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/users/me/plan-usage'),
      ]);
      setUserData(userRes.data);
      setPlanData(planRes.data);
    } catch (err) {
      toast.error('Não foi possível carregar os dados do perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateProfile = async ({ name, email, password }) => {
    const toastId = toast.loading('Atualizando perfil...');
    try {
      const payload = { name, email };
      if (password) {
        payload.password = password;
      }
      const response = await api.put('/users/me', payload);
      setUserData(response.data.user); // Atualiza o estado com os novos dados
      toast.success('Perfil atualizado com sucesso!', { id: toastId });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar perfil.';
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleUpdateApiKey = async (apiKey) => {
    const toastId = toast.loading('Salvando chave da API...');
    try {
      await api.post('/users/me/openai-key', { apiKey });
      setUserData(prev => ({ ...prev, openAiApiKey: apiKey })); // Atualiza a chave localmente
      toast.success('Chave da OpenAI salva com sucesso!', { id: toastId });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao salvar a chave.';
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleRemoveApiKey = async () => {
    if (window.confirm("Tem certeza que deseja remover sua chave da OpenAI?")) {
      const toastId = toast.loading('Removendo chave da API...');
      try {
        await api.delete('/users/me/openai-key');
        setUserData(prev => ({ ...prev, openAiApiKey: null }));
        toast.success('Chave da OpenAI removida com sucesso!', { id: toastId });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Erro ao remover a chave.';
        toast.error(errorMessage, { id: toastId });
      }
    }
  };
  
  const userWithPlan = userData ? { ...userData, plan: planData?.plan, expiresAt: planData?.expiresAt } : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Meu Perfil</h1>
        <p className={styles.subtitle}>Gerencie suas informações pessoais e configurações da plataforma.</p>
      </header>

      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className={styles.tabContent}>
        {isLoading ? (
          <SkeletonLoader activeTab={activeTab} />
        ) : (
          <>
            {activeTab === 'Perfil' && (
              <ProfileInfo user={userWithPlan} onSave={handleUpdateProfile} />
            )}
            {activeTab === 'Configuração de API' && (
              <ApiKeySettings 
                apiKey={userData?.openAiApiKey} 
                onSave={handleUpdateApiKey}
                onRemove={handleRemoveApiKey}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Componente de Skeleton para a tela de carregamento
const SkeletonLoader = ({ activeTab }) => (
  <div className={styles.skeletonWrapper}>
    {activeTab === 'Perfil' ? (
      <>
        <div className={`${styles.skeleton} ${styles.skeletonInput}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonInput}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonPlanBox}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
      </>
    ) : (
      <>
        <div className={`${styles.skeleton} ${styles.skeletonText}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonInput}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
      </>
    )}
  </div>
);