// Este arquivo simula a busca de dados de um banco de dados.
const featuresPool = [
  "Transcrição por IA", "Editor de texto online", "Suporte por e-mail", 
  "Agentes de IA (Resumo, SOAP)", "Exportação em PDF e DOCX", "Suporte prioritário",
  "Integração com prontuários (API)", "Gerente de conta dedicado", "Análise de sentimentos",
  "Dashboard de métricas", "Revisão por humanos (opcional)", "Armazenamento em nuvem seguro"
];

export function generateMockPlans(count = 20) {
  const plans = [];
  for (let i = 1; i <= count; i++) {
    // Seleciona um subconjunto aleatório de features
    const shuffledFeatures = featuresPool.sort(() => 0.5 - Math.random());
    const selectedFeatures = shuffledFeatures.slice(0, Math.floor(Math.random() * 4) + 4); // Pega de 4 a 7 features

    plans.push({
      id: i,
      name: `Plano Dinâmico ${i}`,
      price: (Math.floor(Math.random() * 20) + 5) * 10 - 1, // Gera preços como 49, 99, 149...
      description: `Solução ideal para equipes de médio e grande porte com volume #${i}.`,
      features: selectedFeatures,
    });
  }
  return plans;
}