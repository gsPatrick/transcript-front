import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import Header from '@/componentsLP/Header/Header';
import Footer from '@/componentsLP/Footer/Footer';
import AuthLayout from '@/componentsLP/Auth/AuthLayout';
import styles from './page.module.css';
import api, { publicApi } from '@/lib/api';

// --- Componente de Cliente Interno ---
// Todo o seu código original que usa hooks de cliente vai aqui dentro.
// A diretiva 'use client' é a chave para a correção.
function RegisterFormContent() {
  'use client';

  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId'); // Pega o ID do plano da URL

  const [planName, setPlanName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Busca o nome do plano para exibir na tela usando a API pública
  useEffect(() => {
    if (planId) {
      const fetchPlanName = async () => {
        try {
          const response = await publicApi.get(`/public/plans`); // Usa a nova rota pública
          const selectedPlan = response.data.find(p => p.id === planId);
          if (selectedPlan) {
            setPlanName(selectedPlan.name);
          }
        } catch (err) {
          console.error("Não foi possível buscar os detalhes do plano.", err);
          toast.error("Não foi possível carregar os detalhes do plano selecionado.");
        }
      };
      fetchPlanName();
    }
  }, [planId]);

  // Inicia o checkout após o usuário ser registrado e logado
  const handleCheckout = async (selectedPlanId) => {
    const toastId = toast.loading('Quase lá! Criando seu link de pagamento...');
    try {
      // Usa a API privada, que agora enviará o token do novo usuário
      const response = await api.post('/subscriptions/checkout', { planId: selectedPlanId });
      const { checkoutUrl } = response.data;
      toast.success('Redirecionando para o pagamento...', { id: toastId });
      window.location.href = checkoutUrl;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Não foi possível iniciar o checkout.';
      toast.error(errorMessage, { id: toastId });
      // Se o checkout falhar, redireciona para o dashboard para não deixar o usuário preso
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      toast.error('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // A rota de registro é pública, mas usar 'api' não causa problema aqui.
      const response = await api.post('/auth/register', { name, email, password });
      const { token } = response.data;

      toast.success('Conta criada com sucesso! Bem-vindo(a)!');
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
      }
      
      // Se um plano foi selecionado, inicia o checkout. Senão, vai para o dashboard.
      if (planId) {
        await handleCheckout(planId);
      } else {
        setTimeout(() => router.push('/dashboard'), 1000);
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    }
    // O setIsLoading(false) não é chamado no caso de sucesso, pois a página será redirecionada.
  };

  return (
    <>
      {planName && (
        <div className={styles.planInfoBox}>
          <p>Você está se inscrevendo no plano: <strong>{planName}</strong></p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="name">Nome Completo</label>
          <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="password">Crie sua Senha</label>
          <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" disabled={isLoading} />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirme sua Senha</label>
          <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength="6" disabled={isLoading} />
        </div>
        
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Processando...' : (planId ? 'Continuar para Pagamento' : 'Criar Minha Conta')}
        </button>
      </form>
      
      <p className={styles.redirectLink}>
        Já tem uma conta?{' '}
        <Link href="/login">Faça Login</Link>
      </p>
    </>
  );
}


// --- Componente de Servidor (Página Principal) ---
// Este é o componente principal da página. Ele permanece como um "Server Component".
// Sua responsabilidade é montar o layout e carregar o componente de cliente com Suspense.
export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className={styles.pageWrapper}>
        <AuthLayout title="Crie sua Conta">
          <Suspense fallback={<div>Carregando...</div>}>
            <RegisterFormContent />
          </Suspense>
        </AuthLayout>
      </main>
      <Footer />
    </>
  );
}