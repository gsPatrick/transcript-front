// src/componentsUser/Profile/AgentContentHistory.js

import styles from './AgentContentHistory.module.css';
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import { FiDownload, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

// Helper de download de texto
const downloadTxtFile = (filename, text) => {
  const element = document.createElement("a");
  const file = new Blob([text], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${filename.replace(/\.[^/.]+$/, "")}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export default function AgentContentHistory({ history }) {

  const handleDownload = async (item) => {
    const toastId = toast.loading('Preparando download...');
    try {
      if (item.format === 'pdf') {
        // Para PDF, fazemos o download direto do endpoint da API que retorna o arquivo
        const response = await api.get(`/agents/my-actions/${item.id}/download`, {
          responseType: 'blob', // Importante para o axios tratar a resposta como um arquivo
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        // O nome do arquivo pode vir do header 'content-disposition' ou podemos gerá-lo
        link.setAttribute('download', `${item.agentName}-${item.transcriptionName.replace(/\.[^/.]+$/, "")}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Para TXT, usamos o outputText que já temos
        downloadTxtFile(item.transcriptionName, item.outputText);
      }
      toast.success('Download iniciado!', { id: toastId });
    } catch (err) {
      toast.error('Não foi possível baixar o arquivo.', { id: toastId });
    }
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableRow}>
            <th className={styles.tableHeaderCell}>Transcrição Original</th>
            <th className={styles.tableHeaderCell}>Agente Usado</th>
            <th className={styles.tableHeaderCell}>Formato</th>
            <th className={styles.tableHeaderCell}>Data</th>
            <th className={styles.tableHeaderCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id} className={styles.tableRow}>
              <td className={`${styles.tableBodyCell} ${styles.secondaryInfo}`}>{item.transcriptionName}</td>
              <td className={styles.tableBodyCell}>{item.agentName}</td>
              <td className={styles.tableBodyCell}>
                <span className={`${styles.formatTag} ${styles[item.format]}`}>{item.format.toUpperCase()}</span>
              </td>
              <td className={styles.tableBodyCell}>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
              <td className={`${styles.tableBodyCell} ${styles.actionsCell}`}>
                <ActionMenu>
                  <button onClick={() => handleDownload(item)} className={styles.menuItem}><FiDownload /> Baixar</button>
                  <Link href={`/dashboard/transcricoes/${item.transcriptionId}`} className={styles.menuItem}>
                    <FiEye /> Ver Original
                  </Link>
                </ActionMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}