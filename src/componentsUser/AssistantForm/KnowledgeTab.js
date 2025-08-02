// src/componentsUser/AssistantForm/KnowledgeTab.js
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import styles from './AssistantForm.module.css';
import { FiFile, FiTrash2, FiLoader } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';

// Configuração para o worker do pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function KnowledgeTab({ formData, setFormData }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = async (acceptedFiles) => {
    setIsProcessing(true);
    const toastId = toast.loading('Processando arquivos...');
    
    const newFiles = await Promise.all(acceptedFiles.map(async file => {
      let content = '';
      try {
        if (file.type === 'application/pdf') {
          const reader = new FileReader();
          content = await new Promise((resolve, reject) => {
            reader.onload = async (event) => {
              try {
                const pdf = await pdfjsLib.getDocument(event.target.result).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                  const page = await pdf.getPage(i);
                  const textContent = await page.getTextContent();
                  text += textContent.items.map(item => item.str).join(' ');
                }
                resolve(text);
              } catch (e) { reject(e); }
            };
            reader.readAsArrayBuffer(file);
          });
        } else { // Assume TXT
          content = await file.text();
        }
        return { name: file.name, content };
      } catch (err) {
        console.error("Erro ao processar o arquivo:", file.name, err);
        toast.error(`Falha ao processar ${file.name}`);
        return null;
      }
    }));

    setFormData(prev => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        files: [...prev.knowledgeBase.files, ...newFiles.filter(Boolean)]
      }
    }));
    
    toast.success('Arquivos processados e adicionados!', { id: toastId });
    setIsProcessing(false);
  };

  const removeFile = (fileName) => {
    setFormData(prev => ({
      ...prev,
      knowledgeBase: {
        ...prev.knowledgeBase,
        files: prev.knowledgeBase.files.filter(f => f.name !== fileName)
      }
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
  });

  return (
    <div className={styles.tabContent}>
      <div {...getRootProps({ className: `${styles.dropzone} ${isDragActive ? styles.active : ''}` })}>
        <input {...getInputProps()} />
        {isProcessing ? (
          <>
            <FiLoader className={styles.spinner} />
            <p>Processando...</p>
          </>
        ) : (
          <p>Arraste e solte arquivos aqui, ou clique para selecionar (PDF, TXT)</p>
        )}
      </div>
      
      <div className={styles.fileList}>
        {formData.knowledgeBase.files.map((file, index) => (
          <div key={index} className={styles.fileItem}>
            <FiFile />
            <span>{file.name}</span>
            <button onClick={() => removeFile(file.name)}><FiTrash2 /></button>
          </div>
        ))}
      </div>
    </div>
  );
}