// src/componentsAdmin/AdminHeader/AdminHeader.js

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './AdminHeader.module.css';
import { 
  FiHome, FiUsers, FiBox, FiPackage, FiFileText, FiCpu, FiSettings, FiFilePlus, FiLogOut, FiMenu, FiX, 
} from 'react-icons/fi';

const navItems = [
  { href: '/admin', icon: <FiHome />, label: 'Dashboard' },
  { href: '/admin/usuarios', icon: <FiUsers />, label: 'Usuários' },
  { href: '/admin/planos', icon: <FiPackage />, label: 'Planos' },
  { href: '/admin/assistentes', icon: <FiCpu />, label: 'Assistentes' },
  { href: '/admin/conteudo-gerado', icon: <FiBox />, label: 'Conteúdo Gerado' },
  { href: '/admin/transcricoes/nova', icon: <FiFilePlus />, label: 'Transcrever Áudio' }, 
  { href: '/admin/transcricoes', icon: <FiFileText />, label: 'Transcrições' },
  { href: '/admin/configuracoes', icon: <FiSettings />, label: 'Configurações' },
];

export default function AdminHeader() {
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

  // Função para fechar o menu ao clicar fora (opcional, mas recomendado)
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
            <Link href="/admin">
              <Image src="/logo.png" width={100} height={50} alt="Conduta Medx" priority />
              <span className={styles.logoText}>Admin Panel</span>
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
      
      {/* O painel de navegação agora é um elemento separado */}
      <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
        {navItems.map(item => (
          <Link 
            key={item.href} 
            href={item.href}
            className={`${styles.navLink} ${pathname.startsWith(item.href) && item.href !== '/admin' || pathname === item.href ? styles.active : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}