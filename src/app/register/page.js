import { Suspense } from 'react';
import Header from '@/componentsLP/Header/Header';
import Footer from '@/componentsLP/Footer/Footer';
import AuthLayout from '@/componentsLP/Auth/AuthLayout';
import styles from './page.module.css';
import RegisterForm from './RegisterForm'; // Importando o novo componente de cliente

// Este é um componente de carregamento simples para o Suspense
function LoadingFallback() {
  return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>;
}

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className={styles.pageWrapper}>
        <AuthLayout title="Crie sua Conta">
          <Suspense fallback={<LoadingFallback />}>
            <RegisterForm />
          </Suspense>
        </AuthLayout>
      </main>
      <Footer />
    </>
  );
}