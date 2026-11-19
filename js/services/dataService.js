/**
 * Serviço responsável pelo carregamento assíncrono da base de dados JSON
 * oficial do Movimento Pólen (estatísticas, galeria histórica, Síntese Pólen e FAQ).
 */

const DATA_URL = './data/data.json';

/**
 * Faz o fetch do arquivo data.json e retorna o objeto parseado.
 * @returns {Promise<Object>} Dados estruturados do Movimento Pólen.
 */
export async function carregarDados() {
  try {
    const response = await fetch(DATA_URL, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha HTTP ao carregar dados: status ${response.status} (${response.statusText})`);
    }

    const dados = await response.json();
    return dados;
  } catch (erro) {
    console.error('[dataService] Erro ao buscar ./data/data.json:', erro);
    throw erro;
  }
}