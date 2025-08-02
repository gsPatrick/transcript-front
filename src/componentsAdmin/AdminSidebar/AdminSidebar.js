'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './AdminSidebar.module.css';
import { 
  FiHome, FiUsers, FiPackage, FiCpu, FiSettings, FiDollarSign 
} from 'react-icons/fi';

const navItems = [
  { href: '/admin', icon: <FiHome />, label: 'Dashboard' },
  { href: '/admin/usuarios', icon: <FiUsers />, label: 'Usuários' },
  { href: '/admin/planos', icon: <FiPackage />, label: 'Planos' },
  { href: '/admin/agentes', icon: <FiCpu />, label: 'Agentes' },
  { href: '/admin/configuracoes', icon: <FiSettings />, label: 'Configurações' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link href="/admin">
          <Image src="/logo.png" width={100} height={50} alt="TranscriMedX Admin" />
          <span className={styles.logoText}>Admin</span>
        </Link>
      </div>
      <nav className={styles.nav}>
        <ul>
          {navItems.map(item => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}