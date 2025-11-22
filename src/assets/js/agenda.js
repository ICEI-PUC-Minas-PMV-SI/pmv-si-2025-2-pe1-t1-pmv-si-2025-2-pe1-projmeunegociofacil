/*document.addEventListener('DOMContentLoaded', function () {
  const agendaDiaria = document.getElementById('agendaDiaria');
  const scrollContainer = document.querySelector('.table-responsive-agenda-diaria');
  const targetRow = document.getElementById('initial-hour');

  agendaDiaria.addEventListener('shown.bs.collapse', function () {
    if (scrollContainer && targetRow) {
      scrollContainer.scrollTop = targetRow.offsetTop;
    }
  });
});

const gridCalendario = document.getElementById('calendario-grid');
        const cabecalhoMesAno = document.getElementById('mes-ano');
        const btnAnterior = document.getElementById('btn-ant');
        const btnProximo = document.getElementById('btn-prox');

        let mesEmExibicao = new Date();
        let compromissos = {};

        function renderizarCalendario() {
          gridCalendario.innerHTML = '';
          
          const ano = mesEmExibicao.getFullYear();
          const mes = mesEmExibicao.getMonth();

          cabecalhoMesAno.textContent = `${mesEmExibicao.toLocaleString('pt-br', { month: 'long' })} de ${ano}`;
          
          const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
          const numDiasNoMes = new Date(ano, mes + 1, 0).getDate();

          let diaAtual = 1;

          for (let i = 0; i < 35; i++) {
                const celula = document.createElement('div');
                celula.className = 'border rounded-lg p-2 h-36 flex flex-col';

                let numeroDia = null;
                let chaveCompromisso = '';

                if (i >= primeiroDiaSemana && diaAtual <= numDiasNoMes) {
                    numeroDia = diaAtual;
                    
                    const diaFormatado = String(numeroDia).padStart(2, '0');
                    const mesFormatado = String(mes + 1).padStart(2, '0');
                    chaveCompromisso = `${ano}-${mesFormatado}-${diaFormatado}`;

                    celula.classList.add('bg-white');
                    
                    const spanDia = document.createElement('span');
                    spanDia.className = 'font-semibold text-gray-900';
                    spanDia.textContent = numeroDia;
                    
                    const caixinhaCompromisso = document.createElement('textarea');
                    caixinhaCompromisso.className = 'w-full flex-grow mt-1 p-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-400';
                    caixinhaCompromisso.placeholder = 'Compromisso...';
                    caixinhaCompromisso.dataset.chave = chaveCompromisso;
                    
                    if (compromissos[chaveCompromisso]) {
                        caixinhaCompromisso.value = compromissos[chaveCompromisso];
                    }

                    caixinhaCompromisso.addEventListener('input', (e) => {
                        compromissos[e.target.dataset.chave] = e.target.value;
                    });

                    celula.appendChild(spanDia);
                    celula.appendChild(caixinhaCompromisso);
                    
                    diaAtual++;
                } else {
                    celula.classList.add('bg-gray-50', 'opacity-50');
                }

                gridCalendario.appendChild(celula);
            }
        }

        btnAnterior.addEventListener('click', () => {
            mesEmExibicao.setMonth(mesEmExibicao.getMonth() - 1);
            renderizarCalendario();
        });

        btnProximo.addEventListener('click', () => {
            mesEmExibicao.setMonth(mesEmExibicao.getMonth() + 1);
            renderizarCalendario();
        });

        renderizarCalendario();*/

        import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js";

const usuarioCorrente = loggedUser();
if (!usuarioCorrente) window.location.href = LOGIN_URL;

const KEY_AGENDA = 'agenda_compromissos';

function getCompromissos() {
    return JSON.parse(localStorage.getItem(KEY_AGENDA)) || [];
}

function saveCompromissos(data) {
    localStorage.setItem(KEY_AGENDA, JSON.stringify(data));
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa botões do cabeçalho
    document.getElementById('btn-ant').addEventListener('click', () => navegarMes(-1));
    document.getElementById('btn-prox').addEventListener('click', () => navegarMes(1));
    
    renderizarCalendario();
});

let mesEmExibicao = new Date();

function navegarMes(direcao) {
    mesEmExibicao.setMonth(mesEmExibicao.getMonth() + direcao);
    renderizarCalendario();
}

function renderizarCalendario() {
    const grid = document.getElementById('calendario-grid');
    const labelMes = document.getElementById('mes-ano');
    grid.innerHTML = '';

    const ano = mesEmExibicao.getFullYear();
    const mes = mesEmExibicao.getMonth();
    
    labelMes.textContent = mesEmExibicao.toLocaleString('pt-br', { month: 'long', year: 'numeric' });

    // Carrega dados do LocalStorage filtrados pelo usuário
    const todosCompromissos = getCompromissos();
    const meusCompromissos = todosCompromissos.filter(c => c.usuarioId === usuarioCorrente.id);

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const numDiasNoMes = new Date(ano, mes + 1, 0).getDate();

    let diaAtual = 1;
    const totalCelulas = 42; // 6 linhas x 7 colunas

    for (let i = 0; i < totalCelulas; i++) {
        const celula = document.createElement('div');
        celula.className = 'border rounded sm:rounded-lg p-1 sm:p-2 flex flex-col h-24 sm:h-36 bg-white relative';

        if (i >= primeiroDiaSemana && diaAtual <= numDiasNoMes) {
            const numeroDia = diaAtual;
            const dataIso = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(numeroDia).padStart(2, '0')}`;
            
            // Busca compromisso para esta data
            const compromissoDoDia = meusCompromissos.find(c => c.data_hora.startsWith(dataIso));
            const textoCompromisso = compromissoDoDia ? compromissoDoDia.titulo : '';

            // Renderiza dia
            const spanDia = document.createElement('span');
            spanDia.className = 'font-semibold text-gray-900 text-xs sm:text-base mb-1';
            spanDia.textContent = numeroDia;
            celula.appendChild(spanDia);

            // Input de texto
            const textarea = document.createElement('textarea');
            textarea.className = 'w-full h-full p-1 text-[10px] sm:text-xs border rounded focus:outline-none bg-gray-50 resize-none';
            textarea.value = textoCompromisso;
            if(textoCompromisso) textarea.classList.add('bg-blue-50');

            // Evento de Salvar (Debounce simples ou onchange)
            textarea.addEventListener('change', (e) => {
                salvarCompromisso(dataIso, e.target.value);
            });

            celula.appendChild(textarea);
            diaAtual++;
        } else {
            celula.classList.add('bg-gray-100', 'opacity-60');
        }
        grid.appendChild(celula);
    }
}

function salvarCompromisso(dataIso, texto) {
    let db = getCompromissos();
    // Remove registro existente dessa data para este usuário
    db = db.filter(c => !(c.usuarioId === usuarioCorrente.id && c.data_hora.startsWith(dataIso)));

    if (texto.trim() !== '') {
        db.push({
            meuId: Date.now(), // ID simples baseado em timestamp
            usuarioId: usuarioCorrente.id,
            titulo: texto,
            data_hora: dataIso + 'T12:00:00Z', // Hora padrão
            vendaMeuId: null,
            clientes_fornecedoresId: null
        });
    }

    saveCompromissos(db);
    // Opcional: Feedback visual
}