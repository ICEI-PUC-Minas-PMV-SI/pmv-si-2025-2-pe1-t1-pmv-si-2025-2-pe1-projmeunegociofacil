import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js";
import { newMyId, makeDecimal } from "./utils.js";

// =========================================================
// 1. AUTENTICAÇÃO
// =========================================================
const usuarioCorrente = loggedUser();

if (!usuarioCorrente || !usuarioCorrente.email_login) {
    window.location.href = LOGIN_URL;
}

const KEY_DB = 'produtosServicos';

// =========================================================
// 2. BANCO DE DADOS
// =========================================================

function getDB() {
    // Tenta pegar o array direto, se não conseguir, tenta pegar objeto com .items (legado)
    try {
        const data = JSON.parse(localStorage.getItem(KEY_DB));
        if (Array.isArray(data)) return data;
        if (data && data.items) return data.items;
        return [];
    } catch {
        return [];
    }
}

function saveDB(db) {
    localStorage.setItem(KEY_DB, JSON.stringify(db));
}

// =========================================================
// 3. INICIALIZAÇÃO
// =========================================================

async function initPage() {
    document.getElementById('btn_logout').addEventListener('click', logoutUser);
    document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome;

    // Configura busca
    const inputBusca = document.querySelector('input[placeholder="Buscar"]');
    if (inputBusca) {
        inputBusca.addEventListener('input', carregarTabelaProdutosServicos);
    }

    carregarTabelaProdutosServicos();
}

// =========================================================
// 4. CRUD
// =========================================================

function carregarTabelaProdutosServicos() {
    const tbody = document.querySelector('#tabelaProdutosServicos tbody');
    if (!tbody) return;
    tbody.innerHTML = "";

    const db = getDB();
    const termo = document.querySelector('input[placeholder="Buscar"]')?.value.toLowerCase() || '';

    // Filtra por USUÁRIO e BUSCA
    const itensUsuario = db.filter(item => {
        const isUser = String(item.usuarioId) === String(usuarioCorrente.id);
        if (!isUser) return false;

        if (termo) {
            const desc = (item.descricao || '').toLowerCase();
            const cod = String(item.meuId || '').toLowerCase();
            return desc.includes(termo) || cod.includes(termo);
        }
        return true;
    });

    if (itensUsuario.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-3">Nenhum registro encontrado.</td></tr>';
        return;
    }

    itensUsuario.forEach((item) => {
        const tr = document.createElement('tr');

        const codigo = item.meuId || item.id || '-';
        const preco = makeDecimal(item.precoVenda || 0);
        const estoque = item.tipo === 'servico' ? '-' : (item.estoqueAtual !== undefined ? item.estoqueAtual : item.estoqueInicial);

        tr.innerHTML = `
            <td>${codigo}</td>
            <td>${item.tipo ? item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1) : '-'}</td>
            <td>${item.descricao}</td>
            <td>${item.unidade || '-'}</td>
            <td>R$ ${preco}</td> 
            <td>${estoque}</td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-1" 
                        onclick="abrirModalProdutoServico(${codigo})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm"
                        onclick="excluirItem(${codigo})">
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

    // Bloqueia edição do código
    const campoCodigo = document.getElementById('modalCodigo');
    campoCodigo.disabled = true;

    // EDIÇÃO
    if (id) {
        modalTitle.textContent = 'Editar Item';
        const db = getDB();
        const item = db.find(x => (x.meuId == id || x.id == id) && String(x.usuarioId) === String(usuarioCorrente.id));

        if (item) {
            campoCodigo.value = item.meuId || item.id;
            document.getElementById('modalTipo').value = item.tipo; // produto ou servico
            document.getElementById('modalDescricao').value = item.descricao;
            document.getElementById('modalUnidade').value = item.unidade;

            document.getElementById('modalPrecoVenda').value = item.precoVenda;
            document.getElementById('modalPrecoCusto').value = item.precoCusto;
            document.getElementById('modalEstoqueInicial').value = item.estoqueAtual !== undefined ? item.estoqueAtual : item.estoqueInicial;
        }
    }
    // NOVO
    else {
        modalTitle.textContent = 'Adicionar Novo Item';
        const db = getDB();
        campoCodigo.value = newMyId(db);
    }

    // Abre modal
    const el = document.getElementById('produtoServicoModal');
    if (el) {
        const modal = bootstrap.Modal.getOrCreateInstance(el);
        modal.show();
    }
}

function salvarProdutoServico() {
    const id = document.getElementById('itemId').value; // Oculto
    const codigoVisual = document.getElementById('modalCodigo').value; // Visual (Disabled)

    const tipo = document.getElementById('modalTipo').value;
    const descricao = document.getElementById('modalDescricao').value.trim();
    const unidade = document.getElementById('modalUnidade').value.trim();

    const precoVenda = parseFloat(document.getElementById('modalPrecoVenda').value) || 0;
    const precoCusto = parseFloat(document.getElementById('modalPrecoCusto').value) || 0;
    const estoque = parseInt(document.getElementById('modalEstoqueInicial').value) || 0;

    if (!tipo || !descricao || !unidade) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    let db = getDB();

    if (id) {
        // EDITAR
        const index = db.findIndex(item => (item.meuId == id || item.id == id) && String(item.usuarioId) === String(usuarioCorrente.id));

        if (index !== -1) {
            db[index].tipo = tipo;
            db[index].descricao = descricao;
            db[index].unidade = unidade;
            db[index].precoVenda = precoVenda;
            db[index].precoCusto = precoCusto;
            db[index].estoqueAtual = estoque; // Atualiza estoque atual
        }
    } else {
        // NOVO
        const novoId = newMyId(db);

        db.push({
            meuId: novoId,
            id: novoId, // Compatibilidade
            usuarioId: usuarioCorrente.id, // VÍNCULO DE SEGURANÇA
            tipo, // produto ou servico
            descricao,
            unidade,
            precoVenda,
            precoCusto,
            estoqueInicial: estoque,
            estoqueAtual: estoque
        });
    }

    saveDB(db);

    const el = document.getElementById('produtoServicoModal');
    const modal = bootstrap.Modal.getInstance(el);
    if (modal) modal.hide();

    carregarTabelaProdutosServicos();
}

function excluirItem(id) {
    if (!confirm("Tem certeza que deseja excluir este item?")) return;

    let db = getDB();
    db = db.filter(item => !((item.meuId == id || item.id == id) && String(item.usuarioId) === String(usuarioCorrente.id)));

    saveDB(db);
    carregarTabelaProdutosServicos();
}

// Expõe globalmente
window.abrirModalProdutoServico = abrirModalProdutoServico;
window.salvarProdutoServico = salvarProdutoServico;
window.excluirItem = excluirItem;

initPage()