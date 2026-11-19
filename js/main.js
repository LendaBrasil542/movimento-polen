/**
 * Ponto de entrada principal (Orquestrador) da aplicação Movimento Pólen.
 * Carrega os dados oficiais, gerencia o acervo Síntese Pólen e envia
 * os contatos do formulário diretamente para uma planilha do Google Sheets.
 */

import { carregarDados } from './services/dataService.js';
import { filtrarDocumentos } from './utils/filterUtils.js';
import { renderizarEstatisticas } from './components/statsRenderer.js';
import { renderizarLinhaDoTempo } from './components/timelineRenderer.js';
import { renderizarAcervo } from './components/archiveRenderer.js';
import { inicializarModalPdf, abrirModalPdf } from './components/pdfModal.js';

// COLE AQUI A URL DO SEU APP DA WEB GERADA NO GOOGLE APPS SCRIPT:
const GOOGLE_SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyI9Gi8m9WnMs8jxyFQdhlEsdRIGPu1jqvTYQt0hjT51GFn7zC_NXHmj2aVHacqu3-_MQ/exec';

// Estado local para filtragem do jornal Síntese Pólen
const estadoAcervo = {
  todosDocumentos: [],
  termoBusca: '',
  categoriaAtiva: 'Todos'
};

/**
 * Renderiza o Accordion interativo de Perguntas Frequentes (FAQ).
 * @param {Array<Object>} listaFaq Lista com as perguntas frequentes oficiais.
 */
function renderizarFaq(listaFaq = []) {
  const container = document.getElementById('faq-container');
  if (!container || !Array.isArray(listaFaq)) return;

  container.innerHTML = listaFaq
    .map((item, idx) => {
      const abertoPorPadrao = idx === 0;
      return `
        <div class="faq-item bg-white rounded-2xl border border-amber-900/10 shadow-xs overflow-hidden transition-all">
          <button
            type="button"
            aria-expanded="${abertoPorPadrao ? 'true' : 'false'}"
            class="faq-trigger w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-creme/60 transition-colors focus:outline-none"
          >
            <span class="font-serif font-bold text-base sm:text-lg text-grafite">
              ${item.pergunta}
            </span>
            <span class="w-8 h-8 rounded-full bg-creme-escuro text-terracota flex items-center justify-center shrink-0 transition-transform duration-200 ${abertoPorPadrao ? 'rotate-180' : ''}">
              <i data-lucide="chevron-down" class="w-4 h-4"></i>
            </span>
          </button>
          <div class="faq-content ${abertoPorPadrao ? '' : 'hidden'} px-6 pb-6 pt-1 text-sm sm:text-base text-grafite-suave leading-relaxed border-t border-slate-100">
            ${item.resposta}
          </div>
        </div>
      `;
    })
    .join('');

  const gatilhos = container.querySelectorAll('.faq-trigger');
  gatilhos.forEach((btn) => {
    btn.addEventListener('click', () => {
      const conteudo = btn.nextElementSibling;
      const iconeContainer = btn.querySelector('span:last-child');
      const estaAberto = btn.getAttribute('aria-expanded') === 'true';

      btn.setAttribute('aria-expanded', estaAberto ? 'false' : 'true');
      if (conteudo) {
        conteudo.classList.toggle('hidden', estaAberto);
      }
      if (iconeContainer) {
        iconeContainer.classList.toggle('rotate-180', !estaAberto);
      }
    });
  });

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Atualiza a listagem das edições da Síntese Pólen conforme busca e pasta selecionada.
 */
function atualizarListagemAcervo() {
  const documentosFiltrados = filtrarDocumentos(
    estadoAcervo.todosDocumentos,
    estadoAcervo.termoBusca,
    estadoAcervo.categoriaAtiva
  );

  renderizarAcervo(documentosFiltrados, 'archive-grid', abrirModalPdf);
}

/**
 * Conecta os eventos da barra de busca (#search-input) e das 3 pastas (#category-filters).
 */
function inicializarFiltrosAcervo() {
  const inputBusca = document.getElementById('search-input');
  const containerFiltros = document.getElementById('category-filters');

  if (inputBusca) {
    inputBusca.addEventListener('input', (event) => {
      estadoAcervo.termoBusca = event.target.value;
      atualizarListagemAcervo();
    });
  }

  if (containerFiltros) {
    const botoes = containerFiltros.querySelectorAll('.filter-btn');
    botoes.forEach((botao) => {
      botao.addEventListener('click', () => {
        const novaCategoria = botao.getAttribute('data-category') || 'Todos';
        estadoAcervo.categoriaAtiva = novaCategoria;

        botoes.forEach((b) => {
          b.classList.remove('active', 'bg-dourado', 'text-white', 'shadow-sm');
          b.classList.add('bg-creme', 'text-grafite-suave');
        });

        botao.classList.remove('bg-creme', 'text-grafite-suave');
        botao.classList.add('active', 'bg-dourado', 'text-white', 'shadow-sm');

        atualizarListagemAcervo();
      });
    });
  }
}

/**
 * Inicializa o menu responsivo mobile (hambúrguer).
 */
function inicializarMenuMobile() {
  const btnMobile = document.getElementById('mobile-menu-btn');
  const menuMobile = document.getElementById('mobile-menu');

  if (!btnMobile || !menuMobile) return;

  btnMobile.addEventListener('click', () => {
    const estaOculto = menuMobile.classList.contains('hidden');
    menuMobile.classList.toggle('hidden', !estaOculto);
    btnMobile.setAttribute('aria-expanded', estaOculto ? 'true' : 'false');
  });

  const linksMobile = menuMobile.querySelectorAll('.mobile-nav-link');
  linksMobile.forEach((link) => {
    link.addEventListener('click', () => {
      menuMobile.classList.add('hidden');
      btnMobile.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Envia os dados do formulário para a planilha do Google Sheets via Apps Script.
 * @param {Object} payload Dados preenchidos no formulário.
 */
async function enviarParaGoogleSheets(payload) {
  if (
    !GOOGLE_SHEETS_WEBAPP_URL ||
    GOOGLE_SHEETS_WEBAPP_URL === 'COLE_AQUI_SUA_URL_DO_GOOGLE_APPS_SCRIPT'
  ) {
    throw new Error('URL_NAO_CONFIGURADA');
  }

  // O mode: 'no-cors' com text/plain evita bloqueio de preflight CORS do Google Apps Script
  await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });
}

/**
 * Inicializa os dois botões de intenção ("Quero conhecer o Movimento Pólen" e
 * "Quero participar de um retiro") e o envio real do formulário para o Google Sheets.
 */
function inicializarFormularioParticipacao() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('contact-feedback');
  const selectAssunto = document.getElementById('contact-subject');
  const submitBtn = document.getElementById('contact-submit-btn');
  const botoesIntencao = document.querySelectorAll('.intent-btn');

  // Sincroniza os dois cards clicáveis com o seletor do formulário
  botoesIntencao.forEach((btn) => {
    btn.addEventListener('click', () => {
      const intencao = btn.getAttribute('data-intent');
      if (selectAssunto && intencao) {
        selectAssunto.value = intencao;
      }

      botoesIntencao.forEach((b) => {
        b.classList.remove('active', 'border-dourado', 'bg-dourado-claro/40');
        b.classList.add('border-amber-900/10', 'bg-creme');
      });

      btn.classList.remove('border-amber-900/10', 'bg-creme');
      btn.classList.add('active', 'border-dourado', 'bg-dourado-claro/40');
    });
  });

  if (selectAssunto) {
    selectAssunto.addEventListener('change', () => {
      const valorAtual = selectAssunto.value;
      botoesIntencao.forEach((b) => {
        const corresponde = b.getAttribute('data-intent') === valorAtual;
        b.classList.toggle('border-dourado', corresponde);
        b.classList.toggle('bg-dourado-claro/40', corresponde);
        b.classList.toggle('border-amber-900/10', !corresponde);
        b.classList.toggle('bg-creme', !corresponde);
      });
    });
  }

  if (!form || !feedback) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = document.getElementById('contact-name')?.value.trim() || '';
    const email = document.getElementById('contact-email')?.value.trim() || '';
    const telefone = document.getElementById('contact-phone')?.value.trim() || '';
    const assunto = document.getElementById('contact-subject')?.value.trim() || '';
    const mensagem = document.getElementById('contact-message')?.value.trim() || '';

    if (!nome || !email || !assunto || !mensagem) {
      feedback.className =
        'rounded-2xl p-4 text-sm font-medium bg-red-50 text-red-800 border border-red-200 block';
      feedback.textContent =
        'Por favor, preencha todos os campos obrigatórios (*) antes de enviar.';
      return;
    }

    const textoOriginalBotao = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Enviando...</span>';
    }

    try {
      await enviarParaGoogleSheets({
        nome,
        email,
        telefone,
        assunto,
        mensagem
      });

      feedback.className =
        'rounded-2xl p-4 text-sm font-medium bg-amber-50 text-terracota border border-dourado/40 block';
      feedback.innerHTML = `
        <strong>Seja muito bem-vindo(a), ${nome}!</strong> Seus dados sobre <em>"${assunto}"</em> foram enviados para a planilha da Equipe de Acolhida do Movimento Pólen. Em breve entraremos em contato pelo e-mail <strong>${email}</strong>${telefone ? ` ou WhatsApp <strong>${telefone}</strong>` : ''}.
      `;

      form.reset();
    } catch (erro) {
      if (erro.message === 'URL_NAO_CONFIGURADA') {
        feedback.className =
          'rounded-2xl p-4 text-sm font-medium bg-amber-50 text-terracota border border-amber-300 block';
        feedback.innerHTML =
          '<strong>Atenção (Configuração Pendente):</strong> Cole a URL do Google Apps Script na variável <code>GOOGLE_SHEETS_WEBAPP_URL</code> dentro de <code>js/main.js</code> para salvar os envios na planilha.';
      } else {
        feedback.className =
          'rounded-2xl p-4 text-sm font-medium bg-red-50 text-red-800 border border-red-200 block';
        feedback.textContent =
          'Ocorreu uma instabilidade ao enviar seus dados. Por favor, verifique sua conexão e tente novamente.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = textoOriginalBotao;
      }
    }
  });
}

/**
 * Inicialização geral no carregamento do DOM.
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  inicializarMenuMobile();
  inicializarModalPdf();
  inicializarFiltrosAcervo();
  inicializarFormularioParticipacao();

  try {
    const dados = await carregarDados();

    // 1. Destaques na Página Inicial
    renderizarEstatisticas(dados.estatisticas, 'stats-container');

    // 2. Galeria de Fotografias Históricas e Atuais (Seção Nossa História)
    const fotosHistoria = dados.galeria_historia || dados.linha_do_tempo || [];
    renderizarLinhaDoTempo(fotosHistoria, 'timeline-container');

    // 3. Acervo Histórico — Edições do jornal Síntese Pólen
    estadoAcervo.todosDocumentos = Array.isArray(dados.acervo) ? dados.acervo : [];
    atualizarListagemAcervo();

    // 4. Perguntas Frequentes (FAQ)
    renderizarFaq(dados.faq);
  } catch (erro) {
    const archiveGrid = document.getElementById('archive-grid');
    if (archiveGrid) {
      archiveGrid.innerHTML = `
        <div class="col-span-full bg-red-50 text-red-900 rounded-2xl p-6 border border-red-200 text-center">
          <p class="font-bold">Não foi possível carregar a base de dados local (data/data.json).</p>
          <p class="text-sm mt-1">Abra o projeto usando a extensão <strong>Live Server</strong> do VS Code ou <code>python -m http.server 5500</code>.</p>
        </div>
      `;
    }
  }
});