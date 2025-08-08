// src/app/dashboard/assistentes/page.js
'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { toast } from 'react-hot-toast';
import Modal from '@/componentsUser/Modal/Modal';
import AssistantForm from '@/componentsUser/AssistantForm/AssistantForm';
import AssistantCard from '@/componentsUser/AssistantCard/AssistantCard';
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import { FiPlusCircle, FiCpu, FiUsers, FiEdit, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

const PageSkeleton = () => (
    <div className={styles.page}>
        <header className={styles.header}>
            <div>
                <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
            </div>
            <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
        </header>
        <div className={styles.section}>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
            <div className={styles.grid}>
                {[...Array(2)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
            </div>
        </div>
        <div className={styles.section}>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
            <div className={styles.grid}>
                {[...Array(2)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
            </div>
        </div>
    </div>
);

export default function MyAssistantsPage() {
  const [systemAssistants, setSystemAssistants] = useState([]);
  const [userAssistants, setUserAssistants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState(null);

  const fetchData = async () => {
    // Não seta o loading aqui para evitar piscar a tela ao recarregar
    setError(null);
    try {
      const response = await api.get('/assistants/available');
      setSystemAssistants(response.data.filter(a => a.isSystemAssistant));
      setUserAssistants(response.data.filter(a => !a.isSystemAssistant));
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar assistentes.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false); // Seta o loading para false apenas no final
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
    if (window.confirm("Tem certeza que deseja excluir este assistente? Esta ação é irreversível e removerá todos os dados associados.")) {
      const toastId = toast.loading('Excluindo assistente...');
      try {
        await api.delete(`/assistants/my-assistants/${assistantId}`);
        // Atualiza a lista na UI sem precisar de um novo fetch
        setUserAssistants(prev => prev.filter(a => a.id !== assistantId));
        toast.success("Assistente excluído com sucesso.", { id: toastId });
      } catch (err) {
        toast.error(err.response?.data?.message || "Erro ao excluir o assistente.", { id: toastId });
      }
    }
  };

  const handleSave = async (formData) => {
    const isEditing = !!editingAssistant;
    const toastId = toast.loading(isEditing ? 'Atualizando assistente...' : 'Criando novo assistente...');

    const dataToSend = new FormData();

    // Anexa todos os campos de primeiro nível
    Object.keys(formData).forEach(key => {
        if (key !== 'knowledgeBase' && key !== 'runConfiguration') {
            dataToSend.append(key, formData[key]);
        }
    });
    
    // Anexa objetos JSON como string
    dataToSend.append('runConfiguration', JSON.stringify(formData.runConfiguration));

    // Anexa arquivos para upload
    if (formData.knowledgeBase.files && formData.knowledgeBase.files.length > 0) {
      formData.knowledgeBase.files.forEach(file => {
        dataToSend.append('knowledgeFiles', file); // O backend espera um campo chamado 'knowledgeFiles'
      });
    }

    // Anexa IDs de arquivos para deleção
    if (formData.knowledgeBase.fileIdsToDelete && formData.knowledgeBase.fileIdsToDelete.length > 0) {
      dataToSend.append('filesToRemoveIds', JSON.stringify(formData.knowledgeBase.fileIdsToDelete));
    }
    
    try {
      let response;
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (isEditing) {
        response = await api.put(`/assistants/my-assistants/${editingAssistant.id}`, dataToSend, config);
        toast.success("Assistente atualizado com sucesso!", { id: toastId });
      } else {
        response = await api.post('/assistants/my-assistants', dataToSend, config);
        toast.success("Assistente criado com sucesso!", { id: toastId });
      }
      
      setIsModalOpen(false);
      fetchData(); // Recarrega os dados para garantir que a lista esteja 100% atualizada

    } catch (err) {
      toast.error(err.response?.data?.message || "Ocorreu um erro inesperado.", { id: toastId });
    }
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <div className={styles.errorContainer}><FiAlertCircle size={48}/><h2>Erro ao Carregar</h2><p>{error}</p></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Meus Assistentes de IA</h1>
          <p>Crie e gerencie seus assistentes personalizados para automatizar tarefas.</p>
        </div>
        <button onClick={openCreateModal} className={styles.ctaButton}><FiPlusCircle /> Criar Novo Assistente</button>
      </header>
      
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FiUsers /> Meus Assistentes</h2>
        {userAssistants.length > 0 ? (
          <div className={styles.grid}>
            {userAssistants.map(assistant => (
              <div key={assistant.id} className={styles.cardWrapper}>
                <div className={styles.cardMenuTrigger}>
                  <ActionMenu>
                    <button onClick={() => openEditModal(assistant)} className={styles.menuItem}>
                      <FiEdit/> Editar
                    </button>
                    <button onClick={() => handleDelete(assistant.id)} className={`${styles.menuItem} ${styles.deleteMenuItem}`}>
                      <FiTrash2/> Excluir
                    </button>
                  </ActionMenu>
                </div>
                <AssistantCard assistant={assistant} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <FiUsers size={48} />
            <h3>Você ainda não criou assistentes</h3>
            <p>Clique em "Criar Novo Assistente" para começar a automatizar suas tarefas.</p>
          </div>
        )}
      </section>

      <section className={styles.section}>
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
          <div className={styles.emptyState}>
            <FiCpu size={48} />
            <h3>Nenhum assistente do sistema disponível</h3>
            <p>Assistentes pré-configurados pela plataforma para tarefas comuns aparecerão aqui.</p>
          </div>
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