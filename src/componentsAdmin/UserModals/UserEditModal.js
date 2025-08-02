// src/componentsAdmin/UserModals/UserEditModal.js

import { useState } from 'react';
import Modal from '@/componentsUser/Modal/Modal';
import styles from './UserModals.module.css';

export default function UserEditModal({ user, onSave, onClose }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || 'user');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(user.id, { name, email, role });
    setIsSaving(false);
  };

  if (!user) return null;

  return (
    <Modal isOpen={!!user} onClose={onClose} title="Editar Usuário">
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome Completo</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="role">Papel (Role)</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>Cancelar</button>
          <button type="button" className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
}