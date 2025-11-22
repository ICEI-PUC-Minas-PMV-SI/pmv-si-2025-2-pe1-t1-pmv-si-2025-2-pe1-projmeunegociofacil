import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js"; 

// =========================================================
// VARIÁVEIS GLOBAIS E AUTENTICAÇÃO (RF-08 CORRIGIDA)
// =========================================================

// Joga a chamada da função em uma const para usar seus dados
const usuarioCorrente = loggedUser(); 

// Verifica login: Agora usa o objeto retornado pela função
if (!usuarioCorrente || !usuarioCorrente.email_login) {
  window.location.href = LOGIN_URL;
}

// Variável global ID_LOGIN_GLOBAL removida para evitar erro fatal (RF-08)
// Você deve usar 'usuarioCorrente.algumIdValido' ou 'usuarioCorrente.email_login' se precisar de um ID.


// =========================================================
// INICIALIZAÇÃO E GERENCIAMENTO DO BANCO DE DADOS (RF-04 CORRIGIDA)
// =========================================================

// Função para gerenciar o LocalStorage 
function getDB() {
    // Garante que o LocalStorage retorne um objeto válido para acessar .items
    return JSON.parse(localStorage.getItem('produtosServicos')) || { items: [] };
}

// CHAVE CORRIGIDA de 'db_produtosServicos' para 'produtosServicos'
function saveDB(db) {
    localStorage.setItem('produtosServicos', JSON.stringify(db));
}

// Função para carregar o JSON e inicializar o LocalStorage
async function inicializarCatalogo() {
  try {
    const response = await fetch('/src/assets/data/maketest.json');
    
    if (!response.ok) {
        throw new Error(`Falha ao carregar o JSON: Status ${response.status}`);
    }

    const data = await response.json();

    // Filtra os itens em 'produtos' e 'servicos'
    const todosItens = (data.produtosServicos && Array.isArray(data.produtosServicos)) 
                        ? data.produtosServicos : [];

    const produtos = todosItens.filter(item => item.tipo === 'produto');
    const servicos = todosItens.filter(item => item.tipo === 'servico');

    // Cria um array de itens combinando os dados processados
    // Adicionei valores padrão para os novos campos (RF-04)
    const novosItens = [
        ...produtos.map(p => ({ 
            ...p, 
            tipo: 'Produto',
            codigo: p.referencia || p.codigoBarras || p.meuId.toString(),
            precoVenda: p.preco || 0, // Novo campo
            precoCusto: p.custo || 0,  // Novo campo
            estoqueInicial: p.estoque || 0 // Novo campo
        })), 
        ...servicos.map(s => ({ 
            ...s, 
            tipo: 'Serviço',
            codigo: s.meuId.toString() || s.referencia,
            precoVenda: s.preco || 0, // Novo campo
            precoCusto: s.custo || 0,  // Novo campo
            estoqueInicial: 0 // Serviço geralmente não tem estoque
        }))  
    ].map((item, index) => ({ 
        id: index + 1,
        codigo: String(item.codigo || index + 1),
        tipo: item.tipo,
        descricao: item.descricao || item.nome, 
        unidade: item.unidade || 'UN',
        precoVenda: item.precoVenda, // Mapeado
        precoCusto: item.precoCusto, // Mapeado
        estoqueInicial: item.estoqueInicial // Mapeado
    }));
    
    let db = getDB(); // Usa a função para ler o banco atual (já corrigida)

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


// =========================================================
// INICIALIZAÇÃO DA PÁGINA
// =========================================================

async function initPage() { 
    // Autenticação e cabeçalho
    document.getElementById('btn_logout').addEventListener('click', logoutUser);
    document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome;

    // Carrega/inicializa o catálogo
    await inicializarCatalogo(); 

    // Carrega a tabela
    carregarTabelaProdutosServicos();
}


// =========================================================
// CRUD COMPLETO (RF-04 CORRIGIDA)
// =========================================================

function carregarTabelaProdutosServicos() {
    const tbody = document.querySelector('#tabelaProdutosServicos tbody');
    tbody.innerHTML = "";

    const db = getDB();

    db.items.forEach((item) => {
        const tr = document.createElement('tr');
        tr.id = `item-${item.id}`;
        
        // Adiciona novos datasets (opcional, mas bom para rastreamento)
        tr.dataset.codigo = item.codigo;
        tr.dataset.tipo = item.tipo;
        tr.dataset.descricao = item.descricao;
        tr.dataset.unidade = item.unidade;
        tr.dataset.precoVenda = item.precoVenda;
        tr.dataset.precoCusto = item.precoCusto;
        tr.dataset.estoqueInicial = item.estoqueInicial;

        tr.innerHTML = `
            <td>${item.codigo}</td>
            <td>${item.tipo}</td>
            <td>${item.descricao}</td>
            <td>${item.unidade}</td>
            <td>R$ ${item.precoVenda.toFixed(2)}</td> 
            <td>${item.estoqueInicial}</td>
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
            
            // Novos campos (RF-04)
            document.getElementById('modalPrecoVenda').value = item.precoVenda;
            document.getElementById('modalPrecoCusto').value = item.precoCusto;
            document.getElementById('modalEstoqueInicial').value = item.estoqueInicial;
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
    
    // Novos campos (RF-04)
    const precoVenda = parseFloat(document.getElementById('modalPrecoVenda').value) || 0;
    const precoCusto = parseFloat(document.getElementById('modalPrecoCusto').value) || 0;
    const estoqueInicial = parseInt(document.getElementById('modalEstoqueInicial').value) || 0;


    // Validação com os novos campos obrigatórios (RF-04)
    if (!codigo || !tipo || !descricao || !unidade || 
        isNaN(precoVenda) || isNaN(precoCusto) || isNaN(estoqueInicial) ) {
        alert("Preencha todos os campos obrigatórios: Código, Tipo, Descrição, Unidade, Preço de Venda, Preço de Custo e Estoque Inicial.");
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
            // Salva novos campos
            db.items[index].precoVenda = precoVenda;
            db.items[index].precoCusto = precoCusto;
            db.items[index].estoqueInicial = estoqueInicial;
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
            unidade,
            // Adiciona novos campos
            precoVenda,
            precoCusto,
            estoqueInicial
        });
    }

    saveDB(db);

    // Fecha modal 
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

// Expõe as funções ao escopo 'window' para que o HTML (onclick) possa chamá-las.
window.abrirModalProdutoServico = abrirModalProdutoServico;
window.salvarProdutoServico = salvarProdutoServico;
window.excluirItem = excluirItem;

// Inicia a página após o carregamento
window.addEventListener('load', initPage);