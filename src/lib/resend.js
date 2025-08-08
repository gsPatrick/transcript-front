// src/lib/resend.js
const { Resend } = require('resend');
const settings = require('../config/settings'); // Para buscar a chave se estiver no DB

let resendInstance = null;

const getResendInstance = () => {
  if (resendInstance) {
    return resendInstance;
  }

  // Tenta obter a chave de API do Resend das configurações (DB ou .env)
  const apiKey = settings.get('RESEND_API_KEY'); 

  if (!apiKey) {
    console.warn('AVISO: RESEND_API_KEY não configurada no DB ou .env. O serviço de envio de e-mails estará desativado.');
    return null; // Retorna null se não houver chave
  }

  resendInstance = new Resend(apiKey);
  console.log('✅ [Resend] SDK configurado com sucesso.');
  return resendInstance;
};

// Exporta a instância configurada para ser usada em outros serviços
module.exports = getResendInstance();