import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js";
// 1. Importando a função utilitária solicitada
import { newMyId } from "./utils.js";

// ==========================================
// 1. AUTENTICAÇÃO
// ==========================================
const usuarioCorrente = loggedUser();
if (!usuarioCorrente) {
    window.location.href = LOGIN_URL;
}

// ==========================================
// 2. INICIALIZAÇÃO
// ==========================================
const KEY_DB = 'clientesFornecedores';

// Expor funções globais para o HTML (onclick)
window.abrirModalClienteFornecedor = abrirModalClienteFornecedor;
window.salvarClienteFornecedor = salvarClienteFornecedor;
window.excluirClienteFornecedor = excluirClienteFornecedor;

window.addEventListener('load', initPage);

function initPage() {
    // Listener de busca
    const busca = document.getElementById('buscar-clientes');
    if(busca) {
        busca.addEventListener('input', renderizarTabela);
    }
    
    renderizarTabela();
}

// ==========================================
// 3. BANCO DE DADOS
// ==========================================
function getDB() {
    try {
        return JSON.parse(localStorage.getItem(KEY_DB)) || [];
    } catch {
        return [];
    }
}

function saveDB(data) {
    localStorage.setItem(KEY_DB, JSON.stringify(data));
}

// ==========================================
// 4. RENDERIZAÇÃO
// ==========================================
function renderizarTabela() {
    const tbody = document.querySelector('#tabelaClientesFornecedores tbody');
    if(!tbody) return;
    
    tbody.innerHTML = '';
    
    const termo = document.getElementById('buscar-clientes')?.value.toLowerCase() || '';
    const db = getDB();
    
    // Filtra por usuário E termo de busca
    const filtrados = db.filter(item => {
        if (Number(item.usuarioId) !== Number(usuarioCorrente.id)) return false;
        
        if (!termo) return true;
        
        return (item.nomeRazaoSocial || '').toLowerCase().includes(termo) ||
               (item.cpfCnpj || '').includes(termo);
    });

    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-3">Nenhum registro encontrado.</td></tr>';
        return;
    }

    filtrados.forEach(item => {
        const tipoFmt = (item.tipo || '').charAt(0).toUpperCase() + (item.tipo || '').slice(1);
        
        tbody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${item.meuId}</td>
                <td>${tipoFmt}</td>
                <td>${item.nomeRazaoSocial}</td>
                <td>${item.cpfCnpj}</td>
                <td>${item.telefone || '-'}</td>
                <td class="text-center">
                    <button class="btn btn-outline-primary btn-sm me-1" 
                        onclick="abrirModalClienteFornecedor(${item.meuId})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" 
                        onclick="excluirClienteFornecedor(${item.meuId})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

// ==========================================
// 5. CRUD (Modais)
// ==========================================

function abrirModalClienteFornecedor(id) {
    const form = document.getElementById('formClienteFornecedor');
    form.reset();
    
    // Garante que o campo Código esteja sempre desabilitado
    const campoCodigo = document.getElementById('modalCodigo');
    campoCodigo.disabled = true;

    document.getElementById('itemId').value = '';
    
    const titulo = document.getElementById('clienteFornecedorModalLabel');
    const db = getDB();

    // EDIÇÃO
    if (id) {
        titulo.textContent = 'Editar Cliente/Fornecedor';
        
        // Busca o item (Garante que pertence ao usuário)
        const item = db.find(i => i.meuId == id && i.usuarioId == usuarioCorrente.id);
        
        if (item) {
            document.getElementById('itemId').value = item.meuId;
            campoCodigo.value = item.meuId; // Preenche o código (desabilitado)
            document.getElementById('modalTipo').value = item.tipo;
            document.getElementById('modalNome').value = item.nomeRazaoSocial;
            document.getElementById('modalid').value = item.cpfCnpj;
            
            // Novos Campos
            document.getElementById('modalTelefone').value = item.telefone || '';
            document.getElementById('modalEmail').value = item.email || '';
            document.getElementById('modalEndereco').value = item.endereco || '';
        } else {
            alert("Registro não encontrado!");
            return; // Não abre o modal se der erro
        }
    } 
    // CRIAÇÃO (NOVO)
    else {
        titulo.textContent = 'Novo Cliente/Fornecedor';
        // 2. Usa newMyId passando o banco completo para gerar o próximo ID global ou da tabela
        const novoId = newMyId(db);
        campoCodigo.value = novoId; 
    }

    // Abre o modal manualmente se não estiver usando data-bs-toggle no botão HTML
    const modalEl = document.getElementById('clienteFornecedorModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

function salvarClienteFornecedor() {
    const id = document.getElementById('itemId').value; // ID oculto (vazio se novo)
    const codigoVisual = document.getElementById('modalCodigo').value; // ID visual
    
    const tipo = document.getElementById('modalTipo').value;
    const nome = document.getElementById('modalNome').value;
    const cpfCnpj = document.getElementById('modalid').value;
    
    // Novos Campos
    const telefone = document.getElementById('modalTelefone').value;
    const email = document.getElementById('modalEmail').value;
    const endereco = document.getElementById('modalEndereco').value;

    if (!tipo || !nome) {
        alert("Preencha os campos obrigatórios (Tipo e Nome).");
        return;
    }

    let db = getDB();

    if (id) {
        // --- EDIÇÃO ---
        const index = db.findIndex(i => i.meuId == id && i.usuarioId == usuarioCorrente.id);
        if (index !== -1) {
            // Atualiza os dados mantendo o ID original
            db[index].tipo = tipo;
            db[index].nomeRazaoSocial = nome;
            db[index].cpfCnpj = cpfCnpj;
            db[index].telefone = telefone;
            db[index].email = email;
            db[index].endereco = endereco;
        }
    } else {
        // --- CRIAÇÃO ---
        // O ID vem do campo visual que foi preenchido pelo newMyId na abertura do modal
        // Ou calculamos novamente aqui para segurança:
        const novoId = newMyId(db); 
        
        db.push({
            meuId: novoId,
            usuarioId: usuarioCorrente.id,
            tipo: tipo,
            nomeRazaoSocial: nome,
            cpfCnpj: cpfCnpj,
            telefone: telefone,
            email: email,
            endereco: endereco,
            tem_cnpj: (cpfCnpj.replace(/\D/g, '').length > 11), // Lógica simples
            contatoNome: null
        });
    }

    saveDB(db);
    renderizarTabela();
    
    // Fecha modal
    const el = document.getElementById('clienteFornecedorModal');
    const modal = bootstrap.Modal.getInstance(el);
    if(modal) modal.hide();
}

function excluirClienteFornecedor(id) {
    if(!confirm("Deseja excluir este registro?")) return;
    
    let db = getDB();
    db = db.filter(i => !(i.meuId == id && i.usuarioId == usuarioCorrente.id));
    saveDB(db);
    renderizarTabela();
}
initPage()