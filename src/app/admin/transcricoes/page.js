// src/app/admin/transcricoes/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import styles from './page.module.css';
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import { FiSearch, FiEdit, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

// Hook useDebounce para otimizar a busca
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminTranscriptionsPage() {
    const [transcriptions, setTranscriptions] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchTranscriptions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: pagination.currentPage, limit: 10,
                searchTerm: debouncedSearchTerm,
            });
            const response = await api.get(`/admin/transcriptions?${params.toString()}`);
            setTranscriptions(response.data.transcriptions);
            setPagination({ currentPage: response.data.currentPage, totalPages: response.data.totalPages });
        } catch (err) {
            const msg = err.response?.data?.message || 'Erro ao buscar transcrições.';
            setError(msg); toast.error(msg);
        } finally { setIsLoading(false); }
    }, [pagination.currentPage, debouncedSearchTerm]);

    useEffect(() => { fetchTranscriptions(); }, [fetchTranscriptions]);

    const handleRename = async (item) => {
        const newTitle = prompt("Digite o novo nome para a transcrição:", item.title);
        if (newTitle && newTitle.trim() !== '' && newTitle !== item.title) {
            const toastId = toast.loading('Renomeando...');
            try {
                await api.put(`/admin/transcriptions/${item.id}`, { title: newTitle });
                toast.success('Transcrição renomeada!', { id: toastId });
                fetchTranscriptions();
            } catch (err) {
                toast.error('Não foi possível renomear.', { id: toastId });
            }
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Tem certeza que deseja excluir a transcrição "${item.title}" do usuário ${item.user.email}? Esta ação é irreversível.`)) {
            const toastId = toast.loading('Excluindo...');
            try {
                await api.delete(`/admin/transcriptions/${item.id}`);
                toast.success('Transcrição excluída!', { id: toastId });
                fetchTranscriptions();
            } catch (err) {
                toast.error('Não foi possível excluir.', { id: toastId });
            }
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Gerenciar Transcrições</h1>
                <p>Visualize, edite e remova todas as transcrições da plataforma.</p>
            </header>
            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <FiSearch />
                    <input type="text" placeholder="Buscar por título, arquivo, nome ou e-mail do usuário..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                                <th>Título</th>
                                <th>Arquivo Original</th>
                                <th>Data</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transcriptions.length > 0 ? transcriptions.map(item => (
                                <tr key={item.id}>
                                    <td className={styles.userCell}>
                                        <div className={styles.avatar}>{item.user?.name ? item.user.name.charAt(0).toUpperCase() : '?'}</div>
                                        <div>
                                            <div className={styles.userName}>{item.user?.name || 'Usuário Removido'}</div>
                                            <div className={styles.userEmail}>{item.user?.email}</div>
                                        </div>
                                    </td>
                                    <td>{item.title}</td>
                                    <td className={styles.filenameCell}>{item.originalFileName}</td>
                                    <td>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <span className={`${styles.statusTag} ${styles[item.status.toLowerCase()]}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <ActionMenu>
                                            <button onClick={() => handleRename(item)} className={styles.menuItem}><FiEdit/> Renomear</button>
                                            <button onClick={() => handleDelete(item)} className={`${styles.menuItem} ${styles.deleteMenuItem}`}><FiTrash2/> Excluir</button>
                                        </ActionMenu>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className={styles.noResults}>
                                        Nenhuma transcrição encontrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {/* Componente de Paginação pode ser adicionado aqui, se necessário */}
        </div>
    );
}

const TableSkeleton = () => (
    <div className={styles.tableWrapper}>
        <table className={styles.table}>
            <thead>
                <tr>
                    {[...Array(6)].map((_, i) => <th key={i}><div className={`${styles.skeleton} ${styles.skeletonHeader}`}></div></th>)}
                </tr>
            </thead>
            <tbody>
                {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                        {[...Array(6)].map((_, j) => <td key={j}><div className={`${styles.skeleton} ${styles.skeletonCell}`}></div></td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);