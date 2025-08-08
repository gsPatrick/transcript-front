// src/app/admin/planos/page.js

'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { toast } from 'react-hot-toast';
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import Modal from '@/componentsUser/Modal/Modal';
import PlanForm from '@/componentsAdmin/PlanForm/PlanForm';
import { FiPlusCircle, FiEdit, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function AdminPlansPage() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // <<< CORREÇÃO: Função fetchPlans simplificada para remover Promise.all >>>
  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fazendo uma única chamada de API de forma direta
      const response = await api.get('/admin/plans');
      
      // Mantendo a validação importante da correção anterior
      if (Array.isArray(response.data)) {
        setPlans(response.data);
      } else {
        console.warn("A resposta da API para /admin/plans não era um array:", response.data);
        setPlans([]); // Garante que o estado seja sempre um array
        setError("Formato de dados inesperado recebido do servidor.");
      }

    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar planos.';
      setError(msg);
      toast.error(msg);
      setPlans([]); // Garante que `plans` seja um array mesmo em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };
  
  const handleDeletePlan = async (planId) => {
    if (window.confirm("Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.")) {
      const toastId = toast.loading('Excluindo plano...');
      try {
        await api.delete(`/admin/plans/${planId}`);
        setPlans(prev => prev.filter(p => p.id !== planId));
        toast.success("Plano excluído.", { id: toastId });
      } catch (err) {
        toast.error(err.response?.data?.message || "Erro ao excluir.", { id: toastId });
      }
    }
  };

  const handleSavePlan = async (planData) => {
    const isEditing = !!editingPlan;
    const toastId = toast.loading(isEditing ? 'Salvando alterações...' : 'Criando plano...');
    
    try {
      if (isEditing) {
        const response = await api.put(`/admin/plans/${editingPlan.id}`, planData);
        setPlans(plans.map(p => (p.id === editingPlan.id ? response.data : p)));
        toast.success("Plano atualizado!", { id: toastId });
      } else {
        const response = await api.post('/admin/plans', planData);
        setPlans([...plans, response.data]);
        toast.success("Plano criado!", { id: toastId });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Ocorreu um erro.", { id: toastId });
    }
  };

  const formatLimit = (limit) => (limit === -1 || limit === null || limit === undefined ? 'Ilimitado' : limit);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Gerenciar Planos</h1>
          <p>Crie, edite e remova os planos de assinatura da plataforma.</p>
        </div>
        <button onClick={openCreateModal} className={styles.ctaButton}><FiPlusCircle /> Criar Novo Plano</button>
      </header>
      
      {isLoading && <TableSkeleton />}
      {!isLoading && error && <div className={styles.errorContainer}><FiAlertCircle size={32}/> {error}</div>}
      {!isLoading && !error && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome do Plano</th>
                <th>Preço</th>
                <th>Duração</th>
                <th>Limites Chave</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(plans) && plans.length > 0 ? (
                plans.map(plan => (
                  <tr key={plan.id}>
                    <td className={styles.planName}>{plan.name}</td>
                    <td>{`R$ ${parseFloat(plan.price).toFixed(2)}`}</td>
                    <td>{`${plan.durationInDays} dias`}</td>
                    <td className={styles.limitsCell}>
                      <span>Transcrições: <strong>{formatLimit(plan.features?.maxAudioTranscriptions)}</strong></span>
                      <span>Minutos: <strong>{formatLimit(plan.features?.maxTranscriptionMinutes)}</strong></span>
                      <span>Usos de IA: <strong>{formatLimit(plan.features?.maxAssistantUses)}</strong></span>
                    </td>
                    <td className={styles.actionsCell}>
                      <ActionMenu>
                        <button onClick={() => openEditModal(plan)} className={styles.menuItem}><FiEdit /> Editar</button>
                        <button onClick={() => handleDeletePlan(plan.id)} className={`${styles.menuItem} ${styles.deleteMenuItem}`}><FiTrash2 /> Excluir</button>
                      </ActionMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.noResults}>Nenhum plano encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPlan ? `Editar Plano: ${editingPlan.name}` : 'Criar Novo Plano'}
        >
          <PlanForm
            plan={editingPlan}
            onSave={handleSavePlan}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}

const TableSkeleton = () => (
    <div className={styles.tableWrapper}>
        <table className={styles.table}>
            <thead><tr>{[...Array(5)].map((_,i) => <th key={i}><div className={`${styles.skeleton} ${styles.skeletonHeader}`}></div></th>)}</tr></thead>
            <tbody>{[...Array(3)].map((_,i) => <tr key={i}>{[...Array(5)].map((_,j) => <td key={j}><div className={`${styles.skeleton} ${styles.skeletonCell}`}></div></td>)}</tr>)}</tbody>
        </table>
    </div>
);