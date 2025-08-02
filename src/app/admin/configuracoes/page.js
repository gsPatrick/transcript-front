// src/app/admin/configuracoes/page.js

'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { toast } from 'react-hot-toast';
import Modal from '@/componentsUser/Modal/Modal';
import SettingsForm from '@/componentsAdmin/SettingsForm/SettingsForm';
import { FiEdit, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar configurações.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const openEditModal = (setting) => {
    setEditingSetting(setting);
    setIsModalOpen(true);
  };

  const handleSaveSetting = async (key, newValue) => {
    const toastId = toast.loading(`Atualizando ${key}...`);
    try {
      // O endpoint espera o valor no corpo da requisição
      const response = await api.put(`/admin/settings/${key}`, { value: newValue });
      
      // Atualiza o estado local com a resposta da API, que já vem com o valor mascarado se for sensível
      setSettings(settings.map(s => s.key === key ? response.data.setting : s));
      
      setIsModalOpen(false);
      toast.success(`Configuração "${key}" atualizada!`, { id: toastId });
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao salvar configuração.';
      toast.error(msg, { id: toastId });
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <div className={styles.errorContainer}><FiAlertCircle size={32}/> {error}</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Configurações do Sistema</h1>
        <p>Gerencie as chaves de API e outras configurações globais da plataforma.</p>
      </header>

      <div className={styles.settingsList}>
        {settings.map(setting => (
          <div key={setting.key} className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <h4>{setting.key}</h4>
              <p>{setting.description}</p>
              <code className={styles.settingValue}>
                {setting.value}
              </code>
            </div>
            <button onClick={() => openEditModal(setting)} className={styles.editButton}>
              <FiEdit /> Editar
            </button>
          </div>
        ))}
      </div>
      
      {editingSetting && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Editar: ${editingSetting.key}`}
        >
          <SettingsForm
            setting={editingSetting}
            onSave={handleSaveSetting}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

const PageSkeleton = () => (
    <div className={styles.page}>
        <header className={styles.header}>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
        </header>
        <div className={styles.settingsList}>
            {[...Array(3)].map((_, i) => (
                <div key={i} className={`${styles.skeleton} ${styles.skeletonSettingItem}`}></div>
            ))}
        </div>
    </div>
);