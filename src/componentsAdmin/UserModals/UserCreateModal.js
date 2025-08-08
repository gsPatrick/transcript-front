// src/componentsAdmin/UserModals/UserCreateModal.js
'use client';

import { useState } from 'react';
import Modal from '@/componentsUser/Modal/Modal'; // Reutiliza o modal base
import styles from './UserModals.module.css'; // Reutiliza o CSS dos modais de usuário

export default function UserCreateModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // Admin pode escolher o papel
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave({ name, email, password, role }); // Chama a função onSave passada pelo pai
    setIsSaving(false);
    // Não limpa o formulário aqui, o pai fecha o modal em caso de sucesso
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Criar Novo Usuário">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="create-name">Nome Completo</label>
          <input id="create-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="create-email">E-mail</label>
          <input id="create-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="create-password">Senha</label>
          <input id="create-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="create-role">Papel (Role)</label>
          <select id="create-role" value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSaving}>Cancelar</button>
          <button type="submit" className={styles.saveButton} disabled={isSaving}>
            {isSaving ? 'Criando...' : 'Criar Usuário'}
          </button>
        </div>
      </form>
    </Modal>
  );
}