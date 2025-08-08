// src/componentsLP/Header/Header.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { FiMenu, FiX, FiArrowRight, FiGrid } from 'react-icons/fi';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // Verifica o estado de login no lado do cliente
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    setIsMenuOpen(false);
    router.push('/'); // Redireciona para a home após o logout
    // Opcional: notificar o usuário
    // toast.success('Você saiu com sucesso!');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/" onClick={closeMenu}>
          
            <span className={styles.logoText}>Conduta Medx</span>
          </Link>
        </div>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <Link href="/#pricing" onClick={closeMenu} className={styles.navLink}>Planos</Link>
          <Link href="/#how-it-works" onClick={closeMenu} className={styles.navLink}>Como Funciona</Link>
          <Link href="/#contact" onClick={closeMenu} className={styles.navLink}>Contato</Link>
          
          {/* --- Divisor para mobile --- */}
          <div className={styles.mobileDivider}></div>

          {/* --- Lógica de Botões Dinâmicos --- */}
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={`${styles.navLink} ${styles.loginButtonMobile}`}>
                <FiGrid /> Acessar Dashboard
              </Link>
              <button onClick={handleLogout} className={`${styles.navLink} ${styles.logoutButtonMobile}`}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={closeMenu} className={`${styles.navLink} ${styles.loginButtonMobile}`}>
                Login
              </Link>
              <Link href="/planos" onClick={closeMenu} className={`${styles.navLink} ${styles.ctaButtonMobile}`}>
                Criar Conta <FiArrowRight />
              </Link>
            </>
          )}
        </nav>

        <div className={styles.actions}>
          {isLoggedIn ? (
            <>
              <button onClick={handleLogout} className={styles.loginButton}>
                Sair
              </button>
              <Link href="/dashboard" className={styles.ctaButton}>
                Acessar Dashboard <FiGrid />
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginButton}>Login</Link>
              <Link href="/planos" className={styles.ctaButton}>
                Criar Conta <FiArrowRight />
              </Link>
            </>
          )}
          <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Abrir menu">
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </header>
  );
}