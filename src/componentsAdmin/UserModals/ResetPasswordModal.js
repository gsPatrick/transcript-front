// src/componentsAdmin/UserModals/ResetPasswordModal.js
'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Modal from '@/componentsUser/Modal/Modal';
import styles from './UserModals.module.css'; // Reutiliza o CSS dos outros modais de usuário

export default function ResetPasswordModal({ user, onSave, onClose }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    
    setIsSaving(true);
    await onSave(user.id, newPassword);
    setIsSaving(false);
  };

  if (!user) return null;

  return (
    <Modal isOpen={!!user} onClose={onClose} title={`Redefinir Senha para ${user.name}`}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formGroup}>
          <label htmlFor="new-password">Nova Senha</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength="6"
            placeholder="Digite a nova senha"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirm-password">Confirmar Nova Senha</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
            placeholder="Repita a nova senha"
          />
        </div>
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button type="button" className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Nova Senha'}
          </button>
        </div>
      </form>
    </Modal>
  );
}