import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js" 


// Joga a chamada da função em uma const para usar seus dados
const usuarioCorrente = loggedUser(); 

// Verifica login: Agora usa o objeto retornado pela função
if (!usuarioCorrente || !usuarioCorrente.email_login) {
  window.location.href = LOGIN_URL;
}

// =========================================================
// CORREÇÃO RF-08: Autenticação
// Usa uma propriedade de ID existente no objeto, ou o email como fallback, para evitar erro fatal.
// =========================================================
const ID_LOGIN_GLOBAL = usuarioCorrente.id || usuarioCorrente.email_login; 
if (!ID_LOGIN_GLOBAL) {
    console.error("ID de usuário inválido. Forçando logout.");
    logoutUser();
    // A verificação acima garante que não continuaremos se não houver um ID.
}


// =========================================================
// CORREÇÃO RF-08: Dados Fictícios (Removida a lista fixa)
// O código agora confia que o módulo de Vendas/Inicialização populou o localStorage.
// =========================================================
let contasReceber = JSON.parse(localStorage.getItem('contasReceber')) || [];


function salvarNoLocalStorage() {
    // Nesta tela, salvarNoLocalStorage se refere a 'contasReceber'
    localStorage.setItem('contasReceber', JSON.stringify(contasReceber));
}

function initPage() {
  // garante que o conteúdo inicial seja carregado.
  document.getElementById('btn_logout').addEventListener('click', logoutUser);
  // Usa o nome do usuário corrente
  document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome; 
  renderizarTabela(); // Chamamos a função principal de renderização desta tela
}

// 
//                CONTAS A RECEBER


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
    if (modalEl && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
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

    // Filtra as contas pelo ID de login (corrigido)
    const contasDoUsuario = contasReceber.filter(c => String(c.id_login_global) === String(ID_LOGIN_GLOBAL));

    if (contasDoUsuario.length === 0) {
        tabela.innerHTML = `<tr><td colspan="7" class="text-center">Nenhuma conta a receber encontrada.</td></tr>`;
        return;
    }

    contasDoUsuario.forEach(conta => {
        const venc = formatarDataParaExibicao(conta.vencimento);
        // Garante que o valor é formatado corretamente
        const valorFmt = parseFloat(conta.valor).toFixed(2).replace('.', ',');

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
                <td>R$ ${valorFmt}</td>
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

        // Verifica a permissão usando o ID corrigido (garante que não seja de outro usuário)
        if (String(conta.id_login_global) !== String(ID_LOGIN_GLOBAL)) {
            alert('Você não pode editar esta conta.');
            // Precisa garantir que 'bootstrap' existe aqui
             if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                 const modal = bootstrap.Modal.getInstance(document.getElementById('contaReceberModal'));
                 if(modal) modal.hide();
             }
            return;
        }

        document.getElementById('contaReceberId').value = id;
        document.getElementById('modalStatusReceber').value = conta.status;
        document.getElementById('modalTipoReceber').value = conta.tipo;
        document.getElementById('modalClienteReceber').value = conta.cliente;
        // Garante que o valor é exibido corretamente
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
    // O valor deve ser salvo como string de ponto flutuante para consistência
    const valor = parseFloat(valorInput).toFixed(2); 
    const descricao = document.getElementById('modalDescricaoReceber').value;
    const vencimento = document.getElementById('modalVencimentoReceber').value;

    if (!status || !tipo || !cliente || !valorInput || !descricao || !vencimento || isNaN(valor)) {
        alert('Preencha todos os campos corretamente.');
        return;
    }

    if (id) {
        // Encontra o item verificando o ID da conta E o ID do usuário (corrigido)
        const index = contasReceber.findIndex(
            c => c.id == id && String(c.id_login_global) === String(ID_LOGIN_GLOBAL)
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
            id_login_global: ID_LOGIN_GLOBAL // Usa o ID corrigido
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
            id_login_global: ID_LOGIN_GLOBAL // Usa o ID corrigido
        });
    }

    salvarNoLocalStorage(); 
    renderizarTabela();
    // Precisa garantir que 'bootstrap' existe aqui
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('contaReceberModal'));
        if(modal) modal.hide();
    }
}

function excluirItem(id) { 
    if (!confirm('Deseja realmente excluir esta conta?')) return;

    // Filtra pelo ID da conta E o ID do usuário (corrigido)
    contasReceber = contasReceber.filter(
        c => !(c.id === id && String(c.id_login_global) === String(ID_LOGIN_GLOBAL))
    );

    salvarNoLocalStorage();
    renderizarTabela();
}


// =====================================================================
// para que os eventos 'onclick' do HTML possam encontrá-las

window.gerarRecibo = gerarRecibo;
window.abrirModalContaReceber = abrirModalContaReceber;
window.salvarContaReceber = salvarContaReceber;
window.excluirItem = excluirItem; 


window.addEventListener('load', initPage);