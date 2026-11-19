/**
 * Funções utilitárias puras para normalização textual e filtragem
 * combinada (termo de busca + pasta selecionada) das edições da Síntese Pólen.
 */

/**
 * Remove acentos/diacríticos e converte a string para minúsculas.
 * @param {string} texto
 * @returns {string}
 */
export function normalizarTexto(texto = '') {
  return String(texto)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Filtra a lista de edições da Síntese Pólen por termo de busca (título, resumo ou ano)
 * e pela pasta selecionada ("Todos", "Sínteses antigas", "Sínteses 2026", "Sínteses 2027").
 *
 * @param {Array<Object>} documentos Lista completa de edições do jornal Síntese Pólen.
 * @param {string} termoBusca Texto digitado pelo usuário na barra de pesquisa.
 * @param {string} categoriaAtiva Pasta selecionada ("Todos" ou pasta específica).
 * @returns {Array<Object>} Lista de edições filtradas.
 */
export function filtrarDocumentos(documentos = [], termoBusca = '', categoriaAtiva = 'Todos') {
  if (!Array.isArray(documentos)) {
    return [];
  }

  const termoNormalizado = normalizarTexto(termoBusca);
  const categoriaNormalizada = normalizarTexto(categoriaAtiva);

  return documentos.filter((doc) => {
    const correspondeCategoria =
      categoriaNormalizada === 'todos' ||
      normalizarTexto(doc.categoria) === categoriaNormalizada;

    if (!correspondeCategoria) {
      return false;
    }

    if (!termoNormalizado) {
      return true;
    }

    const tituloNorm = normalizarTexto(doc.titulo);
    const resumoNorm = normalizarTexto(doc.resumo);
    const anoNorm = normalizarTexto(String(doc.ano || ''));
    const categoriaDocNorm = normalizarTexto(doc.categoria);

    return (
      tituloNorm.includes(termoNormalizado) ||
      resumoNorm.includes(termoNormalizado) ||
      anoNorm.includes(termoNormalizado) ||
      categoriaDocNorm.includes(termoNormalizado)
    );
  });
}