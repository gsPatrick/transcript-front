// Adicione a importação no topo
import { Toaster } from 'react-hot-toast';

import Header from '@/componentsUser/Header/Header'; // <<< ALTERADO: Importa o Header
import styles from './layout.module.css';

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.dashboardContainer}>
      <Header /> {/* <<< ALTERADO: Usa o Header no lugar da Sidebar */}
      <main className={styles.mainContent}> {/* <<< ALTERADO: Usando <main> e a classe correta */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: {
                background: '#2ecc71',
                color: 'white',
              },
              iconTheme: {
                primary: 'white',
                secondary: '#2ecc71',
              },
            },
            error: {
              style: {
                background: '#e74c3c',
                color: 'white',
              },
               iconTheme: {
                primary: 'white',
                secondary: '#e74c3c',
              },
            },
          }}
        />
        {children}
      </main>
    </div>
  );
}