// src/app/admin/agentes/page.js

'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { toast } from 'react-hot-toast';
import Modal from '@/componentsUser/Modal/Modal';
import AgentForm from '@/componentsUser/AssistantForm/AssistantForm'; // Reutilizamos o form
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import { FiPlusCircle, FiCpu, FiUsers, FiEdit, FiTrash2, FiCopy, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function AdminAgentsPage() {
  const [systemAgents, setSystemAgents] = useState([]);
  const [userAgents, setUserAgents] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [systemAgentsRes, userAgentsRes, plansRes] = await Promise.all([
          api.get('/admin/agents/system'),
          api.get('/admin/agents/user-created'),
          api.get('/admin/plans'),
        ]);
        setSystemAgents(systemAgentsRes.data);
        setUserAgents(userAgentsRes.data);
        setAvailablePlans(plansRes.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Erro ao carregar dados dos agentes.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingAgent(null);
    setModalTitle('Criar Agente do Sistema');
    setIsModalOpen(true);
  };

  const openEditModal = (agent) => {
    setEditingAgent(agent);
    setModalTitle('Editar Agente do Sistema');
    setIsModalOpen(true);
  };

  const openReplicateModal = (agent) => {
    // Prepara uma cópia do agente do usuário para ser salvo como agente do sistema
    const agentToReplicate = { ...agent, name: `${agent.name} (Cópia)`, id: null, planSpecific: false, allowedPlanIds: [] };
    setEditingAgent(agentToReplicate);
    setModalTitle('Replicar Agente para o Sistema');
    setIsModalOpen(true);
  };

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm("Tem certeza que deseja excluir este agente do sistema?")) {
      const toastId = toast.loading('Excluindo agente...');
      try {
        await api.delete(`/admin/agents/system/${agentId}`);
        setSystemAgents(prev => prev.filter(a => a.id !== agentId));
        toast.success("Agente do sistema excluído.", { id: toastId });
      } catch (err) {
        toast.error(err.response?.data?.message || "Erro ao excluir.", { id: toastId });
      }
    }
  };

  const handleSaveAgent = async (agentData) => {
    const isEditing = editingAgent && editingAgent.id;
    const toastId = toast.loading(isEditing ? 'Salvando...' : 'Criando...');

    try {
      let response;
      if (isEditing) {
        response = await api.put(`/admin/agents/system/${editingAgent.id}`, agentData);
        setSystemAgents(systemAgents.map(a => a.id === editingAgent.id ? response.data : a));
        toast.success("Agente atualizado!", { id: toastId });
      } else {
        response = await api.post('/admin/agents/system', agentData);
        setSystemAgents([...systemAgents, response.data]);
        toast.success("Agente do sistema criado!", { id: toastId });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Ocorreu um erro.", { id: toastId });
    }
  };
  
  const getPlanNames = (allowedPlanIds) => {
    if (!allowedPlanIds || allowedPlanIds.length === 0) return 'Todos os Planos';
    return allowedPlanIds.map(id => availablePlans.find(p => p.id === id)?.name).filter(Boolean).join(', ');
  };

  if (isLoading) return <PageSkeleton />;
  if (error) return <div className={styles.errorContainer}><FiAlertCircle size={32}/> {error}</div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Gerenciar Agentes</h1>
          <p>Administre os agentes do sistema e visualize os criados pelos usuários.</p>
        </div>
        <button onClick={openCreateModal} className={styles.ctaButton}><FiPlusCircle /> Criar Agente do Sistema</button>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FiCpu /> Agentes do Sistema</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th>Nome</th><th>Disponível para</th><th>Formato</th><th>Ações</th></tr></thead>
            <tbody>
              {systemAgents.map(agent => (
                <tr key={agent.id}>
                  <td className={styles.agentName}>{agent.name}</td>
                  <td>{agent.planSpecific ? getPlanNames(agent.allowedPlanIds) : 'Todos os Planos'}</td>
                  <td>{agent.outputFormat?.toUpperCase() || 'N/A'}</td>
                  <td className={styles.actionsCell}>
                    <ActionMenu>
                      <button onClick={() => openEditModal(agent)} className={styles.menuItem}><FiEdit /> Editar</button>
                      <button onClick={() => handleDeleteAgent(agent.id)} className={styles.menuItem}><FiTrash2 /> Excluir</button>
                    </ActionMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FiUsers /> Agentes Criados por Usuários</h2>
        <div className={styles.tableWrapper}>
           <table className={styles.table}>
            <thead><tr><th>Nome</th><th>Criado por</th><th>Prompt</th><th>Ações</th></tr></thead>
            <tbody>
              {userAgents.map(agent => (
                <tr key={agent.id}>
                  <td className={styles.agentName}>{agent.name}</td>
                  <td>{agent.creator?.name || 'Usuário Removido'}</td>
                  <td className={styles.promptCell} title={agent.promptTemplate}>{agent.promptTemplate}</td>
                  <td className={styles.actionsCell}>
                     <button onClick={() => openReplicateModal(agent)} className={styles.replicateButton} title="Copiar este agente para os Agentes do Sistema"><FiCopy /> Replicar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
        <AgentForm
          agent={editingAgent}
          onSave={handleSaveAgent}
          onCancel={() => setIsModalOpen(false)}
          availablePlans={availablePlans}
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
        <section className={styles.section}>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonTable}`}></div>
        </section>
        <section className={styles.section}>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
            <div className={`${styles.skeleton} ${styles.skeletonTable}`}></div>
        </section>
    </div>
);