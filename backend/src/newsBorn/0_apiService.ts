
import axios from 'axios';

export async function fetchNewsFromApi() {
  try {
    const apiKey = process.env.CURRENTS_API_KEY; // Certifique-se de configurar essa chave no seu arquivo .env

    if (!apiKey) {
      console.error('ERRO: A variável de ambiente CURRENTS_API_KEY não foi configurada.');
      return [];
    }

    // Faz a chamada HTTP para a Currents News API buscando notícias recentes
    const response = await axios.get('https://api.currentsapi.services/v1/latest-news', {
      params: {
        language: 'pt', // Tenta buscar em português (se a API não achar, você pode remover ou trocar para 'en')
        apiKey: apiKey,
      },
    });

    // A Currents API retorna um objeto contendo um array 'news' com os artigos
    const articles = response.data.news || [];
    
    return articles;
  } catch (error: any) {
    console.error(' Erro ao conectar com a Currents API:', error.response?.data || error.message);
    return [];
  }
}