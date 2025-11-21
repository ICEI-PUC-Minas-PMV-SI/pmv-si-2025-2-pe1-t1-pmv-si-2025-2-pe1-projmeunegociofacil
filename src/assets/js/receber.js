import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js" 


// Joga a chamada da função em uma const para usar seus dados
const usuarioCorrente = loggedUser(); 

// Verifica login: Agora usa o objeto retornado pela função
if (!usuarioCorrente || !usuarioCorrente.email_login) {
  window.location.href = LOGIN_URL;
}

// Variável global para o ID do usuário logado: Usa a propriedade do objeto
const ID_LOGIN_GLOBAL = usuarioCorrente.id_login_global;

function initPage() {
  // garante que o conteúdo inicial seja carregado.
  document.getElementById('btn_logout').addEventListener('click', logoutUser);
  // Usa o nome do usuário corrente
  document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome; 
  renderizarTabela(); // Chamamos a função principal de renderização desta tela
}

// 
//                CONTAS A RECEBER


let contasReceber =
    JSON.parse(localStorage.getItem('contasReceber')) ||
    [
        { id: 1, status: 'Pendente', tipo: 'Produto', cliente: 'Maria', descricao: 'Biscoito...', vencimento: '2025-10-15', valor: '110.00', id_login_global: ID_LOGIN_GLOBAL }, // Exemplo para o usuário logado
        { id: 2, status: 'Pendente', tipo: 'Serviço', cliente: 'José', descricao: 'Detergente', vencimento: '2025-11-13', valor: '85.00', id_login_global: ID_LOGIN_GLOBAL },
        { id: 3, status: 'Recebido', tipo: 'Serviço', cliente: 'Outro Usuário', descricao: 'Pintura', vencimento: '2025-09-26', valor: '240.00', id_login_global: 100 } // Exemplo de outro usuário
    ];

function salvarNoLocalStorage() {
    // Nesta tela, salvarNoLocalStorage se refere a 'contasReceber'
    localStorage.setItem('contasReceber', JSON.stringify(contasReceber));
}

function formatarDataParaExibicao(dataString) {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}


// --- Funções Auxiliares do Recibo ---
function gerarRecibo(id) {
    alert(`Gerando recibo para a conta ID: ${id}`);
    
    // Esconde o modal de recibo (presumindo que haja um)
    const modalEl = document.getElementById('reciboModal');
    if (modalEl) {
        // Esta linha presume a existência do objeto bootstrap
        const instance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        setTimeout(() => instance.hide(), 100);
    }
}

function imprimirRecibo() {
    alert('Imprimindo recibo...');
}


// --- Renderizar Tabela Receber 
function renderizarTabela() {
    const tabela = document.querySelector('#tabelaContasReceber tbody');
    if (!tabela) return; // Garante que só roda se a tabela existir

    tabela.innerHTML = '';

    const contasDoUsuario = contasReceber.filter(c => c.id_login_global == ID_LOGIN_GLOBAL);

    contasDoUsuario.forEach(conta => {
        const venc = formatarDataParaExibicao(conta.vencimento);
        // Garante que o valor é formatado corretamente
        const valorFmt = (typeof conta.valor === 'string' ? conta.valor : String(conta.valor)).replace('.', ',');

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
                onclick="excluirItem(${conta.id})"> 
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
            const modal = bootstrap.Modal.getInstance(document.getElementById('contaReceberModal'));
            modal.hide();
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
    const valorInput = document.getElementById('modalValorReceber').value;
    const valor = parseFloat(valorInput).toFixed(2);
    const descricao = document.getElementById('modalDescricaoReceber').value;
    const vencimento = document.getElementById('modalVencimentoReceber').value;

    if (!status || !tipo || !cliente || !valorInput || !descricao || !vencimento) {
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

    salvarNoLocalStorage(); // Usando a função salvaNoLocalStorage atualizada
    renderizarTabela();
    const modal = bootstrap.Modal.getInstance(document.getElementById('contaReceberModal'));
    modal.hide();
}

function excluirItem(id) { // Renomeada para ser a função principal desta tela
    if (!confirm('Deseja realmente excluir esta conta?')) return;

    contasReceber = contasReceber.filter(
        c => !(c.id === id && c.id_login_global === ID_LOGIN_GLOBAL)
    );

    salvarNoLocalStorage();
    renderizarTabela();
}


// =====================================================================
// para que os eventos 'onclick' do HTML possam encontrá-las

window.gerarRecibo = gerarRecibo;
window.abrirModalContaReceber = abrirModalContaReceber;
window.salvarContaReceber = salvarContaReceber;
window.excluirItem = excluirItem; // o nome 'excluirItem' para consistência


window.addEventListener('load', initPage);