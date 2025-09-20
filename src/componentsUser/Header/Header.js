// src/componentsUser/Header/Header.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { 
  FiHome, 
  FiFileText, 
  FiCpu, 
  FiUser, 
  FiLogOut, 
  FiMenu, 
  FiX 
} from 'react-icons/fi';

// --- ESTRUTURA DE NAVEGAÇÃO ATUALIZADA ---
const navItems = [
  { href: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { href: '/dashboard/transcricoes', icon: <FiFileText />, label: 'Transcrições' },
  { href: '/dashboard/assistentes', icon: <FiCpu />, label: 'Assistentes' },
  { href: '/dashboard/perfil', icon: <FiUser />, label: 'Meu Perfil' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter(); // Hook para redirecionamento
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fecha o menu se a rota mudar
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Impede o scroll da página quando o menu estiver aberto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    // Cleanup function para reabilitar o scroll se o componente for desmontado
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);
  
  // Função de logout aprimorada
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login'); // Redireciona para a página de login
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.leftContent}>
          <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menu">
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className={styles.logoContainer}>
            <Link href="/dashboard">
              {/* Ajuste o caminho para seu logo, se necessário */}
              <Image src="/logo.png" width={40} height={40} alt="Conduta Medx Logo" priority />
              <span className={styles.logoText}>CondutaMedx</span>
            </Link>
          </div>
        </div>

        <div className={styles.rightContent}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <FiLogOut />
            <span className={styles.logoutText}>Sair</span>
          </button>
        </div>
      </header>
      
      <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
        {navItems.map(item => {
          // Lógica de link ativo aprimorada para evitar múltiplos links ativos
          const isActive = (item.href === '/dashboard') 
            ? pathname === item.href 
            : pathname.startsWith(item.href);

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
        {/* Divisor e link de Sair para consistência no mobile */}
        <div className={styles.mobileDivider}></div>
        <button onClick={handleLogout} className={`${styles.navLink} ${styles.mobileLogoutButton}`}>
            <FiLogOut />
            <span>Sair</span>
        </button>
      </nav>
    </>
  );
}