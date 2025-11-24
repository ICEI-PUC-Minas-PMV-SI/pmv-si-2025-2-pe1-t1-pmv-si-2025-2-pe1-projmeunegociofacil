import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js";


const usuarioCorrente = loggedUser();
if (!usuarioCorrente) window.location.href = LOGIN_URL;

const KEY_AGENDA = 'agenda_compromissos';
let dataAtual = new Date();
let viewAtual = 'mensal';

window.abrirModalNovoCompromisso = abrirModalNovoCompromisso;
window.abrirModalEdicao = abrirModalEdicao;
window.salvarCompromisso = salvarCompromisso;
window.excluirDoModal = excluirDoModal;

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
    const maxId = db.reduce((max, item) => (Number(item.meuId) > max ? Number(item.meuId) : max), 0);
    return maxId + 1;
}

function parseDataHora(isoString) {
    if (!isoString) return { data: '', hora: '' };
    const partes = isoString.split('T');
    const data = partes[0];
    const hora = partes[1] ? partes[1].substring(0, 5) : '00:00';
    return { data, hora };
}

function initAgenda() {
    const btnAnt = document.getElementById('btn-ant');
    const btnProx = document.getElementById('btn-prox');
    const btnMensal = document.getElementById('btn-view-monthly');
    const btnDiario = document.getElementById('btn-view-daily');

    if (btnAnt) btnAnt.onclick = () => navegar(-1);
    if (btnProx) btnProx.onclick = () => navegar(1);
    if (btnMensal) btnMensal.onclick = () => trocarVisao('mensal');
    if (btnDiario) btnDiario.onclick = () => trocarVisao('diaria');

    renderizar();
}

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

        btnMensal.classList.add('btn-primary');
        btnMensal.classList.remove('btn-outline-primary');

        btnDiario.classList.add('btn-outline-primary');
        btnDiario.classList.remove('btn-primary');

    } else {
        containerMensal.classList.add('d-none');
        containerDiaria.classList.remove('d-none');

        btnDiario.classList.add('btn-primary');
        btnDiario.classList.remove('btn-outline-primary');

        btnMensal.classList.add('btn-outline-primary');
        btnMensal.classList.remove('btn-primary');
    }
    renderizar();
}

function renderizar() {
    const label = document.getElementById('mes-ano-label');
    if (!label) return;

    if (viewAtual === 'mensal') {
        label.textContent = dataAtual.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        renderizarGridMensal();
    } else {
        label.textContent = dataAtual.toLocaleString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        renderizarListaDiaria();
    }
}

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

            const eventosDoDia = meusCompromissos.filter(c => c.data_hora.startsWith(dataIsoCelula));
            eventosDoDia.sort((a, b) => a.data_hora.localeCompare(b.data_hora));

            eventosDoDia.forEach(evento => {
                const { hora } = parseDataHora(evento.data_hora);

                const badge = document.createElement('div');
                badge.className = 'event-badge';
                badge.style.backgroundColor = evento.cor || '#2988CA';
                badge.textContent = `${hora} ${evento.titulo}`;
                badge.title = "Clique para editar";

                badge.onclick = (e) => {
                    e.stopPropagation();
                    abrirModalEdicao(evento.meuId);
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

function renderizarListaDiaria() {
    const container = document.getElementById('lista-horarios');
    if (!container) return;
    container.innerHTML = '';

    const labelDia = document.getElementById('dia-atual-label');
    if (labelDia) labelDia.textContent = `Agenda de ${dataAtual.toLocaleDateString('pt-BR')}`;

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
                divEv.style.cursor = 'pointer';

                const { hora } = parseDataHora(ev.data_hora);
                const spanTexto = document.createElement('span');
                spanTexto.textContent = `${hora} - ${ev.titulo}`;

                divEv.onclick = () => abrirModalEdicao(ev.meuId);

                divEv.appendChild(spanTexto);
                contentCol.appendChild(divEv);
            });
        }

        row.appendChild(timeCol);
        row.appendChild(contentCol);
        container.appendChild(row);
    }
}

function abrirModalNovoCompromisso() {
    document.getElementById('inputId').value = '';

    document.getElementById('novocompromissoModalLabel').textContent = 'Adicionar Novo Compromisso';
    const btnExcluir = document.getElementById('btnExcluirModal');
    if (btnExcluir) btnExcluir.classList.add('d-none'); // Esconde excluir

    const ano = dataAtual.getFullYear();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    document.getElementById('inputData').value = `${ano}-${mes}-${dia}`;

    const agora = new Date();
    const hora = String(agora.getHours()).padStart(2, '0');
    const min = String(agora.getMinutes()).padStart(2, '0');
    document.getElementById('inputHora').value = `${hora}:${min}`;

    document.getElementById('inputDescricao').value = '';
    document.getElementById('inputCor').value = '#2988CA'; // Reset cor

    const el = document.getElementById('novocompromissoModal');
    const modal = new bootstrap.Modal(el);
    modal.show();
}

function abrirModalEdicao(id) {
    const db = getDB();
    const evento = db.find(e => e.meuId == id && e.usuarioId == usuarioCorrente.id);

    if (!evento) return;

    document.getElementById('inputId').value = evento.meuId;

    document.getElementById('novocompromissoModalLabel').textContent = 'Editar Compromisso';
    const btnExcluir = document.getElementById('btnExcluirModal');
    if (btnExcluir) btnExcluir.classList.remove('d-none'); // Mostra excluir

    const { data, hora } = parseDataHora(evento.data_hora);
    document.getElementById('inputData').value = data;
    document.getElementById('inputHora').value = hora;
    document.getElementById('inputDescricao').value = evento.titulo;
    document.getElementById('inputCor').value = evento.cor || '#2988CA';

    const el = document.getElementById('novocompromissoModal');
    const modal = new bootstrap.Modal(el);
    modal.show();
}

function salvarCompromisso() {
    const id = document.getElementById('inputId').value; // ID oculto (vazio se for novo)
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

    if (id) {
        const index = db.findIndex(e => e.meuId == id && e.usuarioId == usuarioCorrente.id);
        if (index !== -1) {
            db[index].titulo = descricao;
            db[index].data_hora = dataHoraCombinada;
            db[index].cor = cor;
        }
    } else {
        const novoEvento = {
            meuId: gerarNovoId(db),
            usuarioId: usuarioCorrente.id,
            titulo: descricao,
            data_hora: dataHoraCombinada,
            cor: cor, // Campo extra de UI
            vendaMeuId: null,
            clientes_fornecedoresMeuId: null,
            recorrencia: []
        };
        db.push(novoEvento);
    }

    saveDB(db);

    const el = document.getElementById('novocompromissoModal');
    const modal = bootstrap.Modal.getInstance(el);
    if (modal) modal.hide();

    renderizar();
}

function excluirDoModal() {
    const id = document.getElementById('inputId').value;
    if (!id) return;

    if (confirm("Tem certeza que deseja excluir este compromisso?")) {
        let db = getDB();
        db = db.filter(c => c.meuId != id); // Filtra removendo o ID
        saveDB(db);

        const el = document.getElementById('novocompromissoModal');
        const modal = bootstrap.Modal.getInstance(el);
        if (modal) modal.hide();

        renderizar();
    }
}

initAgenda();