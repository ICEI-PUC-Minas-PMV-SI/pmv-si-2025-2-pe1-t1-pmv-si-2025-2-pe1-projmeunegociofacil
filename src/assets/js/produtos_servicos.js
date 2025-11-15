

// cria lista global no LocalStorage
// Mantenha esta parte para garantir que o LocalStorage exista
var db_produtosServicos = JSON.parse(localStorage.getItem('db_produtosServicos'));

// Função para carregar o JSON e inicializar o LocalStorage
async function inicializarCatalogo() {
  try {
    const response = await fetch('/src/assets/data/produtostest.json');
    const data = await response.json();

    window.catalogoProdutos = data.produtos; // Mantém para uso futuro, se necessário
    window.catalogoServicos = data.servicos; // Mantém para uso futuro, se necessário

    // VAMOS USAR UM OBJETO COMBINADO, já que o LocalStorage usa 'items'
    // Crie um array de itens combinando os dados
    const novosItens = [
        ...data.produtos.map(p => ({ ...p, tipo: 'Produto' })), // Assuma 'Produto'
        ...data.servicos.map(s => ({ ...s, tipo: 'Serviço' }))  // Assuma 'Serviço'
    ].map((item, index) => ({ // Adiciona ID sequencial
        id: index + 1,
        codigo: item.codigo || item.id_servico || item.id_produto, // Usa um campo de código/ID
        tipo: item.tipo,
        descricao: item.descricao || item.nome, // Usa um campo de descrição/nome
        unidade: item.unidade || 'UN' // Adiciona unidade padrão se não existir
    }));
    
    // Se o LocalStorage estiver vazio, use os dados do JSON para inicializar
    if (!db_produtosServicos || db_produtosServicos.items.length === 0) {
        db_produtosServicos = {
            items: novosItens
        };
        localStorage.setItem('db_produtosServicos', JSON.stringify(db_produtosServicos));
        console.log("LocalStorage inicializado com dados do JSON.");
    } else {
        console.log("LocalStorage já contém dados, pulando inicialização com JSON.");
    }

  } catch (error) {
    console.error("Erro ao carregar ou inicializar catálogo:", error);
  }
}

// =========================================
// INICIALIZAÇÃO DA TELA
// =========================================
async function initPage() { // Mudei para async para esperar o JSON
    document.getElementById('btn_logout').addEventListener('click', logoutUser);
    document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome;

    // 1. Carrega o JSON e inicializa o LocalStorage se estiver vazio
    await inicializarCatalogo(); 

    // 2. Carrega a tabela (agora com dados, se o LocalStorage estava vazio)
    carregarTabelaProdutosServicos();
}

window.addEventListener('load', initPage); // O listener agora executa a função async

// Remova a chamada solta: carregarCatalogo('./assets/data/produtos_servicos.json');


// =========================================
// CRUD COMPLETO
// =========================================

// ---- Lê o banco atualizado ----
function getDB() {
    return JSON.parse(localStorage.getItem('db_produtosServicos'));
}

// ---- Salva o banco inteiro ----
function saveDB(db) {
    localStorage.setItem('db_produtosServicos', JSON.stringify(db));
}


// =========================================
// LISTAGEM NA TABELA
// =========================================

function carregarTabelaProdutosServicos() {
    const tbody = document.querySelector('#tabelaProdutosServicos tbody');
    tbody.innerHTML = "";

    const db = getDB();

    db.items.forEach((item) => {
        const tr = document.createElement('tr');
        tr.id = `item-${item.id}`;
        tr.dataset.codigo = item.codigo;
        tr.dataset.tipo = item.tipo;
        tr.dataset.descricao = item.descricao;
        tr.dataset.unidade = item.unidade;

        tr.innerHTML = `
            <td>${item.codigo}</td>
            <td>${item.tipo}</td>
            <td>${item.descricao}</td>
            <td>${item.unidade}</td>
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


// =========================================
// MODAL - Abrir
// =========================================

function abrirModalProdutoServico(id) {
    document.getElementById('itemId').value = id || "";

    // Se for editar
    if (id) {
        const db = getDB();
        const item = db.items.find(x => x.id === id);

        document.getElementById('modalCodigo').value = item.codigo;
        document.getElementById('modalTipo').value = item.tipo;
        document.getElementById('modalDescricao').value = item.descricao;
        document.getElementById('modalUnidade').value = item.unidade;
    } else {
        // Novo item
        document.getElementById('modalCodigo').value = "";
        document.getElementById('modalTipo').value = "";
        document.getElementById('modalDescricao').value = "";
        document.getElementById('modalUnidade').value = "";
    }
}


// =========================================
// SALVAR (NOVO OU EDIÇÃO)
// =========================================

function salvarProdutoServico() {
    const id = document.getElementById('itemId').value;
    const codigo = document.getElementById('modalCodigo').value.trim();
    const tipo = document.getElementById('modalTipo').value;
    const descricao = document.getElementById('modalDescricao').value.trim();
    const unidade = document.getElementById('modalUnidade').value.trim();

    if (!codigo || !tipo || !descricao || !unidade) {
        alert("Preencha todos os campos!");
        return;
    }

    const db = getDB();

    // EDITAR
    if (id) {
        const index = db.items.findIndex(item => item.id == id);

        db.items[index].codigo = codigo;
        db.items[index].tipo = tipo;
        db.items[index].descricao = descricao;
        db.items[index].unidade = unidade;

    } else {
        // NOVO ITEM (ID AUTO)
        const novoId = db.items.length > 0 ? db.items[db.items.length - 1].id + 1 : 1;

        db.items.push({
            id: novoId,
            codigo,
            tipo,
            descricao,
            unidade
        });
    }

    saveDB(db);

    // Fecha modal
    var modal = bootstrap.Modal.getInstance(document.getElementById('produtoServicoModal'));
    modal.hide();

    carregarTabelaProdutosServicos();
}


// =========================================
// EXCLUIR
// =========================================

function excluirItem(id) {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    const db = getDB();

    db.items = db.items.filter(item => item.id !== id);

    saveDB(db);
    carregarTabelaProdutosServicos();
}

