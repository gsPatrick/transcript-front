'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { 
  FiGrid, 
  FiFileText, 
  FiCpu, 
  FiUser, 
  FiLogOut,
  FiBox // Novo ícone para Conteúdo Gerado
} from 'react-icons/fi';

// --- ATUALIZAÇÃO AQUI ---
const navItems = [
  { href: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
  { href: '/dashboard/transcricoes', icon: <FiFileText />, label: 'Minhas Transcrições' },
  { href: '/dashboard/conteudo-gerado', icon: <FiBox />, label: 'Conteúdo Gerado' },
  { href: '/dashboard/agentes', icon: <FiCpu />, label: 'Meus Agentes' },
  { href: '/dashboard/perfil', icon: <FiUser />, label: 'Meu Perfil e Plano' },
];
// --- FIM DA ATUALIZAÇÃO ---

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link href="/dashboard">
          <Image src="/logo.png" width={100} height={50} alt="TranscriMedX" />
        </Link>
      </div>
      <nav className={styles.nav}>
        <ul>
          {navItems.map(item => (
            <li key={item.href}>
              <Link href={item.href} className={`${styles.navLink} ${pathname.startsWith(item.href) && item.href !== '/dashboard' || pathname === item.href ? styles.active : ''}`}>
                {item.icon}
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.logoutContainer}>
        <Link href="/login" className={styles.navLink}>
          <FiLogOut />
          <span className={styles.navLabel}>Sair</span>
        </Link>
      </div>
    </aside>
  );
}