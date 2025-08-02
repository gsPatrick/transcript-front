// src/componentsAdmin/UserModals/AssignPlanModal.js

import { useState } from 'react';
import Modal from '@/componentsUser/Modal/Modal';
import styles from './UserModals.module.css';

export default function AssignPlanModal({ user, plans, onSave, onClose }) {
  const [selectedPlanId, setSelectedPlanId] = useState(user?.planId || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(user.id, selectedPlanId);
    setIsSaving(false);
  };

  if (!user) return null;

  return (
    <Modal isOpen={!!user} onClose={onClose} title={`Atribuir Plano para ${user.name}`}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.formGroup}>
          <label htmlFor="plan">Selecione um Plano</label>
          <select id="plan" value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)}>
            <option value="">Nenhum Plano</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.name} - R$ {plan.price}</option>
            ))}
          </select>
        </div>
        <div className={styles.formActions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>Cancelar</button>
          <button type="button" className={styles.saveButton} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Atribuindo...' : 'Atribuir Plano'}
          </button>
        </div>
      </form>
    </Modal>
  );
}