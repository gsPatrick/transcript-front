// src/componentsAdmin/UserModals/UserDetailsModal.js

import Modal from '@/componentsUser/Modal/Modal';
import styles from './UserModals.module.css';

export default function UserDetailsModal({ user, onClose }) {
  if (!user) return null;

  const formatDate = (dateString) => new Date(dateString).toLocaleString('pt-BR');

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Detalhes do Usuário">
      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <span className={styles.label}>ID do Usuário</span>
          <span className={styles.value}>{user.id}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>Nome Completo</span>
          <span className={styles.value}>{user.name}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>E-mail</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>Papel (Role)</span>
          <span className={styles.value}>{user.role}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>Plano Atual</span>
          <span className={styles.value}>{user.currentPlan?.name || 'Nenhum'}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>Plano Expira em</span>
          <span className={styles.value}>{user.planExpiresAt ? formatDate(user.planExpiresAt) : '-'}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>Data de Cadastro</span>
          <span className={styles.value}>{formatDate(user.createdAt)}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.label}>Última Atualização</span>
          <span className={styles.value}>{formatDate(user.updatedAt)}</span>
        </div>
      </div>
    </Modal>
  );
}