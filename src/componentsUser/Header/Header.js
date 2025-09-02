// src/componentsUser/Header/Header.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { FiHome, FiEdit, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

// Itens de navegação para a área do usuário
const navItems = [
  { href: '/dashboard', icon: <FiHome />, label: 'Início' },
  { href: '/dashboard/transcrever', icon: <FiEdit />, label: 'Transcrever' },
  { href: '/dashboard/conta', icon: <FiUser />, label: 'Minha Conta' },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fecha o menu se a rota mudar
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Impede o scroll da página quando o menu estiver aberto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
  }, [isMenuOpen]);
  
  // Opcional: Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest(`.${styles.header}, .${styles.nav}`)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.leftContent}>
          <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className={styles.logoContainer}>
            <Link href="/dashboard">
              <Image src="/logo.png" width={100} height={50} alt="Conduta Medx" priority />
              <span className={styles.logoText}>Plataforma</span>
            </Link>
          </div>
        </div>

        <div className={styles.rightContent}>
          <Link href="/login" className={styles.logoutLink}>
            <FiLogOut />
            <span className={styles.logoutText}>Sair</span>
          </Link>
        </div>
      </header>
      
      <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
        {navItems.map(item => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`${styles.navLink} ${pathname.startsWith(item.href) ? styles.active : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        {/* Divisor e link de Sair para consistência no mobile */}
        <div className={styles.mobileDivider}></div>
        <Link href="/login" className={`${styles.navLink} ${styles.mobileLogoutLink}`}>
            <FiLogOut />
            <span>Sair</span>
        </Link>
      </nav>
    </>
  );
}