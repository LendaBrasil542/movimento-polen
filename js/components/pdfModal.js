/**
 * Controlador do Modal de leitura e download das edições do jornal Síntese Pólen (#pdf-modal).
 */

let modalInitialized = false;

/**
 * Fecha o modal de PDF e limpa o src do iframe.
 */
export function fecharModalPdf() {
  const modal = document.getElementById('pdf-modal');
  const iframe = document.getElementById('pdf-modal-iframe');

  if (!modal) return;

  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.classList.remove('overflow-hidden');

  if (iframe) {
    iframe.setAttribute('src', 'about:blank');
  }
}

/**
 * Abre o modal de PDF populando os metadados da edição da Síntese Pólen.
 * @param {Object} documento Objeto da edição selecionada.
 */
export function abrirModalPdf(documento) {
  if (!documento) return;

  const modal = document.getElementById('pdf-modal');
  const tituloEl = document.getElementById('pdf-modal-title');
  const metaEl = document.getElementById('pdf-modal-meta');
  const iframeEl = document.getElementById('pdf-modal-iframe');
  const downloadBtn = document.getElementById('pdf-modal-download');

  if (!modal || !tituloEl || !iframeEl || !downloadBtn) return;

  const caminhoRelativo = `./${documento.caminho_pdf}`;

  tituloEl.textContent = documento.titulo || 'Síntese Pólen';
  if (metaEl) {
    metaEl.textContent = `${documento.categoria || 'Síntese Pólen'} • ${documento.ano || ''}`;
  }

  iframeEl.setAttribute('src', caminhoRelativo);
  downloadBtn.setAttribute('href', caminhoRelativo);

  const nomeArquivo = documento.caminho_pdf
    ? documento.caminho_pdf.split('/').pop()
    : 'sintese-polen.pdf';
  downloadBtn.setAttribute('download', nomeArquivo);

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('overflow-hidden');
}

/**
 * Inicializa os ouvintes de evento para fechar o modal (botão X, backdrop e tecla ESC).
 */
export function inicializarModalPdf() {
  if (modalInitialized) return;

  const modal = document.getElementById('pdf-modal');
  const closeBtn = document.getElementById('pdf-modal-close');
  const backdrop = document.getElementById('pdf-modal-backdrop');

  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', fecharModalPdf);
  }

  if (backdrop) {
    backdrop.addEventListener('click', fecharModalPdf);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      fecharModalPdf();
    }
  });

  modalInitialized = true;
}