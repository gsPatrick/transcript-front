// src/app/reset-password/page.js
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Header from '@/componentsLP/Header/Header';
import Footer from '@/componentsLP/Footer/Footer';
import AuthLayout from '@/componentsLP/Auth/AuthLayout';
import styles from './page.module.css';
import { publicApi } from '@/lib/api';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

// Componente principal que usa o Suspense para ler os parâmetros da URL
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição não encontrado. Por favor, solicite um novo link.');
      toast.error('Token inválido ou ausente na URL.');
    }
  }, [token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      toast.error('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await publicApi.post('/auth/reset-password', { token, newPassword });
      toast.success('Senha redefinida com sucesso!');
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro. O token pode ser inválido ou ter expirado.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.finalMessage}>
        <FiCheckCircle className={styles.successIcon} />
        <h3>Senha Alterada!</h3>
        <p>Sua senha foi redefinida com sucesso. Agora você já pode acessar sua conta com a nova senha.</p>
        <Link href="/login" className={styles.submitButton}>
          Ir para o Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorBox}>
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="newPassword">Nova Senha</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength="6"
            disabled={isLoading || !token}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirme a Nova Senha</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
            disabled={isLoading || !token}
          />
        </div>
        
        <button type="submit" className={styles.submitButton} disabled={isLoading || !token}>
          {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
        </button>
      </form>
    </>
  );
}

// Componente de página que envolve o conteúdo com Suspense
export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <main className={styles.pageWrapper}>
        <AuthLayout title="Crie uma Nova Senha">
          <Suspense fallback={<div>Carregando...</div>}>
            <ResetPasswordContent />
          </Suspense>
        </AuthLayout>
      </main>
      <Footer />
    </>
  );
}