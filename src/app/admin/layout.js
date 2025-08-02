// src/app/admin/layout.js

import AdminHeader from '@/componentsAdmin/AdminHeader/AdminHeader'; // <<< ALTERADO
import styles from './layout.module.css';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminContainer}>
      <Toaster position="top-right" />
      <AdminHeader /> {/* <<< ALTERADO */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}