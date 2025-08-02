// src/app/admin/assistentes/page.js

'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css'; // Renomeie o CSS também
import { toast } from 'react-hot-toast';
import Modal from '@/componentsUser/Modal/Modal';
import AssistantForm from '@/componentsAdmin/AssistantForm/AssistantForm'; // <<< Usará um novo formulário de admin
import ActionMenu from '@/componentsUser/ActionMenu/ActionMenu';
import { FiPlusCircle, FiCpu, FiEdit, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import api from '@/lib/api';

export default function AdminAssistantsPage() {
  const [assistants, setAssistants] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [assistantsRes, plansRes] = await Promise.all([
          api.get('/admin/assistants/system'),
          api.get('/admin/plans'),
        ]);
        setAssistants(assistantsRes.data);
        setAvailablePlans(plansRes.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Erro ao carregar dados.';
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const openCreateModal = () => {
    setEditingAssistant(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (assistant) => {
    setEditingAssistant(assistant);
    setIsModalOpen(true);
  };

  const handleDelete = async (assistantId) => {
    if (window.confirm("Tem certeza que deseja excluir este assistente?")) {
      const toastId = toast.loading('Excluindo...');
      try {
        await api.delete(`/admin/assistants/system/${assistantId}`);
        setAssistants(prev => prev.filter(a => a.id !== assistantId));
        toast.success("Assistente excluído.", { id: toastId });
      } catch (err) {
        toast.error(err.response?.data?.message || "Erro ao excluir.", { id: toastId });
      }
    }
  };
  
  const handleSave = async (assistantData) => {
    const isEditing = !!editingAssistant;
    const toastId = toast.loading(isEditing ? 'Salvando...' : 'Criando...');
    try {
      if (isEditing) {
        const response = await api.put(`/admin/assistants/system/${editingAssistant.id}`, assistantData);
        setAssistants(assistants.map(a => a.id === editingAssistant.id ? response.data : a));
        toast.success("Assistente atualizado!", { id: toastId });
      } else {
        const response = await api.post('/admin/assistants/system', assistantData);
        setAssistants([...assistants, response.data]);
        toast.success("Assistente criado!", { id: toastId });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Ocorreu um erro.", { id: toastId });
    }
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Gerenciar Assistentes</h1>
          <p>Administre os assistentes do sistema disponíveis para os usuários.</p>
        </div>
        <button onClick={openCreateModal} className={styles.ctaButton}><FiPlusCircle /> Criar Assistente</button>
      </header>
      {/* Tabela de assistentes do sistema aqui */}
    </div>
  );
}