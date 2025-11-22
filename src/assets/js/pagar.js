import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js";
import { makeDecimal, newMyId } from "./utils.js";

// ==========================================
// 1. AUTENTICAÇÃO E DADOS GLOBAIS
// ==========================================
const usuarioCorrente = loggedUser();

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
=======
const ID_LOGIN_GLOBAL = usuarioCorrente.id;

// ==========================================
// 2. FUNÇÕES DE BUSCA DE DADOS
// ==========================================

function allContasPagar() {
    try {
        return JSON.parse(localStorage.getItem('contasPagar')) || [];
    } catch {
        return [];
    }
}

// CORREÇÃO AQUI: Traz TODOS (Clientes e Fornecedores)
function allUserSuppliers() {
    try {
        const db = JSON.parse(localStorage.getItem('clientesFornecedores')) || [];
        
        return db.filter(item => {
            // Alterado: Removemos a verificação de tipo. Agora traz tudo.
            // Mantemos a conversão String() para garantir segurança na comparação de IDs
            return String(item.usuarioId) === String(ID_LOGIN_GLOBAL);
        }).sort((a, b) => {
            const nomeA = a.nomeRazaoSocial || '';
            const nomeB = b.nomeRazaoSocial || '';
            return nomeA.localeCompare(nomeB);
        });
    } catch (e) {
        console.error("Erro ao carregar contatos:", e);
        return [];
    }
}

function saveContasPagar(data) {
    localStorage.setItem('contasPagar', JSON.stringify(data));
}

// ==========================================
// 3. INICIALIZAÇÃO
// ==========================================

function initPage() {
    document.getElementById('btn_logout').addEventListener('click', logoutUser);
    document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome;

    const inputBusca = document.getElementById('busca-pagar');
    if (inputBusca) {
        inputBusca.addEventListener('input', () => renderizarTabela());
    }

    renderizarTabela();
}

// ==========================================
// 4. RENDERIZAÇÃO E UTILITÁRIOS
// ==========================================
>>>>>>> f3a56a57c5d744b5799d55f2e8fd9356e0a3048d

function formatarDataParaExibicao(dataString) {
    if (!dataString) return '';
    if (dataString.includes('T')) {
        const dateObj = new Date(dataString);
        return dateObj.toLocaleDateString('pt-BR');
    }
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

function getNomeFornecedor(id) {
    if (!id) return 'Fornecedor Diverso';
    // Busca na lista completa
    const dbClientes = JSON.parse(localStorage.getItem('clientesFornecedores')) || [];
    const fornecedor = dbClientes.find(f => f.meuId == id);
    return fornecedor ? fornecedor.nomeRazaoSocial : 'Desconhecido';
}

// Preenche o Select do Modal
function listOfSuppliers() {
    const select = document.getElementById('modalFornecedorConta');
    if(!select) return;

    const contatos = allUserSuppliers(); // Agora traz clientes e fornecedores
    
    let optionsHtml = `<option value="">Selecione um favorecido...</option>`;
    
    if (contatos.length > 0) {
        optionsHtml += contatos.map(contato => {
            // Mostra o Tipo ao lado do nome para facilitar (Ex: João Silva (Cliente))
            const tipoFmt = contato.tipo ? ` (${contato.tipo.charAt(0).toUpperCase() + contato.tipo.slice(1)})` : '';
            return `<option value="${contato.meuId}">${contato.nomeRazaoSocial}${tipoFmt}</option>`;
        }).join('');
    } else {
        optionsHtml += `<option value="" disabled>Nenhum cadastro encontrado</option>`;
    }
    
    select.innerHTML = optionsHtml;
}

function renderizarTabela() {
<<<<<<< HEAD
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
=======
    const tabela = document.querySelector('#tabelaContasPagar tbody');
    if (!tabela) return;
    tabela.innerHTML = '';

    const contas = allContasPagar();

    // Filtra contas do usuário
    let listaFiltrada = contas.filter(c => String(c.usuarioId) === String(ID_LOGIN_GLOBAL));

    const termo = document.getElementById('busca-pagar')?.value.toLowerCase();
    if (termo) {
        listaFiltrada = listaFiltrada.filter(c =>
            (c.descricao && c.descricao.toLowerCase().includes(termo)) ||
            (c.status && c.status.toLowerCase().includes(termo))
        );
    }
>>>>>>> f3a56a57c5d744b5799d55f2e8fd9356e0a3048d

    // Ordenação
    listaFiltrada.sort((a, b) => {
        if (a.status === 'pendente' && b.status !== 'pendente') return -1;
        if (a.status !== 'pendente' && b.status === 'pendente') return 1;
        return new Date(a.data_vencimento) - new Date(b.data_vencimento);
    });

<<<<<<< HEAD
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
=======
    if (listaFiltrada.length === 0) {
        tabela.innerHTML = '<tr><td colspan="6" class="text-center p-3">Nenhuma conta encontrada.</td></tr>';
>>>>>>> f3a56a57c5d744b5799d55f2e8fd9356e0a3048d
        return;
    }

    listaFiltrada.forEach(conta => {
        const vencimentoFormatado = formatarDataParaExibicao(conta.data_vencimento);
        const nomeFornecedor = getNomeFornecedor(conta.clientes_fornecedoresId);

        // Prioriza valorComDesconto
        let valorRaw = conta.valorComDesconto !== undefined ? conta.valorComDesconto : conta.valor;
        const valorFormatado = makeDecimal(Number(valorRaw));

        const contaId = conta.meuId;

        let statusBadge = '';
        if (conta.status === 'pago') {
            statusBadge = '<span class="badge bg-success text-white">Pago</span>';
        } else {
            statusBadge = '<span class="badge bg-warning text-dark">Pendente</span>';
        }

        const editButton = `<button class="btn btn-outline-primary btn-sm me-1" onclick="abrirModalContaPagar(${contaId})"><i class="bi bi-pencil"></i></button>`;
        const deleteButton = `<button class="btn btn-outline-danger btn-sm" onclick="excluirItem(${contaId})"><i class="bi bi-trash"></i></button>`;

        tabela.insertAdjacentHTML('beforeend', `
      <tr id="conta-pagar-${contaId}">
        <td>${statusBadge}</td>
        <td>${nomeFornecedor}</td>
        <td>${conta.descricao}</td>
        <td>${vencimentoFormatado}</td>
        <td class="text-end">R$ ${valorFormatado}</td>
        <td class="text-center">${editButton + deleteButton}</td>
      </tr>
    `);
    });
}

// ==========================================
// 5. CRUD (MODAL)
// ==========================================

function abrirModalContaPagar(id) {
    const modalTitle = document.getElementById('contaPagarModalLabel');
    const form = document.getElementById('formContaPagar');
    form.reset();
    document.getElementById('contaPagarId').value = '';

    // Carrega a lista completa (Clientes + Fornecedores)
    listOfSuppliers();

    if (id) {
        modalTitle.textContent = 'Editar Conta a Pagar';
        document.getElementById('contaPagarId').value = id;

        const contas = allContasPagar();
        const conta = contas.find(c => c.meuId == id && String(c.usuarioId) === String(ID_LOGIN_GLOBAL));

        if (conta) {
            document.getElementById('modalStatusConta').value = conta.status; 
            document.getElementById('modalFornecedorConta').value = conta.clientes_fornecedoresId || "";
            document.getElementById('modalDescricaoConta').value = conta.descricao;

            let dataVenc = conta.data_vencimento;
            if (dataVenc && dataVenc.includes('T')) dataVenc = dataVenc.split('T')[0];
            document.getElementById('modalVencimentoConta').value = dataVenc;

            let valorRaw = conta.valorComDesconto !== undefined ? conta.valorComDesconto : conta.valor;
            document.getElementById('modalValorConta').value = Number(valorRaw).toFixed(2);
        }
    } else {
        modalTitle.textContent = 'Adicionar Nova Conta a Pagar';
    }

    const el = document.getElementById('contaPagarModal');
    if (el) {
        const modal = bootstrap.Modal.getOrCreateInstance(el);
        modal.show();
    }
}

function salvarContaPagar() {
    const id = document.getElementById('contaPagarId').value;
    
    const status = document.getElementById('modalStatusConta').value;
    const fornecedorId = document.getElementById('modalFornecedorConta').value;
    const descricao = document.getElementById('modalDescricaoConta').value;
    const vencimento = document.getElementById('modalVencimentoConta').value;
    const valorInput = document.getElementById('modalValorConta').value;
    const valor = parseFloat(valorInput);

<<<<<<< HEAD
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
=======
    if (!status || !descricao || !vencimento || isNaN(valor)) {
        alert('Por favor, preencha os campos obrigatórios.');
        return;
    }

    const dadosConta = {
        status: status,
        tipo: 'pagar',
        clientes_fornecedoresId: fornecedorId ? Number(fornecedorId) : null,
        descricao: descricao,
        data_vencimento: vencimento,
        data_pagamento: status === 'pago' ? new Date().toISOString() : null,
        valorComDesconto: valor,
        valor: valor,
        usuarioId: ID_LOGIN_GLOBAL,
        parcela: "1/1"
    };

    let contas = allContasPagar();

    if (id) {
        const index = contas.findIndex(c => c.meuId == id && String(c.usuarioId) === String(ID_LOGIN_GLOBAL));
        if (index !== -1) {
            contas[index] = { ...contas[index], ...dadosConta };
        }
    } else {
        const novoId = newMyId(contas);
        contas.push({
            meuId: novoId,
            ...dadosConta
        });
    }

    saveContasPagar(contas);
    renderizarTabela();

    const el = document.getElementById('contaPagarModal');
    const modal = bootstrap.Modal.getInstance(el);
    if (modal) modal.hide();
}

function excluirItem(id) {
    if (confirm('Deseja realmente excluir esta conta a pagar?')) {
        let contas = allContasPagar();
        contas = contas.filter(c => !(c.meuId == id && String(c.usuarioId) === String(ID_LOGIN_GLOBAL)));
        saveContasPagar(contas);
        renderizarTabela();
    }
}

>>>>>>> f3a56a57c5d744b5799d55f2e8fd9356e0a3048d
window.excluirItem = excluirItem;
window.abrirModalContaPagar = abrirModalContaPagar;
window.salvarContaPagar = salvarContaPagar;

initPage()