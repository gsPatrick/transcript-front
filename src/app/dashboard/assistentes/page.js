// src/app/dashboard/assistentes/page.js
'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css'; // Renomeie o CSS também
import { toast } from 'react-hot-toast';
import Modal from '@/componentsUser/Modal/Modal';
import AssistantForm from '@/componentsUser/AssistantForm/AssistantForm'; // <<< Usará o novo formulário
import AssistantCard from '@/componentsUser/AssistantCard/AssistantCard'; // <<< Usará o novo card
import { FiPlusCircle, FiCpu, FiUsers, FiEdit, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function MyAssistantsPage() {
  const [systemAssistants, setSystemAssistants] = useState([]);
  const [userAssistants, setUserAssistants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // O endpoint /assistants/available já retorna ambos os tipos
      const response = await api.get('/assistants/available');
      setSystemAssistants(response.data.filter(a => a.isSystemAssistant));
      setUserAssistants(response.data.filter(a => !a.isSystemAssistant));
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar assistentes.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingAssistant(null);
    setIsModalOpen(true);
  };

  const openEditModal = (assistant) => {
    setEditingAssistant(assistant);
    setIsModalOpen(true);
  };

  const handleDelete = async (assistantId) => {
    if (window.confirm("Tem certeza que deseja excluir este assistente?")) {
      const toastId = toast.loading('Excluindo...');
      try {
        await api.delete(`/assistants/my-assistants/${assistantId}`);
        setUserAssistants(prev => prev.filter(a => a.id !== assistantId));
        toast.success("Assistente excluído.", { id: toastId });
      } catch (err) {
        toast.error(err.response?.data?.message || "Erro ao excluir.", { id: toastId });
      }
    }
  };

  const handleSave = async (assistantData) => {
    const isEditing = !!editingAssistant;
    const toastId = toast.loading(isEditing ? 'Salvando...' : 'Criando...');

    try {
      if (isEditing) {
        const response = await api.put(`/assistants/my-assistants/${editingAssistant.id}`, assistantData);
        setUserAssistants(userAssistants.map(a => a.id === editingAssistant.id ? response.data.assistant : a));
        toast.success("Assistente atualizado!", { id: toastId });
      } else {
        const response = await api.post('/assistants/my-assistants', assistantData);
        setUserAssistants([...userAssistants, response.data.assistant]);
        toast.success("Assistente criado!", { id: toastId });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Ocorreu um erro.", { id: toastId });
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <div className={styles.errorContainer}><FiAlertCircle size={32}/> {error}</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Meus Assistentes de IA</h1>
          <p>Crie e gerencie seus assistentes personalizados para automatizar tarefas.</p>
        </div>
        <button onClick={openCreateModal} className={styles.ctaButton}><FiPlusCircle /> Criar Novo Assistente</button>
      </header>
      
      <section>
        <h2 className={styles.sectionTitle}><FiUsers /> Meus Assistentes Personalizados</h2>
        {userAssistants.length > 0 ? (
          <div className={styles.grid}>
            {userAssistants.map(assistant => (
              <div key={assistant.id} className={styles.cardWrapper}>
                <AssistantCard assistant={assistant} />
                <div className={styles.cardActions}>
                  <button onClick={() => openEditModal(assistant)} className={styles.actionButton}><FiEdit/> Editar</button>
                  <button onClick={() => handleDelete(assistant.id)} className={`${styles.actionButton} ${styles.deleteButton}`}><FiTrash2/> Excluir</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Você ainda não criou nenhum assistente personalizado.</p>
        )}
      </section>

      <section>
        <h2 className={styles.sectionTitle}><FiCpu /> Assistentes do Sistema</h2>
        {systemAssistants.length > 0 ? (
          <div className={styles.grid}>
            {systemAssistants.map(assistant => (
              <div key={assistant.id} className={styles.cardWrapper}>
                <AssistantCard assistant={assistant} />
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Nenhum assistente do sistema disponível no momento.</p>
        )}
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAssistant ? 'Editar Assistente' : 'Criar Novo Assistente'}>
        <AssistantForm
          assistant={editingAssistant}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

const PageSkeleton = () => (
    <div className={styles.page}>
        <header className={styles.header}>
            <div>
                <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
            </div>
            <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
        </header>
        <section>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
            <div className={styles.grid}>
                {[...Array(2)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
            </div>
        </section>
    </div>
);