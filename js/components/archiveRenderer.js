/**
 * Componente responsável por renderizar as edições do jornal Síntese Pólen
 * divididas nas 3 pastas ("Sínteses antigas", "Sínteses 2026" e "Sínteses 2027").
 */

const MENSAGEM_ACERVO_VAZIO =
  'Não encontramos nenhuma edição da Síntese Pólen com esses termos. Tente selecionar outra pasta acima ou utilizar outras palavras.';

/**
 * Retorna a configuração visual de badge e ícone conforme a pasta da Síntese Pólen.
 * @param {string} categoria
 * @returns {{ badgeClass: string, icone: string }}
 */
function obterEstiloPasta(categoria = '') {
  switch (categoria) {
    case 'Sínteses antigas':
      return {
        badgeClass: 'bg-amber-100 text-terracota border-amber-300/60',
        icone: 'folder-clock'
      };
    case 'Sínteses 2026':
      return {
        badgeClass: 'bg-orange-100 text-terracota border-orange-300/60',
        icone: 'folder'
      };
    case 'Sínteses 2027':
      return {
        badgeClass: 'bg-yellow-100 text-amber-900 border-yellow-300/70',
        icone: 'folder-plus'
      };
    default:
      return {
        badgeClass: 'bg-dourado-claro text-terracota border-dourado/30',
        icone: 'newspaper'
      };
  }
}

/**
 * Renderiza o grid de edições do jornal Síntese Pólen ou o estado vazio.
 * @param {Array<Object>} documentos Lista de edições filtradas.
 * @param {string} containerId ID do container HTML (#archive-grid).
 * @param {Function} onAbrirPdf Callback acionado ao clicar em "Ler Síntese".
 */
export function renderizarAcervo(documentos = [], containerId = 'archive-grid', onAbrirPdf = null) {
  const container = document.getElementById(containerId);
  const contadorEl = document.getElementById('archive-count');

  if (contadorEl) {
    contadorEl.textContent = Array.isArray(documentos) ? String(documentos.length) : '0';
  }

  if (!container) return;

  if (!Array.isArray(documentos) || documentos.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-white rounded-3xl p-10 sm:p-14 border border-amber-900/10 text-center max-w-2xl mx-auto my-4 shadow-xs animate-card-enter">
        <div class="w-14 h-14 rounded-2xl bg-dourado-claro text-dourado flex items-center justify-center mx-auto mb-5">
          <i data-lucide="search-x" class="w-7 h-7"></i>
        </div>
        <h3 class="font-serif font-bold text-xl text-grafite mb-2">
          Nenhuma edição encontrada
        </h3>
        <p class="text-grafite-suave text-base leading-relaxed">
          ${MENSAGEM_ACERVO_VAZIO}
        </p>
      </div>
    `;

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
    return;
  }

  const htmlCards = documentos
    .map((doc) => {
      const { badgeClass, icone } = obterEstiloPasta(doc.categoria);

      return `
        <article class="archive-card bg-white rounded-3xl p-6 sm:p-7 border border-amber-900/10 shadow-sm flex flex-col justify-between animate-card-enter">
          <div>
            <!-- Cabeçalho do Card: Pasta & Ano -->
            <div class="flex items-center justify-between gap-2 mb-4">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeClass}">
                <i data-lucide="${icone}" class="w-3.5 h-3.5"></i>
                <span>${doc.categoria}</span>
              </span>
              <span class="px-3 py-1 rounded-lg bg-creme-escuro text-grafite font-serif font-bold text-xs">
                ${doc.ano}
              </span>
            </div>

            <!-- Título da Edição -->
            <h3 class="font-serif font-bold text-xl text-grafite leading-snug">
              ${doc.titulo}
            </h3>

            <!-- Resumo -->
            <p class="text-sm text-grafite-suave mt-3 leading-relaxed">
              ${doc.resumo}
            </p>
          </div>

          <!-- Rodapé do Card: Botões de Ação -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              data-doc-id="${doc.id}"
              class="btn-ler-pdf flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dourado text-white text-sm font-semibold hover:bg-dourado-hover transition-all shadow-xs"
            >
              <i data-lucide="book-open" class="w-4 h-4"></i>
              <span>Ler Síntese</span>
            </button>

            <a
              href="./${doc.caminho_pdf}"
              download
              title="Baixar PDF da Síntese Pólen"
              aria-label="Baixar ${doc.titulo}"
              class="p-2.5 rounded-xl bg-creme text-grafite-suave hover:bg-creme-escuro hover:text-terracota transition-colors border border-amber-900/10"
            >
              <i data-lucide="download" class="w-4 h-4"></i>
            </a>
          </div>
        </article>
      `;
    })
    .join('');

  container.innerHTML = htmlCards;

  const botoesLer = container.querySelectorAll('.btn-ler-pdf');
  botoesLer.forEach((botao) => {
    botao.addEventListener('click', () => {
      const docId = botao.getAttribute('data-doc-id');
      const docSelecionado = documentos.find((d) => d.id === docId);
      if (docSelecionado && typeof onAbrirPdf === 'function') {
        onAbrirPdf(docSelecionado);
      }
    });
  });

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}