// src/componentsUser/AssistantForm/KnowledgeTab.js
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import styles from './AssistantForm.module.css';
import { FiFile, FiTrash2, FiLoader, FiX, FiInfo } from 'react-icons/fi';

// Configura o caminho para o worker do pdf.js para renderização de PDF no cliente
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;


export default function KnowledgeTab({ formData, setFormData }) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Manipulador para adicionar novos arquivos para upload
  const onDrop = useCallback((acceptedFiles) => {
    // Adiciona os novos arquivos ao formData, que serão enviados como 'files'
    setFormData(prev => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        files: [...(prev.knowledgeBase.files || []), ...acceptedFiles],
      }
    }));
    toast.success(`${acceptedFiles.length} arquivo(s) pronto(s) para upload.`);
  }, [setFormData]);

  // Manipulador para remover um arquivo que foi recém-adicionado (ainda não salvo)
  const removeNewFile = (fileIndex) => {
    setFormData(prev => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        files: prev.knowledgeBase.files.filter((_, i) => i !== fileIndex),
      }
    }));
  };
  
  // Manipulador para marcar/desmarcar um arquivo existente para deleção
  const toggleExistingFileForDeletion = (fileId) => {
    const currentIdsToDelete = formData.knowledgeBase.fileIdsToDelete || [];
    const isMarked = currentIdsToDelete.includes(fileId);

    setFormData(prev => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        fileIdsToDelete: isMarked 
          ? currentIdsToDelete.filter(id => id !== fileId)
          : [...currentIdsToDelete, fileId],
      }
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'], 
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
    },
    disabled: isProcessing
  });

  const existingFiles = formData.knowledgeBase?.openaiFileIds || [];
  const filesToUpload = formData.knowledgeBase?.files || [];
  const fileIdsToDelete = formData.knowledgeBase?.fileIdsToDelete || [];

  return (
    <div className={styles.tabContent}>
      <div className={styles.infoBox}>
        <FiInfo />
        <span>Forneça arquivos (PDF, DOCX, TXT, Imagens) para que o assistente os utilize como base de conhecimento. Ele poderá buscar informações nesses documentos para responder às perguntas.</span>
      </div>

      <div {...getRootProps({ className: `${styles.dropzone} ${isDragActive ? styles.active : ''}` })}>
        <input {...getInputProps()} />
        {isProcessing ? (
          <><FiLoader className={styles.spinner} /><p>Processando...</p></>
        ) : (
          <p>Arraste e solte os arquivos aqui, ou clique para selecionar</p>
        )}
      </div>

      {(existingFiles.length > 0 || filesToUpload.length > 0) && (
        <div className={styles.fileList}>
          <h4>Arquivos da Base de Conhecimento</h4>
          {/* Lista de arquivos já existentes no assistente */}
          {existingFiles.map(fileId => {
            const isMarked = fileIdsToDelete.includes(fileId);
            return (
              <div key={fileId} className={`${styles.fileItem} ${isMarked ? styles.markedForDeletion : ''}`}>
                <FiFile />
                <span>Arquivo existente (ID: ...{fileId.slice(-8)})</span>
                <button onClick={() => toggleExistingFileForDeletion(fileId)} title={isMarked ? "Cancelar exclusão" : "Marcar para excluir"}>
                  {isMarked ? <FiX /> : <FiTrash2 />}
                </button>
              </div>
            );
          })}
          {/* Lista de novos arquivos aguardando para serem salvos */}
          {filesToUpload.map((file, index) => (
            <div key={file.name + index} className={styles.fileItem}>
              <FiFile />
              <span>{file.name} (Novo)</span>
              <button onClick={() => removeNewFile(index)} title="Remover este arquivo da lista de upload">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}