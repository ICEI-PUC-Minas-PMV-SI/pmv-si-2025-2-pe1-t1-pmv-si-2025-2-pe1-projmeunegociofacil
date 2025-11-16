// ===================================================
//                CONFIGURAÇÕES E SESSÃO
// ===================================================


// Simulação do usuário logado
var usuarioCorrente = { 
    id_login_global: 999,
    email_login: 'teste@teste.com',
    nome: 'Usuário Teste'
};

const ID_LOGIN_GLOBAL = usuarioCorrente.id_login_global;


//                FUNÇÕES UTILITÁRIAS

function logoutUser() {
    localStorage.removeItem('usuarioCorrente');
    window.location.href = LOGIN_URL;
}

function formatarDataParaExibicao(dataString) {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}



//                CONTAS A PAGAR


let contasPagar = JSON.parse(localStorage.getItem('contasPagar')) || [
    {
        id: 1,
        status: 'Pendente',  
        tipo: 'Outro',       
        valor: '350.00',    
        descricao: "Compra de material de escritório (NF 1051)",
        vencimento: "2025-11-15", // JSON: data_vencimento
        id_login_global: 1        // JSON: usuarioId
    },
    { 
        id: 101, 
        status: 'Pendente', 
        tipo: 'Aluguel', 
        valor: '1500.00', 
        descricao: 'Aluguel Novembro', 
        vencimento: '2025-11-05', 
        id_login_global: 999 
    },
    { 
        id: 102, 
        status: 'Pago', 
        tipo: 'Luz', 
        valor: '250.50', 
        descricao: 'Energia', 
        vencimento: '2025-11-10', 
        id_login_global: 100 
    }
];


function salvarNoLocalStoragePagar() {
    localStorage.setItem('contasPagar', JSON.stringify(contasPagar));
}

function renderizarTabelaPagar() {
    const tabela = document.querySelector('#tabelaContasPagar tbody');
    if (!tabela) return;

    tabela.innerHTML = '';

    const contasDoUsuario = contasPagar.filter(c => c.id_login_global == ID_LOGIN_GLOBAL);

    contasDoUsuario.forEach(conta => {
        const vencimentoFormatado = formatarDataParaExibicao(conta.vencimento);
        const valorFormatado = conta.valor.replace('.', ',');

        const editButton = `
            <button class="btn btn-outline-primary btn-sm me-1"
                data-bs-toggle="modal"
                data-bs-target="#contaPagarModal"
                onclick="abrirModalContaPagar(${conta.id})">
                <i class="bi bi-pencil"></i>
            </button>`;
        const deleteButton = `
            <button class="btn btn-outline-danger btn-sm"
                onclick="excluirItemPagar(${conta.id})">
                <i class="bi bi-trash"></i>
            </button>`;

        tabela.insertAdjacentHTML('beforeend', `
            <tr id="conta-pagar-${conta.id}">
                <td>${conta.status}</td>
                <td>${conta.tipo}</td>
                <td>${valorFormatado}</td>
                <td>${conta.descricao}</td>
                <td>${vencimentoFormatado}</td>
                <td>${editButton + deleteButton}</td>
            </tr>
        `);
    });
}

function abrirModalContaPagar(id) {
    const modalTitle = document.getElementById('contaPagarModalLabel');
    const form = document.getElementById('formContaPagar');
    form.reset();
    document.getElementById('contaPagarId').value = '';

    if (id) {
        modalTitle.textContent = 'Editar Conta a Pagar';
        document.getElementById('contaPagarId').value = id;

        const conta = contasPagar.find(c => c.id == id);
        if (!conta) return;

        if (conta.id_login_global !== ID_LOGIN_GLOBAL) {
            alert('Você não tem permissão para editar esta conta.');
            bootstrap.Modal.getInstance(document.getElementById('contaPagarModal')).hide();
            return;
        }

        document.getElementById('modalStatusConta').value = conta.status;
        document.getElementById('modalTipoConta').value = conta.tipo;
        document.getElementById('modalValorConta').value = parseFloat(conta.valor).toFixed(2);
        document.getElementById('modalDescricaoConta').value = conta.descricao;
        document.getElementById('modalVencimentoConta').value = conta.vencimento;

    } else {
        modalTitle.textContent = 'Adicionar Nova Conta a Pagar';
    }
}

function salvarContaPagar() {
    const id = document.getElementById('contaPagarId').value;
    const status = document.getElementById('modalStatusConta').value;
    const tipo = document.getElementById('modalTipoConta').value;
    const valorInput = document.getElementById('modalValorConta').value;
    const valor = parseFloat(valorInput).toFixed(2);
    const descricao = document.getElementById('modalDescricaoConta').value;
    const vencimento = document.getElementById('modalVencimentoConta').value;

    if (!status || !tipo || !valorInput || !descricao || !vencimento) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    if (id) {
        const index = contasPagar.findIndex(
            c => c.id == id && c.id_login_global == ID_LOGIN_GLOBAL
        );

        if (index === -1) {
            alert('Conta não encontrada ou sem permissão.');
            return;
        }

        contasPagar[index] = {
            id: Number(id),
            status,
            tipo,
            valor,
            descricao,
            vencimento,
            id_login_global: ID_LOGIN_GLOBAL
        };

    } else {
        const newId =
            contasPagar.length > 0
                ? Math.max(...contasPagar.map(c => c.id)) + 1
                : 1;

        contasPagar.push({
            id: newId,
            status,
            tipo,
            valor,
            descricao,
            vencimento,
            id_login_global: ID_LOGIN_GLOBAL
        });
    }

    salvarNoLocalStoragePagar();
    renderizarTabelaPagar();
    bootstrap.Modal.getInstance(document.getElementById('contaPagarModal')).hide();
}

function excluirItemPagar(id) {
    if (!confirm('Deseja realmente excluir esta conta a pagar?')) return;

    contasPagar = contasPagar.filter(
        c => !(c.id === id && c.id_login_global === ID_LOGIN_GLOBAL)
    );

    salvarNoLocalStoragePagar();
    renderizarTabelaPagar();
}


// ===================================================
//                CONTAS A RECEBER
// ===================================================

let contasReceber =
    JSON.parse(localStorage.getItem('contasReceber')) ||
    [
        { id: 1, status: 'Pendente', tipo: 'Produto', cliente: 'Maria', descricao: 'Biscoito...', vencimento: '2025-10-15', valor: '110.00', id_login_global: 999 },
        { id: 2, status: 'Pendente', tipo: 'Serviço', cliente: 'José', descricao: 'Detergente', vencimento: '2025-11-13', valor: '85.00', id_login_global: 999 },
        { id: 3, status: 'Recebido', tipo: 'Serviço', cliente: 'Outro Usuário', descricao: 'Pintura', vencimento: '2025-09-26', valor: '240.00', id_login_global: 100 }
    ];

function salvarNoLocalStorageReceber() {
    localStorage.setItem('contasReceber', JSON.stringify(contasReceber));
}


// --- Funções Auxiliares do Recibo ---
function gerarRecibo(id) {
    alert(`Gerando recibo para a conta ID: ${id}`);

    const modal = document.getElementById('reciboModal');
    if (modal) {
        const instance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        setTimeout(() => instance.hide(), 100);
    }
}

function imprimirRecibo() {
    alert('Imprimindo recibo...');
}


// --- Renderizar Tabela Receber ---
function renderizarTabelaReceber() {
    const tabela = document.querySelector('#tabelaContasReceber tbody');
    if (!tabela) return;

    tabela.innerHTML = '';

    const contasDoUsuario = contasReceber.filter(c => c.id_login_global == ID_LOGIN_GLOBAL);

    contasDoUsuario.forEach(conta => {
        const venc = formatarDataParaExibicao(conta.vencimento);
        const valorFmt = conta.valor.replace('.', ',');

        const btnRecibo =
            conta.status === 'Recebido'
                ? `<button class="btn btn-outline-success btn-sm me-1" 
                    data-bs-toggle="modal" 
                    data-bs-target="#reciboModal"
                    onclick="gerarRecibo(${conta.id})">
                    <i class="bi bi-receipt"></i>
                  </button>`
                : '';

        const btnEdit = `
            <button class="btn btn-outline-primary btn-sm me-1"
                data-bs-toggle="modal"
                data-bs-target="#contaReceberModal"
                onclick="abrirModalContaReceber(${conta.id})">
                <i class="bi bi-pencil"></i>
            </button>`;

        const btnDel = `
            <button class="btn btn-outline-danger btn-sm"
                onclick="excluirItemReceber(${conta.id})">
                <i class="bi bi-trash"></i>
            </button>`;

        tabela.insertAdjacentHTML(
            'beforeend',
            `
            <tr id="conta-receber-${conta.id}">
                <td>${conta.status}</td>
                <td>${conta.tipo}</td>
                <td>${conta.cliente}</td>
                <td>${conta.descricao}</td>
                <td>${venc}</td>
                <td>${valorFmt}</td>
                <td>${btnRecibo + btnEdit + btnDel}</td>
            </tr>
        `
        );
    });
}


// --- Modal Receber ---
function abrirModalContaReceber(id) {
    const modalTitle = document.getElementById('contaReceberModalLabel');
    const form = document.getElementById('formContaReceber');

    form.reset();
    document.getElementById('contaReceberId').value = '';

    if (id) {
        modalTitle.textContent = 'Editar Conta a Receber';

        const conta = contasReceber.find(c => c.id == id);
        if (!conta) return;

        if (conta.id_login_global !== ID_LOGIN_GLOBAL) {
            alert('Você não pode editar esta conta.');
            bootstrap.Modal.getInstance(document.getElementById('contaReceberModal')).hide();
            return;
        }

        document.getElementById('contaReceberId').value = id;
        document.getElementById('modalStatusReceber').value = conta.status;
        document.getElementById('modalTipoReceber').value = conta.tipo;
        document.getElementById('modalClienteReceber').value = conta.cliente;
        document.getElementById('modalValorReceber').value = parseFloat(conta.valor).toFixed(2);
        document.getElementById('modalDescricaoReceber').value = conta.descricao;
        document.getElementById('modalVencimentoReceber').value = conta.vencimento;

    } else {
        modalTitle.textContent = 'Adicionar Nova Conta a Receber';
    }
}

function salvarContaReceber() {
    const id = document.getElementById('contaReceberId').value;
    const status = document.getElementById('modalStatusReceber').value;
    const tipo = document.getElementById('modalTipoReceber').value;
    const cliente = document.getElementById('modalClienteReceber').value;
    const valor = parseFloat(document.getElementById('modalValorReceber').value).toFixed(2);
    const descricao = document.getElementById('modalDescricaoReceber').value;
    const vencimento = document.getElementById('modalVencimentoReceber').value;

    if (!status || !tipo || !cliente || !valor || !descricao || !vencimento) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    if (id) {
        const index = contasReceber.findIndex(
            c => c.id == id && c.id_login_global == ID_LOGIN_GLOBAL
        );

        if (index === -1) {
            alert('Conta não encontrada ou sem permissão.');
            return;
        }

        contasReceber[index] = {
            id: Number(id),
            status,
            tipo,
            cliente,
            valor,
            descricao,
            vencimento,
            id_login_global: ID_LOGIN_GLOBAL
        };

    } else {
        const newId =
            contasReceber.length > 0
                ? Math.max(...contasReceber.map(c => c.id)) + 1
                : 1;

        contasReceber.push({
            id: newId,
            status,
            tipo,
            cliente,
            valor,
            descricao,
            vencimento,
            id_login_global: ID_LOGIN_GLOBAL
        });
    }

    salvarNoLocalStorageReceber();
    renderizarTabelaReceber();
    bootstrap.Modal.getInstance(document.getElementById('contaReceberModal')).hide();
}

function excluirItemReceber(id) {
    if (!confirm('Deseja realmente excluir esta conta?')) return;

    contasReceber = contasReceber.filter(
        c => !(c.id === id && c.id_login_global === ID_LOGIN_GLOBAL)
    );

    salvarNoLocalStorageReceber();
    renderizarTabelaReceber();
}


// ===================================================
//              INICIALIZAÇÃO DAS PÁGINAS
// ===================================================

function initPage() {
    if (!usuarioCorrente || !usuarioCorrente.email_login) {
        window.location.href = LOGIN_URL;
    }

    const btnLogout = document.getElementById('btn_logout');
    if (btnLogout) btnLogout.addEventListener('click', logoutUser);

    const nomeUsuarioEl = document.getElementById('nomeUsuario');
    if (nomeUsuarioEl) nomeUsuarioEl.innerHTML = usuarioCorrente.nome;

    if (document.getElementById('tabelaContasPagar')) {
        renderizarTabelaPagar();
    }

    if (document.getElementById('tabelaContasReceber')) {
        renderizarTabelaReceber();
    }
}

window.addEventListener('load', initPage);
