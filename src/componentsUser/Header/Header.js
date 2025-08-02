// src/componentsUser/Header/Header.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { 
  FiGrid, 
  FiFileText, 
  FiCpu, 
  FiUser, 
  FiLogOut,
  FiBox,
  FiMenu,
  FiX
} from 'react-icons/fi';

const navItems = [
  { href: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
  { href: '/dashboard/transcricoes', icon: <FiFileText />, label: 'Minhas Transcrições' },
  { href: '/dashboard/conteudo-gerado', icon: <FiBox />, label: 'Conteúdo Gerado' },
{ href: '/dashboard/assistentes', icon: <FiCpu />, label: 'Meus Assistentes' },
];

// Separamos os itens de usuário para tratá-los de forma diferente no mobile
const userItems = [
    { href: '/dashboard/perfil', icon: <FiUser />, label: 'Meu Perfil' },
    { href: '/login', icon: <FiLogOut />, label: 'Sair', className: styles.logoutLinkMobile }
]

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Efeito para fechar o menu se o tamanho da tela mudar para desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trava o scroll da página quando o menu mobile está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);


  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
          <Image src="/logo.png" width={150} height={50} alt="TranscriMedX" className={styles.logoIcon} />
        </Link>
      </div>

      {/* Navegação que se transforma em menu mobile */}
      <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
        {/* Links principais */}
        {navItems.map(item => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${styles.navLink} ${pathname.startsWith(item.href) && item.href !== '/dashboard' || pathname === item.href ? styles.active : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        {/* Divisor para o menu mobile */}
        <div className={styles.mobileDivider}></div>
        {/* Links de usuário que aparecem APENAS no menu mobile */}
        {userItems.map(item => (
           <Link 
            key={item.href} 
            href={item.href} 
            className={`${styles.navLink} ${styles.mobileOnlyLink} ${item.className || ''} ${pathname.startsWith(item.href) ? styles.active : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Ações de usuário para a versão desktop */}
      <div className={styles.userActionsDesktop}>
        <Link 
            href="/dashboard/perfil" 
            className={`${styles.navLink} ${pathname.startsWith('/dashboard/perfil') ? styles.active : ''}`}
        >
          <FiUser />
          <span className={styles.userActionsLabel}>Meu Perfil</span>
        </Link>
        <Link href="/login" className={`${styles.navLink} ${styles.logoutLink}`}>
          <FiLogOut />
           <span className={styles.userActionsLabel}>Sair</span>
        </Link>
      </div>
      
      {/* Botão de controle do menu mobile */}
      <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <FiX /> : <FiMenu />}
      </button>

    </header>
  );
}