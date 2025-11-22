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

import { makeDecimal } from "./utils.js";

// =========================================
// 1. AUTENTICAÇÃO
// =========================================
const usuarioCorrente = loggedUser();
if (!usuarioCorrente) {
    window.location.href = '../index.html';
}

// =========================================
// 2. CONFIGURAÇÕES E DADOS
>>>>>>> f3a56a57c5d744b5799d55f2e8fd9356e0a3048d
// =========================================
const DB_KEY = 'produtosServicos';

function getDB() {
    try {
        const rawData = JSON.parse(localStorage.getItem(DB_KEY));
        // Suporte para array direto ou objeto { items: [] } (legado)
        if (rawData && Array.isArray(rawData)) return rawData;
        if (rawData && rawData.items && Array.isArray(rawData.items)) return rawData.items;
        return [];
    } catch (e) {
        console.error("Erro ao ler banco:", e);
        return [];
    }
}

// =========================================
<<<<<<< HEAD
// INICIALIZAÇÃO DO CATÁLOGO COM JSON
// ... (RESTANTE DO CÓDIGO DA FUNÇÃO inicializarCatalogo PERMANECE IGUAL)
=======
// 3. INICIALIZAÇÃO
>>>>>>> f3a56a57c5d744b5799d55f2e8fd9356e0a3048d
// =========================================

function initPage() {
    const btnFiltrar = document.getElementById('btn-filtrar');
    if(btnFiltrar) {
        btnFiltrar.addEventListener('click', aplicarFiltros);
    }
<<<<<<< HEAD
=======
    
    // Listeners para filtros em tempo real
    document.getElementById('filtroBusca').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroTipo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroSaldo').addEventListener('change', aplicarFiltros);

    aplicarFiltros();
>>>>>>> f3a56a57c5d744b5799d55f2e8fd9356e0a3048d
}

// =========================================
// 4. LÓGICA DE FILTRO E RENDERIZAÇÃO
// =========================================

<<<<<<< HEAD
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
=======
function normalizarTexto(texto) {
    if (!texto) return "";
    return String(texto)
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, ""); 
}

function aplicarFiltros(event) {
    if(event && event.type === 'click') event.preventDefault();

    const db = getDB();
    
    // 1. Filtra pelo USUÁRIO LOGADO
    let itens = db.filter(item => String(item.usuarioId) === String(usuarioCorrente.id));
>>>>>>> f3a56a57c5d744b5799d55f2e8fd9356e0a3048d

    const termoBusca = normalizarTexto(document.getElementById('filtroBusca').value);
    const tipoSelecionado = document.getElementById('filtroTipo').value; 
    const saldoSelecionado = document.getElementById('filtroSaldo').value;

    // 2. Filtro por Texto (Nome, Código ou Referência)
    if (termoBusca) {
        itens = itens.filter(item => {
            const desc = normalizarTexto(item.descricao);
            const cod = normalizarTexto(item.meuId); // Usando meuId como código principal
            const ref = normalizarTexto(item.referencia);
            const bar = normalizarTexto(item.codigoBarras);
            
            return desc.includes(termoBusca) || 
                   cod.includes(termoBusca) || 
                   ref.includes(termoBusca) || 
                   bar.includes(termoBusca);
        });
    }

    // 3. Filtro por Tipo (Produto/Serviço)
    if (tipoSelecionado !== 'Todos') {
        itens = itens.filter(item => {
            const tipoItem = normalizarTexto(item.tipo); 
            const tipoFiltro = normalizarTexto(tipoSelecionado);
            return tipoItem === tipoFiltro;
        });
    }

    // 4. Filtro por Saldo/Estoque
    if (saldoSelecionado === 'Em Estoque') {
        itens = itens.filter(item => Number(item.estoqueAtual) > 0);
    } else if (saldoSelecionado === 'Sem Estoque') {
        // Mostra itens zerados ou negativos APENAS se for produto.
        itens = itens.filter(item => {
            const isProduto = normalizarTexto(item.tipo) === 'produto';
            const estoque = Number(item.estoqueAtual);
            return isProduto && estoque <= 0;
        });
    }

    renderizarTabela(itens);
}

function renderizarTabela(listaItens) {
    const tbody = document.querySelector('#tabelaProdutosServicos tbody');
    if(!tbody) return;
    
    tbody.innerHTML = "";

    if (listaItens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-3">Nenhum registro encontrado.</td></tr>';
        return;
    }

    listaItens.forEach(item => {
        const tr = document.createElement('tr');
        
        const codigo = item.meuId || '-';
        const tipoDisplay = item.tipo ? item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1) : '-';
        const desc = item.descricao || '-';
        const unid = item.unidade || '-';
        
        // CORREÇÃO: Campo correto do JSON é precoVenda
        const valor = makeDecimal(item.precoVenda || 0); 
        
        // Estoque
        let estoque = item.estoqueAtual;
        
        // Se for serviço, mostra "-" no estoque
        if (normalizarTexto(item.tipo) === 'servico') {
            estoque = '-'; 
        } else if (estoque === null || estoque === undefined) {
            estoque = 0;
        }

        tr.innerHTML = `
<<<<<<< HEAD
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
=======
            <td>${codigo}</td>
            <td>${tipoDisplay}</td>
            <td>${desc}</td>
            <td class="text-center">${unid}</td>
            <td class="text-end">R$ ${valor}</td>
            <td class="text-center">${estoque}</td>
>>>>>>> f3a56a57c5d744b5799d55f2e8fd9356e0a3048d
        `;
        tbody.appendChild(tr);
    });
}

<<<<<<< HEAD
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
=======
// Inicializa apenas após o carregamento completo (garante que o HTML existe)
// Se estiver usando ajax-worker, pode ser necessário chamar initPage() diretamente no final também
window.addEventListener('load', initPage);
initPage(); // Descomente se necessário para forçar execução imediata no SPA
>>>>>>> f3a56a57c5d744b5799d55f2e8fd9356e0a3048d
