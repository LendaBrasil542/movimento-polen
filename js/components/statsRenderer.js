/**
 * Componente responsável por renderizar os cards de destaque institucional
 * do Movimento Pólen na Página Inicial.
 */

/**
 * Renderiza os cards de estatísticas dentro do container informado.
 * @param {Array<Object>} estatisticas Array de objetos de estatísticas vindo do data.json.
 * @param {string} containerId ID do elemento HTML onde os cards serão injetados.
 */
export function renderizarEstatisticas(estatisticas = [], containerId = 'stats-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!Array.isArray(estatisticas) || estatisticas.length === 0) {
    container.innerHTML = '';
    return;
  }

  const htmlCards = estatisticas
    .map((item) => {
      const icone = item.icone || 'sparkles';
      return `
        <article class="bg-white/95 backdrop-blur-xs rounded-2xl p-6 border border-amber-900/10 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between animate-card-enter">
          <div>
            <div class="w-11 h-11 rounded-xl bg-dourado-claro text-dourado flex items-center justify-center mb-4">
              <i data-lucide="${icone}" class="w-5 h-5"></i>
            </div>
            <div class="font-serif font-bold text-2xl sm:text-3xl text-terracota tracking-tight">
              ${item.valor}
            </div>
            <h2 class="font-serif font-bold text-base text-grafite mt-1">
              ${item.titulo}
            </h2>
          </div>
          <p class="text-xs sm:text-sm text-grafite-suave mt-2.5 leading-relaxed">
            ${item.descricao}
          </p>
        </article>
      `;
    })
    .join('');

  container.innerHTML = htmlCards;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}