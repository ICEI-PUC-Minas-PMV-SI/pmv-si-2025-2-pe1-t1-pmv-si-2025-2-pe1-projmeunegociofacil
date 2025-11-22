import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js";

// ==========================================
// 1. AUTENTICAÇÃO E CONFIGURAÇÕES
// ==========================================

const usuarioCorrente = loggedUser();
if (!usuarioCorrente) window.location.href = LOGIN_URL;

const KEY_AGENDA = 'agenda_compromissos';
let dataAtual = new Date(); // Começa com a data de hoje
let viewAtual = 'mensal';   // Padrão: visão mensal

// ==========================================
// 2. EXPOR FUNÇÕES PARA O HTML (Global)
// ==========================================
window.abrirModalNovoCompromisso = abrirModalNovoCompromisso;
window.salvarCompromisso = salvarCompromisso;
window.excluirCompromisso = excluirCompromisso;

// ==========================================
// 3. GERENCIAMENTO DO BANCO DE DADOS
// ==========================================

function getDB() {
    try {
        return JSON.parse(localStorage.getItem(KEY_AGENDA)) || [];
    } catch (e) {
        console.error("Erro ao ler agenda:", e);
        return [];
    }
}

function saveDB(data) {
    localStorage.setItem(KEY_AGENDA, JSON.stringify(data));
}

function gerarNovoId(db) {
    if (db.length === 0) return 1;
    const maxId = db.reduce((max, item) => (item.meuId > max ? item.meuId : max), 0);
    return maxId + 1;
}

// ==========================================
// 4. INICIALIZAÇÃO DA PÁGINA
// ==========================================

// CORREÇÃO: Removemos o 'DOMContentLoaded' pois o script carrega dinamicamente.
// Criamos uma função init() e a chamamos imediatamente no final do arquivo.
function initAgenda() {
    const btnAnt = document.getElementById('btn-ant');
    const btnProx = document.getElementById('btn-prox');
    const btnMensal = document.getElementById('btn-view-monthly');
    const btnDiario = document.getElementById('btn-view-daily');

    // Verificações de segurança para garantir que o HTML já existe
    if (btnAnt) btnAnt.onclick = () => navegar(-1);
    if (btnProx) btnProx.onclick = () => navegar(1);
    if (btnMensal) btnMensal.onclick = () => trocarVisao('mensal');
    if (btnDiario) btnDiario.onclick = () => trocarVisao('diaria');

    // RENDERIZA A AGENDA IMEDIATAMENTE
    renderizar();
}

// ==========================================
// 5. NAVEGAÇÃO E RENDERIZAÇÃO
// ==========================================

function navegar(direcao) {
    if (viewAtual === 'mensal') {
        dataAtual.setMonth(dataAtual.getMonth() + direcao);
    } else {
        dataAtual.setDate(dataAtual.getDate() + direcao);
    }
    renderizar();
}

function trocarVisao(visao) {
    viewAtual = visao;
    
    const containerMensal = document.getElementById('view-mensal');
    const containerDiaria = document.getElementById('view-diaria');
    const btnMensal = document.getElementById('btn-view-monthly');
    const btnDiario = document.getElementById('btn-view-daily');

    if (visao === 'mensal') {
        containerMensal.classList.remove('d-none');
        containerDiaria.classList.add('d-none');
        btnMensal.classList.add('active');
        btnDiario.classList.remove('active');
    } else {
        containerMensal.classList.add('d-none');
        containerDiaria.classList.remove('d-none');
        btnMensal.classList.remove('active');
        btnDiario.classList.add('active');
    }
    renderizar();
}

function renderizar() {
    const label = document.getElementById('mes-ano-label');
    // Proteção caso a função seja chamada antes do DOM estar pronto
    if (!label) return; 
    
    if (viewAtual === 'mensal') {
        label.textContent = dataAtual.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        renderizarGridMensal();
    } else {
        label.textContent = dataAtual.toLocaleString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        renderizarListaDiaria();
    }
}

// ==========================================
// 6. VISÃO MENSAL (GRID)
// ==========================================

function renderizarGridMensal() {
    const grid = document.getElementById('calendario-grid');
    if (!grid) return;
    
    grid.innerHTML = '';

    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay(); 
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    
    const db = getDB();
    const meusCompromissos = db.filter(c => c.usuarioId === usuarioCorrente.id);

    let diaContador = 1;

    for (let i = 0; i < 42; i++) {
        const celula = document.createElement('div');
        celula.className = 'calendar-cell'; 

        if (i >= primeiroDiaSemana && diaContador <= ultimoDiaMes) {
            const diaFormatado = String(diaContador).padStart(2, '0');
            const mesFormatado = String(mes + 1).padStart(2, '0');
            const dataIsoCelula = `${ano}-${mesFormatado}-${diaFormatado}`;
            
            const divDia = document.createElement('div');
            divDia.className = 'fw-bold mb-1';
            divDia.textContent = diaContador;
            celula.appendChild(divDia);

            const hoje = new Date();
            if (diaContador === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
                celula.classList.add('today');
            }

            // Filtro de eventos
            const eventosDoDia = meusCompromissos.filter(c => c.data_hora.startsWith(dataIsoCelula));
            
            eventosDoDia.sort((a, b) => a.data_hora.localeCompare(b.data_hora));

            eventosDoDia.forEach(evento => {
                const hora = evento.data_hora.split('T')[1]?.substring(0, 5) || '';
                const badge = document.createElement('div');
                badge.className = 'event-badge';
                badge.style.backgroundColor = evento.cor || '#2988CA';
                badge.textContent = `${hora} ${evento.titulo}`;
                badge.title = evento.titulo; 
                
                badge.onclick = (e) => {
                    e.stopPropagation(); 
                    excluirCompromisso(evento.meuId);
                };
                celula.appendChild(badge);
            });

            celula.onclick = () => {
                dataAtual = new Date(ano, mes, diaContador);
                trocarVisao('diaria');
            };

            diaContador++;
        } else {
            celula.classList.add('inactive');
        }
        grid.appendChild(celula);
    }
}

// ==========================================
// 7. VISÃO DIÁRIA (LISTA)
// ==========================================

function renderizarListaDiaria() {
    const container = document.getElementById('lista-horarios');
    if (!container) return;
    
    container.innerHTML = '';
    const labelDia = document.getElementById('dia-atual-label');
    if(labelDia) labelDia.textContent = `Agenda de ${dataAtual.toLocaleDateString('pt-BR')}`;

    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const dataLocalString = `${ano}-${mes}-${dia}`;

    const db = getDB();
    const meusCompromissos = db.filter(c => c.usuarioId === usuarioCorrente.id);

    for (let h = 0; h < 24; h++) {
        const horaStr = String(h).padStart(2, '0');
        const horaFormatada = `${horaStr}:00`;
        
        const row = document.createElement('div');
        row.className = 'daily-row';

        const timeCol = document.createElement('div');
        timeCol.className = 'daily-time';
        timeCol.textContent = horaFormatada;

        const contentCol = document.createElement('div');
        contentCol.className = 'daily-content';

        const eventosNestaHora = meusCompromissos.filter(c => {
            return c.data_hora.startsWith(`${dataLocalString}T${horaStr}`);
        });

        if (eventosNestaHora.length > 0) {
            eventosNestaHora.forEach(ev => {
                const divEv = document.createElement('div');
                divEv.className = 'p-2 mb-1 rounded text-white d-flex justify-content-between align-items-center';
                divEv.style.backgroundColor = ev.cor || '#2988CA';
                
                const horaMin = ev.data_hora.split('T')[1]?.substring(0, 5);
                const spanTexto = document.createElement('span');
                spanTexto.textContent = `${horaMin} - ${ev.titulo}`;
                
                const btnDel = document.createElement('button');
                btnDel.className = 'btn btn-sm text-white';
                btnDel.innerHTML = '<i class="bi bi-trash"></i>';
                btnDel.onclick = () => excluirCompromisso(ev.meuId);

                divEv.appendChild(spanTexto);
                divEv.appendChild(btnDel);
                contentCol.appendChild(divEv);
            });
        }

        row.appendChild(timeCol);
        row.appendChild(contentCol);
        container.appendChild(row);
    }
}

// ==========================================
// 8. FUNÇÕES DO MODAL (CRUD)
// ==========================================

function abrirModalNovoCompromisso() {
    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    
    const elInputData = document.getElementById('inputData');
    if(elInputData) elInputData.value = `${ano}-${mes}-${dia}`;
    
    const agora = new Date();
    const hora = String(agora.getHours()).padStart(2, '0');
    const min = String(agora.getMinutes()).padStart(2, '0');
    
    const elInputHora = document.getElementById('inputHora');
    if(elInputHora) elInputHora.value = `${hora}:${min}`;

    const elDescricao = document.getElementById('inputDescricao');
    if(elDescricao) elDescricao.value = '';
    
    const el = document.getElementById('novocompromissoModal');
    if(el) {
        const modal = new bootstrap.Modal(el);
        modal.show();
    }
}

function salvarCompromisso() {
    const descricao = document.getElementById('inputDescricao').value;
    const data = document.getElementById('inputData').value;
    const hora = document.getElementById('inputHora').value;
    const cor = document.getElementById('inputCor').value;

    if (!descricao || !data || !hora) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    const dataHoraCombinada = `${data}T${hora}:00`;
    const db = getDB();
    
    const novoEvento = {
        meuId: gerarNovoId(db),
        usuarioId: usuarioCorrente.id,
        titulo: descricao,
        data_hora: dataHoraCombinada,
        cor: cor,
        vendaMeuId: null,
        clientes_fornecedoresId: null,
        recorrencia: []
    };

    db.push(novoEvento);
    saveDB(db);

    const el = document.getElementById('novocompromissoModal');
    const modal = bootstrap.Modal.getInstance(el);
    if(modal) modal.hide();

    renderizar();
}

function excluirCompromisso(id) {
    if(confirm("Excluir este compromisso?")) {
        let db = getDB();
        db = db.filter(c => c.meuId !== id);
        saveDB(db);
        renderizar();
    }
}

// ==========================================
// CHAMADA DE INICIALIZAÇÃO
// ==========================================
// Esta função roda assim que o arquivo JS é carregado pelo ajax-worker
initAgenda();