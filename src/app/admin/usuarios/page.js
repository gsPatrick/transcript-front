// src/app/admin/usuarios/page.js

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import UserDetailsModal from '@/componentsAdmin/UserModals/UserDetailsModal';
import UserEditModal from '@/componentsAdmin/UserModals/UserEditModal';
import AssignPlanModal from '@/componentsAdmin/UserModals/AssignPlanModal';
import { FiSearch, FiUserPlus, FiFilter, FiEye, FiPackage, FiEdit, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

// --- HOOK useDebounce INCLUÍDO DIRETAMENTE NO ARQUIVO ---
// Em um projeto maior, é recomendado colocá-lo em seu próprio arquivo (ex: src/hooks/useDebounce.js)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    // Configura um timer para atualizar o valor debounced após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpa o timer se o valor mudar (evitando atualizações desnecessárias)
    // ou se o componente for desmontado.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Roda o efeito novamente apenas se o valor ou o delay mudarem
  return debouncedValue;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para controlar os modais
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [assigningPlanUser, setAssigningPlanUser] = useState(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Atraso de 500ms para a busca

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        searchTerm: debouncedSearchTerm,
        planName: filterPlan,
      });
      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users);
      setPagination({ currentPage: response.data.currentPage, totalPages: response.data.totalPages });
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao buscar usuários.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, debouncedSearchTerm, filterPlan]);

  useEffect(() => {
    // Busca os planos para popular o dropdown de filtro
    const fetchPlans = async () => {
      try {
        const response = await api.get('/admin/plans');
        setPlans(response.data);
      } catch (err) {
        toast.error('Não foi possível carregar a lista de planos.');
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  const handleUpdateUser = async (userId, data) => {
    const toastId = toast.loading('Atualizando usuário...');
    try {
      await api.put(`/admin/users/${userId}`, data);
      toast.success('Usuário atualizado com sucesso!', { id: toastId });
      setEditingUser(null);
      fetchUsers(); // Recarrega a lista
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao atualizar usuário.', { id: toastId });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita e pode falhar se o usuário tiver dados associados.")) {
      const toastId = toast.loading('Excluindo usuário...');
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('Usuário excluído com sucesso!', { id: toastId });
        fetchUsers(); // Recarrega a lista
      } catch (err) {
        toast.error(err.response?.data?.message || 'Erro ao excluir usuário.', { id: toastId });
      }
    }
  };

  const handleAssignPlan = async (userId, planId) => {
    const toastId = toast.loading('Atribuindo plano...');
    try {
      await api.post('/admin/users/assign-plan', { userId, planId });
      toast.success('Plano atribuído com sucesso!', { id: toastId });
      setAssigningPlanUser(null);
      fetchUsers(); // Recarrega a lista
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao atribuir plano.', { id: toastId });
    }
  };
  
  const getStatusClass = (user) => (user.planId && new Date(user.planExpiresAt) > new Date() ? styles.active : styles.inactive);

  const getStatusText = (user) => {
    if (user.planId && new Date(user.planExpiresAt) > new Date()) {
      return 'Ativo';
    }
    return 'Inativo';
  };

  const handleFilterChange = (e) => {
    setFilterPlan(e.target.value);
    setPagination(p => ({ ...p, currentPage: 1 }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(p => ({ ...p, currentPage: 1 }));
  };
  
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Gerenciar Usuários</h1>
        <p>Visualize e administre todos os usuários da plataforma.</p>
      </header>
      
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <FiSearch />
          <input type="text" placeholder="Buscar por nome ou e-mail..." value={searchTerm} onChange={handleSearchChange} />
        </div>
        <div className={styles.filterGroup}>
          <FiFilter />
          <select value={filterPlan} onChange={handleFilterChange}>
            <option value="Todos">Todos os Planos</option>
            {plans.map(plan => <option key={plan.id} value={plan.name}>{plan.name}</option>)}
            <option value="Nenhum">Nenhum Plano</option>
          </select>
        </div>
        <button className={styles.ctaButton} onClick={() => toast.error('Funcionalidade não implementada.')}><FiUserPlus /> Novo Usuário</button>
      </div>

      {isLoading && <TableSkeleton />}
      {!isLoading && error && <div className={styles.errorContainer}><FiAlertCircle size={32}/> {error}</div>}
      {!isLoading && !error && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome</th><th>E-mail</th><th>Plano Atual</th><th>Status</th><th>Data de Cadastro</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map(user => (
                  <tr key={user.id}>
                    <td className={styles.userCell}><div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.currentPlan ? <span className={styles.planTag}>{user.currentPlan.name}</span> : <span className={styles.noPlanTag}>Nenhum</span>}</td>
                    <td><span className={`${styles.statusTag} ${getStatusClass(user)}`}>{getStatusText(user)}</span></td>
                    <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className={styles.actionsCell}>
                      <ActionMenu>
                        <button onClick={() => setViewingUser(user)} className={styles.menuItem}><FiEye /> Ver Detalhes</button>
                        <button onClick={() => setEditingUser(user)} className={styles.menuItem}><FiEdit /> Editar Usuário</button>
                        <button onClick={() => setAssigningPlanUser(user)} className={styles.menuItem}><FiPackage /> Atribuir Plano</button>
                        <button onClick={() => handleDeleteUser(user.id)} className={`${styles.menuItem} ${styles.deleteMenuItem}`}><FiTrash2 /> Excluir</button>
                      </ActionMenu>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className={styles.noResults}>Nenhum usuário encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* TODO: Adicionar componente de paginação */}
        </>
      )}
      
      {viewingUser && <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />}
      {editingUser && <UserEditModal user={editingUser} plans={plans} onSave={handleUpdateUser} onClose={() => setEditingUser(null)} />}
      {assigningPlanUser && <AssignPlanModal user={assigningPlanUser} plans={plans} onSave={handleAssignPlan} onClose={() => setAssigningPlanUser(null)} />}
    </div>
  );
}

// --- COMPONENTE SKELETON INCLUÍDO DIRETAMENTE NO ARQUIVO ---
const TableSkeleton = () => (
    <div className={styles.tableWrapper}>
        <table className={styles.table}>
            <thead>
                <tr>
                    {[...Array(6)].map((_, i) => (
                        <th key={i} className={styles.tableHeaderCell}>
                            <div className={`${styles.skeleton} ${styles.skeletonHeader}`}></div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {[...Array(5)].map((_, i) => (
                    <tr key={i} className={styles.tableRow}>
                        {[...Array(6)].map((_, j) => (
                            <td key={j} className={styles.tableBodyCell}>
                                <div className={`${styles.skeleton} ${styles.skeletonCell}`}></div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);