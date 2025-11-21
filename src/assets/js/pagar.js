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
  renderizarTabela();
}

// =================== CONTAS A PAGAR ===================
// Inicializa carregando todas as contas (ou array vazio)
let contasPagar = JSON.parse(localStorage.getItem('contasPagar')) || [
  {
    id: 1,
    status: 'Pendente',  
    tipo: 'Outro',       
    valor: '350.00',    
    descricao: "Compra de material de escritório (NF 1051)",
    vencimento: "2025-11-15",
    id_login_global: 1
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

function salvarNoLocalStorage() {
  // Salva a lista COMPLETA de volta ao localStorage
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
  
  // Filtra as contas para exibir SOMENTE as do usuário logado
  const contasDoUsuario = contasPagar.filter(conta => conta.id_login_global == ID_LOGIN_GLOBAL);

  contasDoUsuario.forEach(conta => { // Itera sobre as contas FILTRADAS
    const vencimentoFormatado = formatarDataParaExibicao(conta.vencimento);
    // Garante que o valor é formatado corretamente
    const valorFormatado = (typeof conta.valor === 'string' ? conta.valor : String(conta.valor)).replace('.', ',');

    // Estas chamadas via onclick NECESSITAM da correção do escopo.
    const editButton = `<button class="btn btn-outline-primary btn-sm me-1" data-bs-toggle="modal" data-bs-target="#contaPagarModal" onclick="abrirModalContaPagar(${conta.id})"><i class="bi bi-pencil"></i></button>`;
    const deleteButton = `<button class="btn btn-outline-danger btn-sm" onclick="excluirItem(${conta.id})"><i class="bi bi-trash"></i></button>`;

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
    // Busca a conta na lista COMPLETA
    const conta = contasPagar.find(c => c.id == id); 
    if (conta && conta.id_login_global == ID_LOGIN_GLOBAL) { // Garante que só edita a própria conta
      document.getElementById('modalStatusConta').value = conta.status;
      document.getElementById('modalTipoConta').value = conta.tipo;
      document.getElementById('modalValorConta').value = parseFloat(conta.valor).toFixed(2);
      document.getElementById('modalDescricaoConta').value = conta.descricao;
      document.getElementById('modalVencimentoConta').value = conta.vencimento;
    } else if (conta && conta.id_login_global !== ID_LOGIN_GLOBAL) {
        // Se tentar editar uma conta de outro usuário, fecha e alerta.
        alert('Você não tem permissão para editar esta conta.');
        // Esta linha presume a existência do objeto bootstrap
        const modal = bootstrap.Modal.getInstance(document.getElementById('contaPagarModal')); 
        modal.hide();
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

  if (!status || !tipo || !valorInput || !descricao || !vencimento) {
    alert('Por favor, preencha todos os campos corretamente.');
    return;
  }

  if (id) {
    const index = contasPagar.findIndex(c => c.id == id && c.id_login_global == ID_LOGIN_GLOBAL); // Filtra por ID e ID_LOGIN
    if (index !== -1) {
      // Mantém o id_login_global original
      contasPagar[index] = { 
        id: Number(id), 
        status, 
        tipo, 
        valor, 
        descricao, 
        vencimento, 
        id_login_global: ID_LOGIN_GLOBAL // Garante a manutenção
      };
    } else {
        alert('Conta não encontrada ou sem permissão de edição.');
        return;
    }
  } else {
    // Nova Conta: Adiciona o id_login_global
    const newId = contasPagar.length > 0 ? contasPagar[contasPagar.length - 1].id + 1 : 1;
    contasPagar.push({ 
        id: newId, 
        status, 
        tipo, 
        valor, 
        descricao, 
        vencimento,
        id_login_global: ID_LOGIN_GLOBAL // Adiciona o ID global aqui
    });
  }

  salvarNoLocalStorage(); // Salva a lista completa (agora com o novo ID)
  renderizarTabela();
  // Esta linha presume a existência do objeto bootstrap
  const modal = bootstrap.Modal.getInstance(document.getElementById('contaPagarModal'));
  modal.hide();
}

function excluirItem(id) {
  if (confirm('Deseja realmente excluir esta conta a pagar?')) {
    // Filtra para remover a conta, garantindo que é a conta do usuário logado
    contasPagar = contasPagar.filter(c => !(c.id === id && c.id_login_global === ID_LOGIN_GLOBAL));
    salvarNoLocalStorage();
    renderizarTabela();
  }
}

// =====================================================================
// A CORREÇÃO: Expondo as funções ao escopo global (window)
// para que os eventos 'onclick' do HTML possam encontrá-las.
// Isso resolve o ReferenceError.
// =====================================================================
window.excluirItem = excluirItem;
window.abrirModalContaPagar = abrirModalContaPagar;
window.salvarContaPagar = salvarContaPagar;

window.addEventListener('load', initPage);