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
// Usa uma propriedade de ID mais segura ou o email, removendo a dependência de 'id_login_global'.
// =========================================================
const ID_LOGIN_GLOBAL = usuarioCorrente.id || usuarioCorrente.email_login; 
if (!ID_LOGIN_GLOBAL) {
    console.error("ID de usuário inválido. Forçando logout.");
    logoutUser();
}


function initPage() {
  document.getElementById('btn_logout').addEventListener('click', logoutUser);
  document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome; 
  renderizarTabela();
}

// =========================================================
// CORREÇÃO RF-08: Dados Fictícios
// Inicializa APENAS com o LocalStorage, removendo a lista fixa de fallback.
// =========================================================
let contasPagar = JSON.parse(localStorage.getItem('contasPagar')) || [];

function salvarNoLocalStorage() {
  localStorage.setItem('contasPagar', JSON.stringify(contasPagar));
}

function formatarDataParaExibicao(dataString) {
  if (!dataString) return '';
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
}

function renderizarTabela() {
  const tabela = document.querySelector('#tabelaContasPagar tbody');
  tabela.innerHTML = '';
  
  // Filtra as contas para exibir SOMENTE as do usuário logado (usando o ID corrigido)
  const contasDoUsuario = contasPagar.filter(conta => String(conta.id_login_global) === String(ID_LOGIN_GLOBAL));

  if (contasDoUsuario.length === 0) {
      tabela.innerHTML = `<tr><td colspan="6" class="text-center">Nenhuma conta a pagar encontrada.</td></tr>`;
      return;
  }
  
  contasDoUsuario.forEach(conta => { // Itera sobre as contas FILTRADAS
    const vencimentoFormatado = formatarDataParaExibicao(conta.vencimento);
    // Garante que o valor é formatado corretamente
    const valorFormatado = parseFloat(conta.valor).toFixed(2).replace('.', ',');

    const editButton = `<button class="btn btn-outline-primary btn-sm me-1" data-bs-toggle="modal" data-bs-target="#contaPagarModal" onclick="abrirModalContaPagar(${conta.id})"><i class="bi bi-pencil"></i></button>`;
    const deleteButton = `<button class="btn btn-outline-danger btn-sm" onclick="excluirItem(${conta.id})"><i class="bi bi-trash"></i></button>`;

    tabela.insertAdjacentHTML('beforeend', `
      <tr id="conta-pagar-${conta.id}">
        <td>${conta.status}</td>
        <td>${conta.tipo}</td>
        <td>R$ ${valorFormatado}</td>
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
    // Busca a conta na lista COMPLETA
    const conta = contasPagar.find(c => c.id == id); 
    
    // Garante que só edita a própria conta (usando o ID corrigido)
    if (conta && String(conta.id_login_global) === String(ID_LOGIN_GLOBAL)) { 
      document.getElementById('modalStatusConta').value = conta.status;
      document.getElementById('modalTipoConta').value = conta.tipo;
      document.getElementById('modalValorConta').value = parseFloat(conta.valor).toFixed(2);
      document.getElementById('modalDescricaoConta').value = conta.descricao;
      document.getElementById('modalVencimentoConta').value = conta.vencimento;
    } else if (conta && String(conta.id_login_global) !== String(ID_LOGIN_GLOBAL)) {
        // Se tentar editar uma conta de outro usuário, fecha e alerta.
        alert('Você não tem permissão para editar esta conta.');
        // Presumindo a existência do objeto bootstrap
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('contaPagarModal')); 
            if(modal) modal.hide();
        }
        return;
    }
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

  if (!status || !tipo || !valorInput || !descricao || !vencimento || isNaN(valor)) {
    alert('Por favor, preencha todos os campos corretamente.');
    return;
  }

  if (id) {
    // Filtra por ID da conta E o ID do usuário (corrigido)
    const index = contasPagar.findIndex(c => c.id == id && String(c.id_login_global) === String(ID_LOGIN_GLOBAL)); 
    if (index !== -1) {
      // Mantém o id_login_global original
      contasPagar[index] = { 
        id: Number(id), 
        status, 
        tipo, 
        valor, 
        descricao, 
        vencimento, 
        id_login_global: ID_LOGIN_GLOBAL // Garante a manutenção do ID corrigido
      };
    } else {
        alert('Conta não encontrada ou sem permissão de edição.');
        return;
    }
  } else {
    // Nova Conta: Adiciona o id_login_global
    const newId = contasPagar.length > 0 ? Math.max(...contasPagar.map(c => c.id)) + 1 : 1;
    contasPagar.push({ 
        id: newId, 
        status, 
        tipo, 
        valor, 
        descricao, 
        vencimento,
        id_login_global: ID_LOGIN_GLOBAL // Adiciona o ID corrigido aqui
    });
  }

  salvarNoLocalStorage(); 
  renderizarTabela();
  // Presumindo a existência do objeto bootstrap
  if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
    const modal = bootstrap.Modal.getInstance(document.getElementById('contaPagarModal'));
    if(modal) modal.hide();
  }
}

function excluirItem(id) {
  if (confirm('Deseja realmente excluir esta conta a pagar?')) {
    // Filtra para remover a conta, garantindo que é a conta do usuário logado (usando o ID corrigido)
    contasPagar = contasPagar.filter(c => !(c.id === id && String(c.id_login_global) === String(ID_LOGIN_GLOBAL)));
    salvarNoLocalStorage();
    renderizarTabela();
  }
}

// =====================================================================
// Expondo as funções ao escopo global (window)
// =====================================================================
window.excluirItem = excluirItem;
window.abrirModalContaPagar = abrirModalContaPagar;
window.salvarContaPagar = salvarContaPagar;

window.addEventListener('load', initPage);