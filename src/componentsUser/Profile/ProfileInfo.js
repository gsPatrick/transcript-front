// src/componentsUser/Profile/ProfileInfo.js

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import styles from './ProfileInfo.module.css';
import { FiUser, FiLock, FiZap } from 'react-icons/fi';

export default function ProfileInfo({ user, onSave }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }
    setIsSaving(true);
    await onSave({ name, email, password: password || undefined });
    setIsSaving(false);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <form onSubmit={handleSubmit}>
          <h3 className={styles.cardTitle}><FiUser /> Informações Pessoais</h3>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome Completo</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSaving}/>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSaving}/>
          </div>

          <h3 className={styles.cardTitle}><FiLock /> Alterar Senha</h3>
          <div className={styles.passwordGrid}>
              <div className={styles.formGroup}>
                  <label htmlFor="password">Nova Senha</label>
                  <input type="password" id="password" placeholder="Deixe em branco para não alterar" value={password} onChange={(e) => setPassword(e.target.value)} minLength="6" disabled={isSaving}/>
              </div>
              <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                  <input type="password" id="confirmPassword" placeholder="Repita a nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSaving}/>
              </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>

      {user?.plan && (
        <div className={styles.planCard}>
            <div className={styles.planIcon}><FiZap/></div>
            <div className={styles.planDetails}>
                <h4>Plano Atual: <strong>{user.plan.name}</strong></h4>
                <p>Sua assinatura expira em: <strong>{new Date(user.expiresAt).toLocaleDateString('pt-BR')}</strong></p>
            </div>
            <button className={styles.planButton}>Gerenciar Plano</button>
        </div>
      )}
    </div>
  );
}