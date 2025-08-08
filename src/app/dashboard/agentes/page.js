// src/app/dashboard/agentes/page.js

'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import AssistantCard from '@/componentsUser/AssistantCard/AssistantCard'; // <<< IMPORT CORRIGIDO: usa AssistantCard para renderizar
import Modal from '@/componentsUser/Modal/Modal';
import AssistantForm from '@/componentsUser/AssistantForm/AssistantForm'; // <<< IMPORT CORRIGIDO: usa AssistantForm para o formulário
import { FiPlusCircle, FiCpu, FiUser, FiEdit, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

// Subcomponente interno para adicionar os botões de ação ao AgentCard
const AgentCardWithActions = ({ agent, onEdit, onDelete }) => (
  // O agentCardWrapper já lida com a borda, sombra e hover para o card + actions
  <div className={styles.agentCardWrapper}>
    {/* O AssistantCard é apenas o conteúdo visual, sem borda/sombra própria para este caso */}
    <AssistantCard assistant={agent} /> 
    {!agent.isSystemAgent && (
      <div className={styles.cardActions}>
        <button onClick={() => onEdit(agent)} className={styles.actionButton}><FiEdit /> Editar</button>
        <button onClick={() => onDelete(agent.id)} className={`${styles.actionButton} ${styles.deleteButton}`}><FiTrash2 /> Excluir</button>
      </div>
    )}
  </div>
);

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [planUsage, setPlanUsage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null); // null para criar, objeto para editar

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [agentsRes, usageRes] = await Promise.all([
          api.get('/agents/available'),
          api.get('/users/me/plan-usage'),
        ]);
        setAgents(agentsRes.data);
        setPlanUsage(usageRes.data);
      } catch (err) {
        console.error("Erro ao carregar agentes:", err); // Log para depuração
        const errorMessage = err.response?.data?.message || 'Não foi possível carregar os agentes.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const { systemAgents, userAgents } = useMemo(() => {
    return agents.reduce((acc, agent) => {
      if (agent.isSystemAgent) {
        acc.systemAgents.push(agent);
      } else {
        acc.userAgents.push(agent);
      }
      return acc;
    }, { systemAgents: [], userAgents: [] });
  }, [agents]);
  
  const canCreateAgent = planUsage?.plan?.features?.allowUserAgentCreation || false;

  const openCreateModal = () => {
    setEditingAgent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (agent) => {
    setEditingAgent({
      ...agent,
      instructions: agent.description || agent.promptTemplate, 
      model: agent.modelUsed, 
    });
    setIsModalOpen(true);
  };

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm("Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.")) {
      const toastId = toast.loading('Excluindo agente...');
      try {
        await api.delete(`/agents/my-agents/${agentId}`);
        setAgents(prev => prev.filter(agent => agent.id !== agentId));
        toast.success('Agente excluído com sucesso!', { id: toastId });
      } catch (err) {
        console.error("Erro ao excluir agente:", err); // Log para depuração
        const errorMessage = err.response?.data?.message || 'Não foi possível excluir o agente.';
        toast.error(errorMessage, { id: toastId });
      }
    }
  };

  const handleSaveAgent = async (data) => {
    const isEditing = !!editingAgent;
    const toastId = toast.loading(isEditing ? 'Atualizando agente...' : 'Criando agente...');
    
    const agentPayload = {
      name: data.name,
      description: data.instructions, 
      promptTemplate: data.instructions, 
      outputFormat: data.outputFormat,
      modelUsed: data.model, 
    };
    
    try {
      if (isEditing) {
        const response = await api.put(`/agents/my-agents/${editingAgent.id}`, agentPayload);
        setAgents(prev => prev.map(agent => (agent.id === editingAgent.id ? response.data : agent)));
        toast.success('Agente atualizado com sucesso!', { id: toastId });
      } else {
        const response = await api.post('/agents/my-agents', agentPayload);
        setAgents(prev => [...prev, response.data]);
        toast.success('Novo agente criado com sucesso!', { id: toastId });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao salvar agente:", err); // Log para depuração
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro.';
      toast.error(errorMessage, { id: toastId });
    }
  };

  if (isLoading) return <AgentsPageSkeleton />;
  if (error) return <div className={styles.errorContainer}><FiAlertCircle size={48} /><h2>Erro ao Carregar</h2><p>{error}</p></div>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Meus Agentes de IA</h1>
          <p className={styles.subtitle}>Visualize os agentes disponíveis e gerencie seus próprios agentes personalizados.</p>
        </div>
        {canCreateAgent && (
          <button onClick={openCreateModal} className={styles.ctaButton}>
            <FiPlusCircle /> Criar Novo Agente
          </button>
        )}
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FiCpu /> Agentes do Sistema</h2>
        <div className={styles.agentsGrid}>
          {systemAgents.map(agent => (
            // Para agentes do sistema, o AssistantCard é usado diretamente
            // e ele não precisa de um wrapper extra, pois não tem ações de edição/exclusão.
            <AssistantCard key={agent.id} assistant={agent} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FiUser /> Meus Agentes Personalizados</h2>
        {userAgents.length > 0 ? (
          <div className={styles.agentsGrid}>
            {userAgents.map(agent => (
              <AgentCardWithActions key={agent.id} agent={agent} onEdit={openEditModal} onDelete={handleDeleteAgent} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Você ainda não criou nenhum agente.</p>
            {canCreateAgent && <button onClick={openCreateModal} className={styles.ctaButton}>Criar meu primeiro agente</button>}
          </div>
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAgent ? 'Editar Agente' : 'Criar Novo Agente'}
      >
        <AssistantForm 
          assistant={editingAgent} 
          onSave={handleSaveAgent}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

const AgentsPageSkeleton = () => (
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
            <div className={styles.agentsGrid}>
                {[...Array(3)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
            </div>
        </section>
        <section className={styles.section}>
            <div className={`${styles.skeleton} ${styles.skeletonSectionTitle}`}></div>
            <div className={styles.agentsGrid}>
                {[...Array(2)].map((_, i) => <div key={i} className={`${styles.skeleton} ${styles.skeletonCard}`}></div>)}
            </div>
        </section>
    </div>
);