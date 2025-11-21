import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js"; 

// Joga a chamada da função em uma const para usar seus dados
const usuarioCorrente = loggedUser(); 

// Verifica login: Agora usa o objeto retornado pela função
if (!usuarioCorrente || !usuarioCorrente.email_login) {
  window.location.href = LOGIN_URL;
}

// Variável global para o ID do usuário logado (mantida por consistência)
const ID_LOGIN_GLOBAL = usuarioCorrente.id_login_global; 

// ===================================================
//                PERSISTÊNCIA E INICIALIZAÇÃO
// ===================================================

// Funções para gerenciar o LocalStorage (Fonte única de verdade)
function getDB() {
    // Garante que o LocalStorage retorne um objeto válido para acessar .items
    return JSON.parse(localStorage.getItem('db_produtosServicos')) || { items: [] };
}

function saveDB(db) {
    localStorage.setItem('db_produtosServicos', JSON.stringify(db));
}

// Função para carregar o JSON e inicializar o LocalStorage
async function inicializarCatalogo() {
  try {
    const response = await fetch('/src/assets/data/maketest.json');
    
    if (!response.ok) {
        throw new Error(`Falha ao carregar o JSON: Status ${response.status}`);
    }

    const data = await response.json();

    // =========================================================
    // CORREÇÃO: Usar a chave 'produtosServicos' e filtrar
    // =========================================================
    // 1. Acessa a chave correta ou usa um array vazio se ela não existir
    const todosItens = (data.produtosServicos && Array.isArray(data.produtosServicos)) 
                        ? data.produtosServicos : [];

    // 2. Filtra os itens em 'produtos' e 'servicos' separadamente
    const produtos = todosItens.filter(item => item.tipo === 'produto');
    const servicos = todosItens.filter(item => item.tipo === 'servico');

    // 3. Cria um array de itens combinando os dados processados
    const novosItens = [
        ...produtos.map(p => ({ 
            ...p, 
            tipo: 'Produto', // Padroniza tipo para maiúscula
            // Define 'codigo' usando o campo mais relevante do produto
            codigo: p.referencia || p.codigoBarras || p.meuId.toString()
        })), 
        ...servicos.map(s => ({ 
            ...s, 
            tipo: 'Serviço', // Padroniza tipo para maiúscula
            // Define 'codigo' usando o campo mais relevante do serviço
            codigo: s.meuId.toString() || s.referencia
        }))  
    ].map((item, index) => ({ 
        id: index + 1, // Recalcula ID sequencial e único
        codigo: String(item.codigo || index + 1), // Garante que o código seja uma string
        tipo: item.tipo,
        descricao: item.descricao || item.nome, 
        unidade: item.unidade || 'UN' 
    }));
    // =========================================================
    
    let db = getDB(); // Usa a função para ler o banco atual

    // Usando os dados do JSON apenas se o LocalStorage estiver vazio
    if (!db.items || db.items.length === 0) {
        db = {
            items: novosItens
        };
        saveDB(db);
        console.log("LocalStorage inicializado com dados do JSON.");
    } else {
        console.log("LocalStorage já contém dados, pulando inicialização com JSON.");
    }

  } catch (error) {
    console.error("Erro ao carregar ou inicializar catálogo:", error);
  }
}


// ===================================================
//                INICIALIZAÇÃO DA PÁGINA
// ===================================================

async function initPage() { 
    // Autenticação e cabeçalho
    document.getElementById('btn_logout').addEventListener('click', logoutUser);
    document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome;

    // Carrega/inicializa o catálogo
    await inicializarCatalogo(); 

    // Carrega a tabela
    carregarTabelaProdutosServicos();
}

// ===================================================
//                CRUD COMPLETO
// ===================================================

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

function abrirModalProdutoServico(id) {
    document.getElementById('itemId').value = id || "";
    const modalTitle = document.getElementById('produtoServicoModalLabel');
    const form = document.getElementById('formProdutoServico');
    form.reset();

    // Se for editar
    if (id) {
        modalTitle.textContent = 'Editar Item';
        const db = getDB();
        const item = db.items.find(x => x.id === id); 

        if (item) {
            document.getElementById('modalCodigo').value = item.codigo;
            document.getElementById('modalTipo').value = item.tipo;
            document.getElementById('modalDescricao').value = item.descricao;
            document.getElementById('modalUnidade').value = item.unidade;
        }
    } else {
        modalTitle.textContent = 'Adicionar Novo Item';
    }
}

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
        
        if (index !== -1) { 
            db.items[index].codigo = codigo;
            db.items[index].tipo = tipo;
            db.items[index].descricao = descricao;
            db.items[index].unidade = unidade;
        } else {
             alert("Erro: Item de ID não encontrado para edição.");
             return;
        }

    } else {
        // NOVO ITEM (ID AUTO)
        // Calcula o novo ID baseado no maior ID existente para evitar duplicidade
        const newId = db.items.length > 0 ? Math.max(...db.items.map(i => i.id)) + 1 : 1; 
        
        db.items.push({
            id: newId,
            codigo,
            tipo,
            descricao,
            unidade
        });
    }

    saveDB(db);

    // Fecha modal (presume a existência de Bootstrap)
    var modal = bootstrap.Modal.getInstance(document.getElementById('produtoServicoModal'));
    if(modal) modal.hide();

    carregarTabelaProdutosServicos();
}

function excluirItem(id) {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    const db = getDB();

    db.items = db.items.filter(item => item.id !== id);

    saveDB(db);
    carregarTabelaProdutosServicos();
}

// ===================================================
//                CORREÇÃO DE ESCOPO GLOBAL
// ===================================================

// Expõe as funções ao escopo 'window' para que o HTML (onclick) possa chamá-las.
window.abrirModalProdutoServico = abrirModalProdutoServico;
window.salvarProdutoServico = salvarProdutoServico;
window.excluirItem = excluirItem;

// Inicia a página após o carregamento
window.addEventListener('load', initPage);