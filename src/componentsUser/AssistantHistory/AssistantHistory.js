// src/componentsUser/AssistantHistory/AssistantHistory.js

import styles from './AssistantHistory.module.css';
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import { FiDownload, FiEye, FiMail } from 'react-icons/fi'; // Adicionado FiMail
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { useState } from 'react'; // Adicionado useState
import Modal from '@/componentsUser/Modal/Modal'; // Adicionado Modal

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

export default function AssistantHistory({ history }) {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailFormat, setEmailFormat] = useState('text'); // Padrão para envio de email

  // Função para download de TXT/PDF de um item de histórico
  const handleDownloadOutput = async (item, format) => {
    const toastId = toast.loading(`Preparando download de ${format.toUpperCase()}...`);
    try {
      if (format === 'text') {
        // Para TXT, o outputText pode já estar presente ou precisamos buscar
        if (item.outputText) {
          downloadTxtFile(`${item.transcriptionName}-${item.assistantName}`, item.outputText);
        } else {
          // Fallback: busca os detalhes do histórico se o texto não estiver presente
          const response = await api.get(`/assistants/my-history/${item.id}`);
          downloadTxtFile(`${response.data.transcription.originalFileName}-${response.data.assistant.name}`, response.data.outputText);
        }
      } else if (format === 'pdf') {
        // Para PDF, chamamos o endpoint de download que gera o PDF on-demand
        const response = await api.get(`/assistants/my-history/${item.id}/download-format?format=pdf`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${item.transcriptionName}-${item.assistantName}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      toast.success('Download iniciado!', { id: toastId });
    } catch (err) {
      console.error("Erro ao baixar arquivo:", err);
      toast.error('Não foi possível baixar o arquivo.', { id: toastId });
    }
  };

  // Função para abrir o modal de envio de email
  const handleOpenEmailModal = (item) => {
    setSelectedHistoryItem(item);
    setEmailRecipient(''); // Limpa o campo de email a cada abertura
    setEmailFormat('text'); // Define formato padrão para email
    setIsEmailModalOpen(true);
  };

  // Função para enviar email
  const handleSendEmail = async () => {
    if (!selectedHistoryItem || !emailRecipient) {
      toast.error("Por favor, preencha o email do destinatário.");
      return;
    }
    const toastId = toast.loading(`Enviando email (${emailFormat.toUpperCase()})...`);
    try {
      await api.post(`/assistants/my-history/${selectedHistoryItem.id}/send-email`, {
        recipientEmail: emailRecipient,
        format: emailFormat,
      });
      toast.success('Email enviado com sucesso!', { id: toastId });
      setIsEmailModalOpen(false);
    } catch (err) {
      console.error("Erro ao enviar email:", err);
      toast.error(err.response?.data?.message || 'Não foi possível enviar o email.', { id: toastId });
    }
  };


  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tableRow}>
            <th className={styles.tableHeaderCell}>Transcrição Original</th>
            <th className={styles.tableHeaderCell}>Assistente Usado</th>
            <th className={styles.tableHeaderCell}>Formato</th>
            <th className={styles.tableHeaderCell}>Data</th>
            <th className={styles.tableHeaderCell}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id} className={styles.tableRow}>
              <td className={`${styles.tableBodyCell} ${styles.secondaryInfo}`}>{item.transcriptionName}</td>
              <td className={styles.tableBodyCell}>{item.assistantName}</td>
              <td className={styles.tableBodyCell}>
                {/* A tag de formato aqui reflete o formato ORIGINAL gerado, 
                    mas as ações agora permitem baixar em outros formatos. */}
                <span className={`${styles.formatTag} ${styles[item.format]}`}>{item.format.toUpperCase()}</span>
              </td>
              <td className={styles.tableBodyCell}>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
              <td className={`${styles.tableBodyCell} ${styles.actionsCell}`}>
                <ActionMenu>
                  <button 
                    onClick={() => handleDownloadOutput(item, 'text')} 
                    className={styles.menuItem}
                  >
                    <FiDownload /> Baixar TXT
                  </button>
                  <button 
                    onClick={() => handleDownloadOutput(item, 'pdf')} 
                    className={styles.menuItem}
                  >
                    <FiDownload /> Baixar PDF
                  </button>
                  <button 
                    onClick={() => handleOpenEmailModal(item)} 
                    className={styles.menuItem}
                  >
                    <FiMail /> Enviar por Email
                  </button>
                  <Link href={`/dashboard/transcricoes/${item.transcriptionId}`} className={styles.menuItem}>
                    <FiEye /> Ver Original
                  </Link>
                </ActionMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isEmailModalOpen && (
        <Modal 
          isOpen={isEmailModalOpen} 
          onClose={() => setIsEmailModalOpen(false)} 
          title="Enviar Conteúdo por Email"
        >
          <div className={styles.emailModalContent}>
            <p><strong>Assistente:</strong> {selectedHistoryItem?.assistantName}</p>
            <p><strong>Transcrição:</strong> {selectedHistoryItem?.transcriptionName}</p>
            
            <div className={styles.formGroup}>
              <label htmlFor="emailRecipient">Email do Destinatário:</label>
              <input 
                type="email" 
                id="emailRecipient"
                value={emailRecipient} 
                onChange={(e) => setEmailRecipient(e.target.value)} 
                placeholder="exemplo@dominio.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Formato do Anexo:</label>
              <div className={styles.radioGroup}>
                <label>
                  <input 
                    type="radio" 
                    name="emailFormat" 
                    value="text" 
                    checked={emailFormat === 'text'} 
                    onChange={() => setEmailFormat('text')} 
                  /> TXT
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="emailFormat" 
                    value="pdf" 
                    checked={emailFormat === 'pdf'} 
                    onChange={() => setEmailFormat('pdf')} 
                  /> PDF
                </label>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                type="button" 
                className={styles.cancelButton} 
                onClick={() => setIsEmailModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className={styles.saveButton} 
                onClick={handleSendEmail}
              >
                Enviar Email
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}