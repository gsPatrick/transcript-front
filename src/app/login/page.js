// src/app/login/page.js

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Header from '@/componentsLP/Header/Header'; // <<< 1. Importar Header
import Footer from '@/componentsLP/Footer/Footer'; // <<< 2. Importar Footer
import AuthLayout from '@/componentsLP/Auth/AuthLayout';
import styles from './page.module.css';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;

      toast.success(`Login realizado com sucesso! Bem-vindo(a), ${data.user.name.split(' ')[0]}!`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      
      const destination = data.user.role === 'admin' ? '/admin' : '/dashboard';

      setTimeout(() => {
        router.push(destination);
      }, 1000);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Ocorreu um erro. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // <<< 3. Envolver tudo em um Fragment <>
    <>
      <Header />
      {/* Adicionamos uma tag <main> com uma classe para estilização */}
      <main className={styles.pageWrapper}>
        <AuthLayout title="Acessar sua Conta">
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBox}>{error}</div>}
            
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
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className={styles.optionsWrapper}>
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="remember" name="remember" disabled={isLoading} />
                <label htmlFor="remember">Lembrar de mim</label>
              </div>
              <Link href="/recuperar-senha" className={styles.forgotPassword}>
                Esqueceu a senha?
              </Link>
            </div>
            
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <p className={styles.redirectLink}>
            Não tem uma conta?{' '}
            <Link href="/planos">Crie uma agora</Link>
          </p>
        </AuthLayout>
      </main>
      <Footer />
    </>
  );
}