import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js" 

// Joga a chamada da função em uma const para usar seus dados
const usuarioCorrente = loggedUser(); 

// VERIFICA LOGIN IMEDIATAMENTE (ANTES DA initPage)
// Agora usa o objeto retornado pela função
if (!usuarioCorrente || !usuarioCorrente.email_login) {
    if (typeof LOGIN_URL !== 'undefined') {
        window.location.href = LOGIN_URL;
    } else {
        console.error("Erro: LOGIN_URL não definida, não foi possível redirecionar.");
        // Se LOGIN_URL falhar, força o logout para evitar acesso não autorizado
        logoutUser(); 
    }
}

// =========================================================
// CORREÇÃO: Definição de ID Global
// Usa a propriedade 'id' ou 'email_login' do novo objeto usuarioCorrente
// =========================================================
const ID_LOGIN_GLOBAL = usuarioCorrente.id || usuarioCorrente.email_login; 
if (!ID_LOGIN_GLOBAL) {
    console.error("ID de usuário inválido. Forçando logout.");
    logoutUser();
}

// =========================================
// UTILIDADES (GET/SAVE DB)

// =========================================

/**
 * Lê o banco de dados atualizado do LocalStorage
 */
function getDB() {
    return JSON.parse(localStorage.getItem('db_produtosServicos')) || { items: [] };
}

/**
 * Salva o banco de dados inteiro no LocalStorage
 * @param {object} db O objeto do banco de dados a ser salvo
 */
function saveDB(db) {
    localStorage.setItem('db_produtosServicos', JSON.stringify(db));
}

// =========================================
// INICIALIZAÇÃO DO CATÁLOGO COM JSON
// ... (RESTANTE DO CÓDIGO DA FUNÇÃO inicializarCatalogo PERMANECE IGUAL)
// =========================================

/**
 * Carrega o JSON e inicializa o LocalStorage se estiver vazio.
 * Adiciona o id_login_global no primeiro carregamento.
 */
async function inicializarCatalogo() {
    // Tenta carregar o DB atual antes de buscar o JSON
    let db = getDB(); 

    // Verifica se precisa carregar o JSON (só se o banco de dados estiver vazio)
    if (db.items.length === 0) {
        try {
            // Caminho que a outra tela está usando.
            const response = await fetch('assets/data/maketesttemp.json'); 
            if (!response.ok) {
                // Se o JSON falhar, loga o erro e retorna o DB vazio
                console.error("Falha ao carregar JSON. Status:", response.status);
                return;
            }
            
            const data = await response.json();

            // 1. Mapeia e combina produtos e serviços
            const novosItens = [
                ...data.produtos.map(p => ({ 
                    ...p, 
                    tipo: 'Produto', 
                    // Adicionando campos específicos para Relatório/CRUD
                    valor: p.valor || 0, 
                    saldo: p.saldo || 0,
                    fornecedor: p.fornecedor || 'Geral' 
                })), 
                ...data.servicos.map(s => ({ 
                    ...s, 
                    tipo: 'Serviço', 
                    valor: s.valor || 0, // Serviço pode ter valor
                    saldo: 999, // Serviço geralmente tem saldo alto/infinito
                    fornecedor: s.fornecedor || 'Geral' 
                }))
            ].map((item, index) => ({ // Adiciona ID e associa ao usuário logado
                id: index + 1,
                codigo: item.codigo || item.id_servico || item.id_produto,
                tipo: item.tipo,
                descricao: item.descricao || item.nome,
                unidade: item.unidade || 'UN',
                valor: item.valor,
                saldo: item.saldo,
                fornecedor: item.fornecedor,
                // ASSOCIA O ITEM AO USUÁRIO LOGADO NO PRIMEIRO CARREGAMENTO
                id_login_global: ID_LOGIN_GLOBAL 
            }));
            
            db.items = novosItens;
            saveDB(db);
            console.log("LocalStorage inicializado com dados do JSON e associado ao usuário.");

        } catch (error) {
            console.error("Erro fatal ao carregar catálogo via JSON:", error);
        }
    } else {
        console.log("LocalStorage já contém dados, pulando inicialização com JSON.");
    }
}

// =========================================
// INICIALIZAÇÃO DA PÁGINA (ASYNC)
// =========================================

async function initPage() {

    document.getElementById('btn_logout').addEventListener('click', logoutUser);
    // usuarioCorrente.nome já está definido
    document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome || 'Usuário';

    await inicializarCatalogo(); 
  
    popularSelectFornecedores(getDB().items); // Popula o select após a inicialização
    // carrega a tabela (agora com dados, se nao ter nada no LocalStorage)
    carregarTabelaProdutosServicos();
    
    // CORREÇÃO: Adiciona listener para aplicar filtros ao mudar o select
    document.getElementById('tipoFiltro').addEventListener('change', aplicarFiltros);
    document.getElementById('fornecedorFiltro').addEventListener('change', aplicarFiltros);
    document.getElementById('produtosFiltro').addEventListener('input', aplicarFiltros); // Busca ao digitar
    document.getElementById('saldoFiltro').addEventListener('change', aplicarFiltros);

}

// =========================================
// FUNÇÕES DE FILTRO E CARREGAMENTO DA TABELA
// ... (RESTANTE DO CÓDIGO PERMANECE IGUAL)
// =========================================

/**
 * Preenche a tabela com os itens, aplicando os filtros se fornecidos.
    filtrando por ID_LOGIN_GLOBAL)
 * @param {Array<object>} [itensFiltrados=null] Array opcional de itens já filtrados.
 */
function carregarTabelaProdutosServicos(itensFiltrados = null) {
    const tbody = document.querySelector('#tabelaProdutosServicos tbody');
    tbody.innerHTML = "";

    const db = getDB();
    
    // Filtra os itens para exibir SOMENTE os do usuário logado
    const itensDoUsuario = db.items.filter(item => String(item.id_login_global) === String(ID_LOGIN_GLOBAL)); // Ajuste de comparação

    // Se itensFiltrados não for passado, usa a lista completa do usuário
    const itens = itensFiltrados || itensDoUsuario; 

    if (itens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum item encontrado.</td></tr>';
        return;
    }

    itens.forEach((item) => {
        const tr = document.createElement('tr');
        tr.dataset.id = item.id; 
        tr.dataset.tipo = item.tipo;

        // Formatação simples para valor
        const valorFormatado = (item.valor || 0).toFixed(2).replace('.', ',');

        tr.innerHTML = `
            <td>${item.codigo}</td>
            <td>${item.tipo}</td>
            <td>${item.descricao}</td>
            <td>${item.unidade}</td>
            <td>R$ ${valorFormatado}</td>
            <td>${item.saldo}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-1" data-bs-toggle="modal"
                        data-bs-target="#produtoServicoModal"
                        onclick="abrirModalProdutoServico(${item.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm"
                        onclick="excluirItem(${item.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

/**
 * Aplica os filtros e recarrega a tabela.
 */
function aplicarFiltros() {
    const db = getDB();
    // Inicia a filtragem apenas com os itens do usuário logado
    let itens = db.items.filter(item => String(item.id_login_global) === String(ID_LOGIN_GLOBAL)); // Ajuste de comparação

    const tipoFiltro = document.getElementById('tipoFiltro').value;
    const fornecedorFiltro = document.getElementById('fornecedorFiltro').value;
    const produtosFiltro = document.getElementById('produtosFiltro').value.toLowerCase().trim(); // Campo de texto para busca
    const saldoFiltro = document.getElementById('saldoFiltro').value;

    // Filtro 1: Tipo (Produto/Serviço)
    if (tipoFiltro && tipoFiltro !== 'Todos') {
        itens = itens.filter(item => item.tipo === tipoFiltro);
    }

    // Filtro 2: Fornecedor
    if (fornecedorFiltro && fornecedorFiltro !== 'Todos') {
        itens = itens.filter(item => item.fornecedor === fornecedorFiltro);
    }
    
    // Filtro 3: Produtos/Serviços (Busca na descrição ou código)
    if (produtosFiltro) {
        itens = itens.filter(item => 
            item.descricao.toLowerCase().includes(produtosFiltro) || 
            item.codigo.toLowerCase().includes(produtosFiltro)
        );
    }

    // Filtro 4: Saldo (Só aplica a verificação de saldo para 'Produto')
    if (saldoFiltro === 'Com Estoque') {
        itens = itens.filter(item => item.tipo === 'Serviço' || item.saldo > 0);
    } else if (saldoFiltro === 'Sem Estoque') {
        // Serviços não têm "sem estoque" nesse contexto, apenas produtos com saldo 0
        itens = itens.filter(item => item.tipo === 'Produto' && item.saldo === 0);
    }
    
    carregarTabelaProdutosServicos(itens);
}

/**
 * Popula o select de Fornecedores com base nos dados do DB.
 */
function popularSelectFornecedores(items) {
    const select = document.getElementById('fornecedorFiltro');
    // Limpa opções antigas, mantendo "Selecione o Fornecedor"
    select.innerHTML = '<option value="Todos">Selecione o Fornecedor</option>'; 
    
    // Filtra fornecedores APENAS dos itens do usuário logado
    const itensDoUsuario = items.filter(item => String(item.id_login_global) === String(ID_LOGIN_GLOBAL)); // Ajuste de comparação
    const fornecedores = [...new Set(itensDoUsuario.map(item => item.fornecedor).filter(f => f))].sort();

    fornecedores.forEach(fornecedor => {
        const option = document.createElement('option');
        option.value = fornecedor;
        option.textContent = fornecedor;
        select.appendChild(option);
    });
}


// =========================================
// CRUD - EDIÇÃO (U) E EXCLUSÃO (D)
    // com filtro por ID_LOGIN_GLOBAL)
// =========================================

/**
 * Abre o modal de edição 
 * @param {number} id ID do item a ser editado.
 */
function abrirModalProdutoServico(id) {
    document.getElementById('itemId').value = ''; // Limpa o ID
    document.getElementById('formProdutoServico').reset(); // Limpa o formulário
    
    const db = getDB();
    const item = db.items.find(x => x.id === id);
    
    // Ajuste de comparação de ID
    if (item && String(item.id_login_global) === String(ID_LOGIN_GLOBAL)) { 
        document.getElementById('itemId').value = id;
        document.getElementById('modalCodigo').value = item.codigo;
        document.getElementById('modalTipo').value = item.tipo;
        document.getElementById('modalDescricao').value = item.descricao;
        document.getElementById('modalUnidade').value = item.unidade;
        document.getElementById('modalValor').value = parseFloat(item.valor).toFixed(2); // Formata para 2 casas
        document.getElementById('modalSaldo').value = item.saldo; 
    } else {
        alert('Você não tem permissão para editar este item.');
        // Presumindo a existência do objeto bootstrap
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('produtoServicoModal'));
            if (modal) modal.hide();
        }
    }
}

/**
 * Salva as alterações feitas no modal 
 */
function salvarProdutoServico() {
    const id = parseInt(document.getElementById('itemId').value);
    const codigo = document.getElementById('modalCodigo').value.trim();
    const tipo = document.getElementById('modalTipo').value;
    const descricao = document.getElementById('modalDescricao').value.trim();
    const unidade = document.getElementById('modalUnidade').value.trim();
    const valorInput = document.getElementById('modalValor').value.replace(',', '.');
    const valor = parseFloat(valorInput);
    const saldo = parseInt(document.getElementById('modalSaldo').value);

    if (!codigo || !tipo || !descricao || !unidade || isNaN(valor) || isNaN(saldo)) {
        alert("Preencha todos os campos e verifique os valores numéricos!");
        return;
    }

    const db = getDB();
    // Filtra por ID do item E o ID do usuário (corrigido)
    const index = db.items.findIndex(item => item.id === id && String(item.id_login_global) === String(ID_LOGIN_GLOBAL)); 

    if (index !== -1) {
        db.items[index].codigo = codigo;
        db.items[index].tipo = tipo;
        db.items[index].descricao = descricao;
        db.items[index].unidade = unidade;
        db.items[index].valor = valor.toFixed(2); // Salva com 2 casas
        db.items[index].saldo = saldo;
        
        saveDB(db);
        
        // Presumindo a existência do objeto bootstrap
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modalElement = document.getElementById('produtoServicoModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }

        carregarTabelaProdutosServicos();
    } else {
        alert("Erro: Item não encontrado ou você não tem permissão para editar.");
    }
}

/**
 * Exclui um item (Exclusão - D)
 * @param {number} id ID do item a ser excluído.
 */
function excluirItem(id) {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    const db = getDB();
    
    // Filtra para remover o item, garantindo que é o item do usuário logado (usando o ID corrigido)
    db.items = db.items.filter(item => !(item.id === id && String(item.id_login_global) === String(ID_LOGIN_GLOBAL)));

    saveDB(db);
    carregarTabelaProdutosServicos();
}

// =====================================================================
// Expondo as funções ao escopo global (window)
// =====================================================================
window.excluirItem = excluirItem;
window.abrirModalProdutoServico = abrirModalProdutoServico;
window.salvarProdutoServico = salvarProdutoServico;

// Associa a função de inicialização ao evento de carga da página
window.addEventListener('load', initPage);