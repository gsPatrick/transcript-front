    // src/app/admin/conteudo-gerado/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import { FiSearch, FiDownload, FiAlertCircle, FiMail, FiEye } from 'react-icons/fi';
import api from '@/lib/api';

// Hook de Debounce
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
}

export default function AdminGeneratedContentPage() {
    const [history, setHistory] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ 
                page: pagination.currentPage, 
                limit: 10,
                searchTerm: debouncedSearchTerm 
            });
            const response = await api.get(`/admin/history?${params.toString()}`);
            setHistory(response.data.history);
            setPagination({ currentPage: response.data.currentPage, totalPages: response.data.totalPages });
        } catch (err) {
            const msg = err.response?.data?.message || 'Erro ao carregar o histórico.';
            setError(msg); toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    }, [pagination.currentPage, debouncedSearchTerm]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleAction = async (item, action) => {
        const toastId = toast.loading(`Processando ${action}...`);
        try {
            // Ações de download usam o mesmo endpoint do usuário, pois a permissão é validada pelo ID do histórico
            const response = await api.post(`/history/${item.id}/actions`, { action }, { responseType: 'blob' });
            const disposition = response.headers['content-disposition'];
            const filename = disposition?.split('filename=')[1]?.replaceAll('"', '') || `resultado_${item.id}.${action.split('_')[1]}`;
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success('Download iniciado!', { id: toastId });
        } catch (err) {
            toast.error('Não foi possível realizar a ação.', { id: toastId });
        }
    };
    
    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Todo o Conteúdo Gerado</h1>
                <p>Visualize o histórico de uso dos assistentes por todos os usuários.</p>
            </header>

            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <FiSearch />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou e-mail do usuário..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading && <TableSkeleton />}
            {!isLoading && error && <div className={styles.errorContainer}><FiAlertCircle size={32}/> {error}</div>}
            {!isLoading && !error && (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Assistente Usado</th>
                                <th>Transcrição Base</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? history.map(item => (
                                <tr key={item.id}>
                                    <td className={styles.userCell}>
                                        <div className={styles.avatar}>{item.user?.name.charAt(0).toUpperCase() || '?'}</div>
                                        <div>
                                            <div className={styles.userName}>{item.user?.name || 'Usuário Removido'}</div>
                                            <div className={styles.userEmail}>{item.user?.email}</div>
                                        </div>
                                    </td>
                                    <td>{item.assistant?.name || 'Assistente Removido'}</td>
                                    <td>{item.transcription?.originalFileName || 'N/A'}</td>
                                    <td>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <span className={`${styles.statusTag} ${styles[item.status.toLowerCase()]}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        {item.status === 'completed' && (
                                            <ActionMenu>
                                                <button onClick={() => handleAction(item, 'download_txt')} className={styles.menuItem}><FiDownload/> Baixar TXT</button>
                                                <button onClick={() => handleAction(item, 'download_pdf')} className={styles.menuItem}><FiDownload/> Baixar PDF</button>
                                            </ActionMenu>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className={styles.noResults}>Nenhum registro encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Adicionar Paginação aqui se necessário */}
        </div>
    );
}

const TableSkeleton = () => (
    <div className={styles.tableWrapper}>
        <table className={styles.table}>
            <thead><tr>{[...Array(6)].map((_, i) => <th key={i}><div className={`${styles.skeleton} ${styles.skeletonHeader}`}></div></th>)}</tr></thead>
            <tbody>{[...Array(5)].map((_, i) => <tr key={i}>{[...Array(6)].map((_, j) => <td key={j}><div className={`${styles.skeleton} ${styles.skeletonCell}`}></div></td>)}</tr>)}</tbody>
        </table>
    </div>
);