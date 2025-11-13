// Constantes de Dados e Persistência
const LOGIN_URL = 'login.html'; // Necessário para a função initPage (manter a compatibilidade)
let usuarioCorrente = { email_login: 'teste@teste.com', nome: 'Usuário Teste' }; // Mock para evitar redirecionamento

// Inicializa o array de contas a receber a partir do LocalStorage ou usa o array inicial
let contasReceber = JSON.parse(localStorage.getItem('contasReceber')) || [{
    id: 1,
    status: 'Pendente',
    tipo: 'Produto',
    cliente: 'Maria de Oliveira',
    descricao: 'Biscoito Recheado, arr...',
    vencimento: '2025-10-15',
    valor: '110.00'
}, {
    id: 2,
    status: 'Pendente',
    tipo: 'Produto',
    cliente: 'José da Silva',
    descricao: 'Detergente',
    vencimento: '2025-11-13',
    valor: '85.00'
}, {
    id: 3,
    status: 'Recebido',
    tipo: 'Serviço',
    cliente: 'Marcos Aurélio',
    descricao: 'Pintura de Porta',
    vencimento: '2025-09-26',
    valor: '240.00'
}];

// Garante que o ID do próximo registro seja maior que o maior ID existente
let nextContaReceberId = contasReceber.length > 0 ? Math.max(...contasReceber.map(c => c.id)) + 1 : 1;


// ==================== FUNÇÕES DE UTENSÍLIOS ====================

function salvarNoLocalStorage() {
    localStorage.setItem('contasReceber', JSON.stringify(contasReceber));
}

function formatarDataParaExibicao(dataString) {
    if (!dataString) return '';
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarValorMonetario(valor) {
    // Garante que o valor é um número antes de formatar
    const num = parseFloat(valor);
    if (isNaN(num)) return '0,00';
    // Retorna o valor com vírgula para exibição (Ex: 110,00)
    return num.toFixed(2).replace('.', ',');
}

// Função de exclusão (adicionada para completar a funcionalidade)
function excluirItem(id) {
    if (confirm('Deseja realmente excluir esta conta?')) {
        contasReceber = contasReceber.filter(c => c.id !== id);
        salvarNoLocalStorage();
        renderizarTabela();
    }
}

// Função de gerar recibo (mock para completar a funcionalidade do botão)
function gerarRecibo(id) {
    alert(`Gerando recibo para a conta ID: ${id}`);
}

// Função de imprimir recibo (mock para completar a funcionalidade do botão)
function imprimirRecibo() {
    alert('Imprimindo recibo...');
}


// ==================== FUNÇÕES PRINCIPAIS ====================

/**
 * Renderiza todas as contas na tabela HTML, usando os dados do array contasReceber.
 */
function renderizarTabela() {
    const tabela = document.querySelector('#tabelaContasReceber tbody');
    tabela.innerHTML = '';

    contasReceber.forEach(conta => {
        const vencimentoFormatado = formatarDataParaExibicao(conta.vencimento);
        const valorFormatado = formatarValorMonetario(conta.valor);

        // Define os botões de Ação
        const reciboButton = `<button class="btn btn-outline-success btn-sm me-1" data-bs-toggle="modal" data-bs-target="#reciboModal" onclick="gerarRecibo(${conta.id})"><i class="bi bi-receipt"></i></button>`;
        const editButton = `<button class="btn btn-outline-primary btn-sm me-1" data-bs-toggle="modal" data-bs-target="#contaReceberModal" onclick="abrirModalContaReceber(${conta.id})"><i class="bi bi-pencil"></i></button>`;
        const deleteButton = `<button class="btn btn-outline-danger btn-sm" onclick="excluirItem(${conta.id})"><i class="bi bi-trash"></i></button>`;

        const acaoHTML =
            conta.status === 'Recebido' ?
            reciboButton + editButton + deleteButton :
            editButton + deleteButton;

        tabela.insertAdjacentHTML(
            'beforeend',
            `
            <tr id="conta-receber-${conta.id}" data-status="${conta.status}" data-tipo="${conta.tipo}"
                data-cliente="${conta.cliente}" data-descricao="${conta.descricao}" data-vencimento="${conta.vencimento}"
                data-valor="${conta.valor}">
                <td>${conta.status}</td>
                <td>${conta.tipo}</td>
                <td>${conta.cliente}</td>
                <td>${conta.descricao.substring(0, 20) + (conta.descricao.length > 20 ? '...' : '')}</td>
                <td>${vencimentoFormatado}</td>
                <td>${valorFormatado}</td>
                <td>${acaoHTML}</td>
            </tr>
            `
        );
    });
}

/**
 * Prepara o modal para adicionar (id=null) ou editar (id=valor) uma conta.
 * @param {number | null} id O ID da conta a ser editada ou null para nova.
 */
function abrirModalContaReceber(id) {
    document.getElementById('formContaReceber').reset();

    if (id !== null) {
        // Modo Edição
        const conta = contasReceber.find(c => c.id === id);
        if (conta) {
            document.getElementById('contaReceberModalLabel').textContent = 'Editar Conta a Receber';
            document.getElementById('contaReceberId').value = conta.id;
            document.getElementById('modalStatusReceber').value = conta.status;
            document.getElementById('modalTipoReceber').value = conta.tipo;
            document.getElementById('modalClienteReceber').value = conta.cliente;
            document.getElementById('modalDescricaoReceber').value = conta.descricao;
            document.getElementById('modalVencimentoReceber').value = conta.vencimento;
            // O valor precisa ser inserido sem a vírgula para o input type="number"
            document.getElementById('modalValorReceber').value = parseFloat(conta.valor).toFixed(2);
        }
    } else {
        // Modo Adicionar Novo
        document.getElementById('contaReceberModalLabel').textContent = 'Adicionar Nova Fatura';
        document.getElementById('contaReceberId').value = ''; // Limpa o ID para novo registro
    }
}


/**
 * Função principal que salva (cria ou edita) a conta a receber.
 */
function salvarContaReceber() {
    const id = document.getElementById('contaReceberId').value;
    const status = document.getElementById('modalStatusReceber').value;
    const tipo = document.getElementById('modalTipoReceber').value;
    const cliente = document.getElementById('modalClienteReceber').value;
    const descricao = document.getElementById('modalDescricaoReceber').value;
    const vencimento = document.getElementById('modalVencimentoReceber').value;
    // Pega o valor e garante que ele tenha 2 casas decimais e ponto como separador decimal
    const valorInput = document.getElementById('modalValorReceber').value;
    const valor = parseFloat(valorInput).toFixed(2);

    // Validação
    if (!status || !tipo || !cliente || !descricao || !vencimento || isNaN(valor) || parseFloat(valor) <= 0) {
        alert('Por favor, preencha todos os campos corretamente e garanta que o valor seja positivo.');
        return;
    }

    const novaConta = {
        id: id ? Number(id) : nextContaReceberId,
        status,
        tipo,
        cliente,
        descricao,
        vencimento,
        valor // Armazenamos o valor como string com ponto (Ex: '110.00') para fácil conversão
    };

    if (id) {
        // Edição
        const index = contasReceber.findIndex(c => c.id == id);
        if (index !== -1) {
            contasReceber[index] = novaConta;
        }
    } else {
        // Novo registro
        contasReceber.push(novaConta);
        nextContaReceberId++; // Incrementa o ID para o próximo novo registro
    }

    salvarNoLocalStorage();
    renderizarTabela();

    // Fecha o modal
    const modalElement = document.getElementById('contaReceberModal');
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.hide();
}


// ==================== INICIALIZAÇÃO ====================

function initPage() {
    // Implementação mock de logout (mantida para evitar erros de referência)
    const btnLogout = document.getElementById('btn_logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Logout simulado.');
            // Implementação real faria window.location.href = LOGIN_URL;
        });
    }

    // Informa o nome do usuário logado (usando o mock)
    const nomeUsuarioEl = document.getElementById('nomeUsuario');
    if (nomeUsuarioEl) {
        nomeUsuarioEl.innerHTML = usuarioCorrente.nome;
    }

    // Renderiza a tabela ao carregar a página
    renderizarTabela();
}

// Associa ao evento de carga da página a função de inicialização
window.addEventListener('load', initPage);