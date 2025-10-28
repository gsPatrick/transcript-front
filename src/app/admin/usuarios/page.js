// src/app/admin/usuarios/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import UserDetailsModal from '@/componentsAdmin/UserModals/UserDetailsModal';
import UserEditModal from '@/componentsAdmin/UserModals/UserEditModal';
import AssignPlanModal from '@/componentsAdmin/UserModals/AssignPlanModal';
import UserCreateModal from '@/componentsAdmin/UserModals/UserCreateModal'; 
// <<< 1. IMPORTAR O NOVO MODAL >>>
import ResetPasswordModal from '@/componentsAdmin/UserModals/ResetPasswordModal';
import { FiSearch, FiUserPlus, FiFilter, FiEye, FiPackage, FiEdit, FiTrash2, FiAlertCircle, FiLock } from 'react-icons/fi';
import api from '@/lib/api';

// Hook useDebounce (sem alterações)
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
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

  // Estados dos modais
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [assigningPlanUser, setAssigningPlanUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // <<< 2. NOVO ESTADO PARA O MODAL DE RESET DE SENHA >>>
  const [resettingPasswordUser, setResettingPasswordUser] = useState(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage, limit: 10,
        searchTerm: debouncedSearchTerm, planName: filterPlan,
      });
      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data.users);
      setPagination({ currentPage: response.data.currentPage, totalPages: response.data.totalPages });
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao buscar usuários.';
      setError(msg); toast.error(msg);
    } finally { setIsLoading(false); }
  }, [pagination.currentPage, debouncedSearchTerm, filterPlan]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('/admin/plans');
        setPlans(response.data);
      } catch (err) { toast.error('Não foi possível carregar a lista de planos.'); }
    };
    fetchPlans();
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  
  const handleUpdateUser = async (userId, data) => {
    const toastId = toast.loading('Atualizando usuário...');
    try {
      await api.put(`/admin/users/${userId}`, data);
      toast.success('Usuário atualizado!', { id: toastId });
      setEditingUser(null); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao atualizar.', { id: toastId }); }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Tem certeza? Esta ação é irreversível.")) {
      const toastId = toast.loading('Excluindo usuário...');
      try {
        await api.delete(`/admin/users/${userId}`);
        toast.success('Usuário excluído!', { id: toastId });
        fetchUsers();
      } catch (err) { toast.error(err.response?.data?.message || 'Erro ao excluir.', { id: toastId }); }
    }
  };

  const handleAssignPlan = async (userId, planId) => {
    const toastId = toast.loading('Atribuindo plano...');
    try {
      await api.post('/admin/users/assign-plan', { userId, planId });
      toast.success('Plano atribuído!', { id: toastId });
      setAssigningPlanUser(null); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao atribuir.', { id: toastId }); }
  };

  const handleCreateUser = async (userData) => {
    const toastId = toast.loading('Criando usuário...');
    try {
      await api.post('/auth/register', userData); 
      toast.success('Usuário criado com sucesso!', { id: toastId });
      setIsCreateModalOpen(false); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao criar usuário.', { id: toastId }); }
  };
  
  // <<< 3. NOVA FUNÇÃO PARA CHAMAR A API DE RESET DE SENHA >>>
  const handleResetPassword = async (userId, newPassword) => {
    const toastId = toast.loading('Redefinindo senha...');
    try {
      await api.put(`/admin/users/${userId}/password`, { newPassword });
      toast.success('Senha do usuário redefinida com sucesso!', { id: toastId });
      setResettingPasswordUser(null); // Fecha o modal
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao redefinir a senha.', { id: toastId });
    }
  };
  
  const getStatusClass = (user) => (user.planId && new Date(user.planExpiresAt) > new Date() ? styles.active : styles.inactive);
  const getStatusText = (user) => (user.planId && new Date(user.planExpiresAt) > new Date() ? 'Ativo' : 'Inativo');
  const handleFilterChange = (e) => { setFilterPlan(e.target.value); setPagination(p => ({ ...p, currentPage: 1 })); };
  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setPagination(p => ({ ...p, currentPage: 1 })); };
  
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
        <button className={styles.ctaButton} onClick={() => setIsCreateModalOpen(true)}><FiUserPlus /> Novo Usuário</button>
      </div>

      {isLoading && <TableSkeleton />}
      {!isLoading && error && <div className={styles.errorContainer}><FiAlertCircle size={32}/> {error}</div>}
      {!isLoading && !error && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr><th>Nome</th><th>E-mail</th><th>Plano Atual</th><th>Status</th><th>Data de Cadastro</th><th>Ações</th></tr>
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
                        {/* <<< 4. ADICIONAR OPÇÃO DE RESET DE SENHA NO MENU >>> */}
                        <button onClick={() => setResettingPasswordUser(user)} className={styles.menuItem}><FiLock /> Redefinir Senha</button>
                        <button onClick={() => setAssigningPlanUser(user)} className={styles.menuItem}><FiPackage /> Atribuir Plano</button>
                        <button onClick={() => handleDeleteUser(user.id)} className={`${styles.menuItem} ${styles.deleteMenuItem}`}><FiTrash2 /> Excluir</button>
                      </ActionMenu>
                    </td>
                  </tr>
                )) : ( <tr><td colSpan="6" className={styles.noResults}>Nenhum usuário encontrado.</td></tr> )}
              </tbody>
            </table>
          </div>
          {/* TODO: Paginação */}
        </>
      )}
      
      {viewingUser && <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />}
      {editingUser && <UserEditModal user={editingUser} onSave={handleUpdateUser} onClose={() => setEditingUser(null)} />}
      {assigningPlanUser && <AssignPlanModal user={assigningPlanUser} plans={plans} onSave={handleAssignPlan} onClose={() => setAssigningPlanUser(null)} />}
      {isCreateModalOpen && <UserCreateModal onSave={handleCreateUser} onClose={() => setIsCreateModalOpen(false)} />}
      
      {/* <<< 5. RENDERIZAR O NOVO MODAL >>> */}
      {resettingPasswordUser && (
        <ResetPasswordModal
          user={resettingPasswordUser}
          onSave={handleResetPassword}
          onClose={() => setResettingPasswordUser(null)}
        />
      )}
    </div>
  );
}

const TableSkeleton = () => (
    <div className={styles.tableWrapper}>
        <table className={styles.table}>
            <thead><tr>{[...Array(6)].map((_, i) => <th key={i}><div className={`${styles.skeleton} ${styles.skeletonHeader}`}></div></th>)}</tr></thead>
            <tbody>{[...Array(5)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j}><div className={`${styles.skeleton} ${styles.skeletonCell}`}></div></td>)}</tr>)}</tbody>
        </table>
    </div>
);