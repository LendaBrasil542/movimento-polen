/**
 * Componente responsável por renderizar a Galeria de Fotografias Históricas e Atuais
 * na seção "Nossa História" (substituindo a antiga linha do tempo vertical),
 * com fallback visual caso a fotografia ainda não esteja na pasta assets/img/galeria/.
 */

/**
 * Renderiza os cards fotográficos da história do Movimento Pólen.
 * @param {Array<Object>} fotos Lista de registros fotográficos do data.json.
 * @param {string} containerId ID do container HTML (#timeline-container).
 */
export function renderizarLinhaDoTempo(fotos = [], containerId = 'timeline-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!Array.isArray(fotos) || fotos.length === 0) {
    container.innerHTML = '';
    return;
  }

  const htmlGaleria = fotos
    .map((foto) => {
      return `
        <article class="gallery-card bg-white rounded-3xl overflow-hidden border border-amber-900/10 shadow-sm flex flex-col justify-between animate-card-enter">
          <!-- Moldura da Fotografia com Fallback Automático -->
          <div class="relative aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-100/70 overflow-hidden flex items-center justify-center border-b border-amber-900/10">
            <img
              src="./${foto.imagem}"
              alt="${foto.titulo}"
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onerror="this.style.display='none'; this.nextElementSibling.classList.remove('hidden'); this.nextElementSibling.classList.add('flex');"
            />
            <!-- Fallback Elegante enquanto o arquivo .jpg não for adicionado à pasta -->
            <div class="hidden flex-col items-center justify-center text-center p-5 text-terracota">
              <div class="w-11 h-11 rounded-2xl bg-white/85 border border-dourado/30 flex items-center justify-center mb-2.5 shadow-xs">
                <i data-lucide="camera" class="w-5 h-5 text-dourado"></i>
              </div>
              <span class="font-serif font-bold text-sm text-grafite">${foto.epoca}</span>
              <span class="text-[11px] text-grafite-suave mt-1 break-all">
                Adicione em: <code class="bg-white/80 px-1.5 py-0.5 rounded text-terracota">${foto.imagem}</code>
              </span>
            </div>
          </div>

          <!-- Legenda Editorial -->
          <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            <div>
              <span class="inline-block px-3 py-1 rounded-full bg-dourado-claro text-terracota font-bold text-xs mb-2.5">
                ${foto.epoca}
              </span>
              <h4 class="font-serif font-bold text-lg text-grafite leading-snug">
                ${foto.titulo}
              </h4>
              <p class="text-xs sm:text-sm text-grafite-suave mt-2 leading-relaxed">
                ${foto.descricao}
              </p>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  container.innerHTML = htmlGaleria;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}