import { loggedUser, logoutUser } from "./auth.js";
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
// 3. INICIALIZAÇÃO
// =========================================

function initPage() {
    const btnFiltrar = document.getElementById('btn-filtrar');
    if(btnFiltrar) {
        btnFiltrar.addEventListener('click', aplicarFiltros);
    }
    
    // Listeners para filtros em tempo real
    document.getElementById('filtroBusca').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroTipo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroSaldo').addEventListener('change', aplicarFiltros);

    aplicarFiltros();
}

// =========================================
// 4. LÓGICA DE FILTRO E RENDERIZAÇÃO
// =========================================

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
            <td>${codigo}</td>
            <td>${tipoDisplay}</td>
            <td>${desc}</td>
            <td class="text-center">${unid}</td>
            <td class="text-end">R$ ${valor}</td>
            <td class="text-center">${estoque}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Inicializa apenas após o carregamento completo (garante que o HTML existe)
// Se estiver usando ajax-worker, pode ser necessário chamar initPage() diretamente no final também
window.addEventListener('load', initPage);
initPage(); // Descomente se necessário para forçar execução imediata no SPA