// src/app/recuperar-senha/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Header from '@/componentsLP/Header/Header';
import Footer from '@/componentsLP/Footer/Footer';
import AuthLayout from '@/componentsLP/Auth/AuthLayout';
import styles from './page.module.css'; // Usaremos um CSS dedicado
import api, { publicApi } from '@/lib/api'; // Usaremos a publicApi

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Novo estado para controlar a UI após o envio

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // Usamos a publicApi pois o usuário não está logado nesta tela
      await publicApi.post('/auth/forgot-password', { email });
      
      // Mesmo que o backend sempre retorne sucesso, mostramos a mensagem de sucesso na UI
      toast.success('Solicitação enviada com sucesso!');
      setIsSubmitted(true); // Muda a UI para mostrar a mensagem de confirmação

    } catch (err) {
      // Embora o backend não retorne erro por segurança, tratamos erros de rede ou servidor aqui
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.pageWrapper}>
        <AuthLayout title="Recuperar Senha">
          {isSubmitted ? (
            <div className={styles.successMessage}>
              <h3>Verifique seu e-mail</h3>
              <p>
                Se uma conta com o e-mail <strong>{email}</strong> existir em nosso sistema, 
                enviaremos um link para você redefinir sua senha.
              </p>
              <Link href="/login" className={styles.backToLoginLink}>
                Voltar para o Login
              </Link>
            </div>
          ) : (
            <>
              <p className={styles.instructions}>
                Digite o e-mail associado à sua conta e enviaremos um link para você redefinir sua senha.
              </p>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="seuemail@exemplo.com"
                  />
                </div>
                
                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
              </form>
              
              <p className={styles.redirectLink}>
                Lembrou da senha?{' '}
                <Link href="/login">Faça Login</Link>
              </p>
            </>
          )}
        </AuthLayout>
      </main>
      <Footer />
    </>
  );
}