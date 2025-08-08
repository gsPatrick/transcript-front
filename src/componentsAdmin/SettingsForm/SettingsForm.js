// src/componentsAdmin/SettingsForm/SettingsForm.js
'use client';

import { useState } from 'react';
import styles from './SettingsForm.module.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function SettingsForm({ setting, onSave, onCancel }) {
  const [showValue, setShowValue] = useState(false);
  const [currentValue, setCurrentValue] = useState(''); // Começa em branco

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(setting.key, currentValue);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="value">{setting.description}</label>
        <p className={styles.helpText}>Valor atual: <code>{setting.value}</code>. Digite um novo valor para substituir.</p>
        <div className={styles.inputWrapper}>
          <input
            type={setting.isSensitive && !showValue ? 'password' : 'text'}
            id="value"
            name="value"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="Digite o novo valor aqui"
            required
            autoComplete="off"
          />
          {setting.isSensitive && (
            <button type="button" className={styles.toggleButton} onClick={() => setShowValue(!showValue)}>
              {showValue ? <FiEyeOff /> : <FiEye />}
            </button>
          )}
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>Cancelar</button>
        <button type="submit" className={styles.saveButton} disabled={!currentValue}>Salvar</button>
      </div>
    </form>
  );
}