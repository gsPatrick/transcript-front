// src/componentsAdmin/AdminHeader/AdminHeader.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './AdminHeader.module.css';
import { 
  FiHome, FiUsers, FiPackage, FiCpu, FiSettings, FiDollarSign, FiLogOut, FiMenu, FiX, 
} from 'react-icons/fi';

const navItems = [
  { href: '/admin', icon: <FiHome />, label: 'Dashboard' },
  { href: '/admin/usuarios', icon: <FiUsers />, label: 'Usuários' },
  { href: '/admin/planos', icon: <FiPackage />, label: 'Planos' },
  { href: '/dashboard/assistentes', icon: <FiCpu />, label: 'Meus Assistentes' },
  { href: '/admin/configuracoes', icon: <FiSettings />, label: 'Configurações' },
];

export default function AdminHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/admin" onClick={() => setIsMenuOpen(false)}>
          <Image src="/logo.png" width={100} height={50} alt="TranscriMedX Admin" />
          <span className={styles.logoText}>Admin Panel</span>
        </Link>
      </div>

      <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
        {navItems.map(item => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        <div className={styles.mobileDivider}></div>
        <Link 
          href="/login" 
          className={`${styles.navLink} ${styles.mobileOnlyLink} ${styles.logoutLinkMobile}`}
          onClick={() => {
            setIsMenuOpen(false);
            if (typeof window !== 'undefined') localStorage.removeItem('authToken');
          }}
        >
          <FiLogOut />
          <span>Sair</span>
        </Link>
      </nav>

      <div className={styles.userActionsDesktop}>
        <Link 
          href="/login" 
          className={`${styles.navLink} ${styles.logoutLink}`}
          onClick={() => {
            if (typeof window !== 'undefined') localStorage.removeItem('authToken');
          }}
        >
          <FiLogOut />
          <span className={styles.userActionsLabel}>Sair</span>
        </Link>
      </div>
      
      <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <FiX /> : <FiMenu />}
      </button>
    </header>
  );
}