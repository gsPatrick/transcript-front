// src/app/admin/assistentes/page.js

'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css'; 
import { toast } from 'react-hot-toast';
import Modal from '@/componentsUser/Modal/Modal';
import AdminAssistantForm from '@/componentsAdmin/AssistantForm/AdminAssistantForm'; 
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import { FiPlusCircle, FiCpu, FiUsers, FiEdit, FiTrash2, FiCopy, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

// Componente de Esqueleto para a página (ATUALIZADO PARA CARDS)
const PageSkeleton = () => (
    <div className={styles.page}>
        <header className={styles.header}>
            <div>
                <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
                <div className={`${styles.skeleton} ${styles.skeletonSubtitle}`}></div>
            </div>
            <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
        </header>
        <section className={styles.section}>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
            <div className={styles.grid}>
                {[...Array(3)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
            </div>
        </section>
        <section className={styles.section}>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
            <div className={styles.grid}>
                {[...Array(3)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
            </div>
        </section>
    </div>
);

export default function AdminAssistantsPage() {
  const [systemAssistants, setSystemAssistants] = useState([]);
  const [userCreatedAssistants, setUserCreatedAssistants] = useState([]); 
  const [availablePlans, setAvailablePlans] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState(null); 
  const [modalTitle, setModalTitle] = useState(''); 

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [systemAssistantsRes, userCreatedAssistantsRes, plansRes] = await Promise.all([
        api.get('/admin/assistants/system'),
        api.get('/admin/assistants/user-created'), 
        api.get('/admin/plans'), 
      ]);
      setSystemAssistants(systemAssistantsRes.data);
      setUserCreatedAssistants(userCreatedAssistantsRes.data);
      setAvailablePlans(plansRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar dados.';
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
    setModalTitle('Criar Novo Assistente do Sistema');
    setIsModalOpen(true);
  };
  
  const openEditModal = (assistant) => {
    setEditingAssistant(assistant); 
    setModalTitle(`Editar Assistente: ${assistant.name}`);
    setIsModalOpen(true);
  };

  const openReplicateModal = (assistant) => {
    const replicatedAssistantData = {
      ...assistant,
      id: null,
      openaiAssistantId: null,
      openaiVectorStoreId: null,
      name: `${assistant.name} (Cópia)`, 
      isSystemAssistant: true, 
      createdByUserId: null, 
      planSpecific: false, 
      allowedPlanIds: [], 
      knowledgeBase: {
        openaiFileIds: [],
        files: [],
        fileIdsToDelete: [],
      }
    };
    setEditingAssistant(replicatedAssistantData);
    setModalTitle('Replicar Assistente para o Sistema');
    setIsModalOpen(true);
  };

  const handleDelete = async (assistantId) => {
    if (window.confirm("Tem certeza que deseja excluir este assistente? Esta ação também removerá todos os dados associados na OpenAI e não pode ser desfeita.")) {
      const toastId = toast.loading('Excluindo...');
      try {
        await api.delete(`/admin/assistants/system/${assistantId}`);
        setSystemAssistants(prev => prev.filter(a => a.id !== assistantId));
        toast.success("Assistente excluído.", { id: toastId });
      } catch (err) {
        toast.error(err.response?.data?.message || "Erro ao excluir.", { id: toastId });
      }
    }
  };
  
  const handleSave = async (assistantData) => {
    const isEditing = !!assistantData.id;
    const toastId = toast.loading(isEditing ? 'Salvando alterações...' : 'Criando assistente...');
    
    const formData = new FormData();

    formData.append('name', assistantData.name);
    formData.append('model', assistantData.model);
    formData.append('instructions', assistantData.instructions);
    formData.append('outputFormat', assistantData.outputFormat);
    formData.append('planSpecific', assistantData.planSpecific);
    formData.append('requiresUserOpenAiToken', assistantData.requiresUserOpenAiToken);
    formData.append('runConfiguration', JSON.stringify(assistantData.runConfiguration));
    formData.append('allowedPlanIds', JSON.stringify(assistantData.allowedPlanIds || []));
    
    if (isEditing) {
      formData.append('filesToRemoveIds', JSON.stringify(assistantData.knowledgeBase.fileIdsToDelete || []));
    }

    assistantData.knowledgeBase.files.forEach(fileObj => {
      formData.append('knowledgeFiles', fileObj.originalFile);
    });

    try {
      const url = isEditing
        ? `/admin/assistants/system/${assistantData.id}`
        : '/admin/assistants/system';
      const method = isEditing ? 'put' : 'post';

      const response = await api[method](url, formData);

      if (isEditing) {
        setSystemAssistants(prev => prev.map(a => a.id === assistantData.id ? response.data : a));
        toast.success("Assistente atualizado!", { id: toastId });
      } else {
        setSystemAssistants(prev => [...prev, response.data]);
        toast.success("Assistente criado!", { id: toastId });
      }
      setIsModalOpen(false);
      setEditingAssistant(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Ocorreu um erro.", { id: toastId });
    }
  };

  const getPlanNames = (allowedPlanIds) => {
    if (!allowedPlanIds || allowedPlanIds.length === 0) return <span className={styles.planTag}>Todos os Planos</span>;
    return allowedPlanIds.map(id => {
        const plan = availablePlans.find(p => p.id === id);
        return plan ? <span key={id} className={styles.planTag}>{plan.name}</span> : null;
    }).filter(Boolean);
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <div className={styles.errorContainer}><FiAlertCircle size={48}/><h2>Erro ao Carregar</h2><p>{error}</p></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Gerenciar Assistentes</h1>
          <p>Administre os assistentes do sistema e replique os criados por usuários.</p>
        </div>
        <button onClick={openCreateModal} className={styles.ctaButton}><FiPlusCircle /> Criar Assistente</button>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FiCpu /> Assistentes do Sistema</h2>
        {systemAssistants.length > 0 ? (
          <div className={styles.grid}>
            {systemAssistants.map(assistant => (
              <div key={assistant.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <FiCpu className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>{assistant.name}</h3>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Modelo:</span>
                    <span className={styles.metaValue}><span className={styles.modelTag}>{assistant.model}</span></span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Disponível para:</span>
                    <div className={styles.plansContainer}>{getPlanNames(assistant.allowedPlanIds)}</div>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <ActionMenu>
                    <button onClick={() => openEditModal(assistant)} className={styles.menuItem}><FiEdit /> Editar</button>
                    <button onClick={() => handleDelete(assistant.id)} className={`${styles.menuItem} ${styles.deleteMenuItem}`}><FiTrash2 /> Excluir</button>
                  </ActionMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhum assistente do sistema configurado.</p>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FiUsers /> Assistentes Criados por Usuários</h2>
        {userCreatedAssistants.length > 0 ? (
          <div className={styles.grid}>
            {userCreatedAssistants.map(assistant => (
              <div key={assistant.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <FiUsers className={styles.cardIcon} />
                  <h3 className={styles.cardTitle}>{assistant.name}</h3>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Criado por:</span>
                    <span className={styles.metaValue}>{assistant.creator?.email || 'Usuário Removido'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Modelo:</span>
                    <span className={styles.metaValue}><span className={styles.modelTag}>{assistant.model}</span></span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Prompt:</span>
                    <p className={styles.promptPreview} title={assistant.instructions}>
                      {assistant.instructions?.substring(0, 80) + (assistant.instructions?.length > 80 ? '...' : '') || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <button onClick={() => openReplicateModal(assistant)} className={styles.replicateButton} title="Copiar este assistente para os Assistentes do Sistema">
                    <FiCopy /> Replicar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhum assistente foi criado por usuários ainda.</p>
          </div>
        )}
      </section>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
            <AdminAssistantForm
            assistant={editingAssistant} 
            onSave={handleSave}
            onCancel={() => setIsModalOpen(false)}
            availablePlans={availablePlans} 
            />
        </Modal>
      )}
    </div>
  );
}