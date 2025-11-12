    // Verifica se o usuário já esta logado e se negativo, redireciona para tela de login        
    if (!usuarioCorrente.email_login) {
      window.location.href = LOGIN_URL;
    }

    function initPage() {

      // Associa a função de logout ao botão
      document.getElementById('btn_logout').addEventListener('click', logoutUser);

      // Informa o nome do usuário logado
      document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome;


    }

    // Associa ao evento de carga da página a função para verificar se o usuário está logado
    window.addEventListener('load', initPage);

// =================== CONTAS A RECEBER ===================

  let nextContaReceberId = 4;

  // LocalStorage 
  let contasReceber = JSON.parse(localStorage.getItem('contasReceber')) || [];

  function salvarNoLocalStorage() {
    localStorage.setItem('contasReceber', JSON.stringify(contasReceber));
  }

  function formatarDataParaExibicao(dataString) {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  function formatarValorMonetario(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function renderizarTabela() {
    const tabela = document.querySelector('#tabelaContasReceber tbody');
    tabela.innerHTML = '';

    contasReceber.forEach(conta => {
      const vencimentoFormatado = formatarDataParaExibicao(conta.vencimento);
      const valorFormatado = conta.valor.replace('.', ',');

      const reciboButton = `<button class="btn btn-outline-success btn-sm me-1" data-bs-toggle="modal" data-bs-target="#reciboModal" onclick="gerarRecibo(${conta.id})"><i class="bi bi-receipt"></i></button>`;
      const editButton = `<button class="btn btn-outline-primary btn-sm me-1" data-bs-toggle="modal" data-bs-target="#contaReceberModal" onclick="abrirModalContaReceber(${conta.id})"><i class="bi bi-pencil"></i></button>`;
      const deleteButton = `<button class="btn btn-outline-danger btn-sm" onclick="excluirItem(${conta.id})"><i class="bi bi-trash"></i></button>`;

      const acaoHTML =
        conta.status === 'Recebido'
          ? reciboButton + editButton + deleteButton
          : editButton + deleteButton;

      tabela.insertAdjacentHTML(
        'beforeend',
        `
        <tr id="conta-receber-${conta.id}" data-status="${conta.status}" data-tipo="${conta.tipo}"
          data-cliente="${conta.cliente}" data-descricao="${conta.descricao}" data-vencimento="${conta.vencimento}"
          data-valor="${conta.valor}">
          <td>${conta.status}</td>
          <td>${conta.tipo}</td>
          <td>${conta.cliente}</td>
          <td>${conta.descricao}</td>
          <td>${vencimentoFormatado}</td>
          <td>${valorFormatado}</td>
          <td>${acaoHTML}</td>
        </tr>
      `
      );
    });
  }

  function salvarContaReceber() {
    const id = document.getElementById('contaReceberId').value;
    const status = document.getElementById('modalStatusReceber').value;
    const tipo = document.getElementById('modalTipoReceber').value;
    const cliente = document.getElementById('modalClienteReceber').value;
    const descricao = document.getElementById('modalDescricaoReceber').value;
    const vencimento = document.getElementById('modalVencimentoReceber').value;
    const valor = parseFloat(document.getElementById('modalValorReceber').value).toFixed(2);

    if (!status || !tipo || !cliente || !descricao || !vencimento || isNaN(valor)) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    if (id) {
      // Edição
      const index = contasReceber.findIndex(c => c.id == id);
      if (index !== -1) {
        contasReceber[index] = { id: Number(id), status, tipo, cliente, descricao, vencimento, valor };
      }
    } else {
      // Novo registro
      const newId = contasReceber.length > 0 ? contasReceber[contasReceber.length - 1].id + 1 : 1;
      contasReceber.push({ id: newId, status, tipo, cliente, descricao, vencimento, valor });
    }

    salvarNoLocalStorage();
    renderizarTabela();

    const modal = bootstrap.Modal.getInstance(document.getElementById('contaReceberModal'));
    modal.hide();
  }

  function excluirItem(id) {
    if (confirm('Deseja realmente excluir esta conta?')) {
      contasReceber = contasReceber.filter(c => c.id !== id);
      salvarNoLocalStorage();
      renderizarTabela();
    }
  }

  // Inicializa a tabela com os dados do localStorage
  window.addEventListener('load', () => {
    renderizarTabela();
  });
