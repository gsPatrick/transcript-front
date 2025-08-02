// src/componentsAdmin/SettingsForm/SettingsForm.js

'use client';

import { useState, useEffect } from 'react';
import styles from './SettingsForm.module.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import api from '@/lib/api'; // Precisamos da API para buscar o valor real

export default function SettingsForm({ setting, onSave, onCancel }) {
  const [showValue, setShowValue] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentValue, setCurrentValue] = useState('');

  // Busca o valor real da configuração ao abrir o modal
  useEffect(() => {
    const fetchRealValue = async () => {
      setIsLoading(true);
      try {
        // Precisamos de um novo endpoint para buscar o valor real (não mascarado)
        // Por agora, vamos assumir que o valor passado é o mascarado e permitir a substituição.
        // Em um sistema real, criaríamos GET /api/admin/settings/:key/value
        setCurrentValue(''); // O campo começa em branco para o admin digitar o novo valor
        setIsLoading(false);
      } catch (error) {
        toast.error("Não foi possível carregar o valor atual.");
        onCancel();
      }
    };
    
    // A API não tem um endpoint para buscar o valor real, então vamos apenas permitir a substituição.
    // O campo começará em branco para o novo valor.
    setCurrentValue('');
    setIsLoading(false);

  }, [setting.key, onCancel]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(setting.key, currentValue);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="value">{setting.description}</label>
        <p className={styles.helpText}>Valor atual: <code>{setting.value}</code>. Digite um novo valor abaixo para substituir.</p>
        <div className={styles.inputWrapper}>
          <input
            type={setting.isSensitive && !showValue ? 'password' : 'text'}
            id="value"
            name="value"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder="Digite o novo valor aqui"
            required
            disabled={isLoading}
          />
          {setting.isSensitive && (
            <button type="button" className={styles.toggleButton} onClick={() => setShowValue(!showValue)}>
              {showValue ? <FiEyeOff /> : <FiEye />}
            </button>
          )}
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className={styles.saveButton} disabled={isLoading || !currentValue}>
          Salvar Configuração
        </button>
      </div>
    </form>
  );
}