import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js";
import { makeDecimal } from "./utils.js"; 

const usuarioCorrente = loggedUser();
if (!usuarioCorrente) {
    window.location.href = LOGIN_URL;
}

let listaUnificada = []; 

window.addEventListener('load', initPage);

function initPage() {
    const btnFiltrar = document.getElementById('btnFiltrarFinanceiro');
    if(btnFiltrar) btnFiltrar.addEventListener('click', aplicarFiltros);

    carregarDadosReais();
    
    preencherFiltroPessoas();
    
    renderizarTabela(listaUnificada);
    atualizarGrafico(listaUnificada);
}

// =========================================================
// 3. LEITURA E NORMALIZAÇÃO DE DADOS
// =========================================================

function carregarDadosReais() {
    const contasReceber = JSON.parse(localStorage.getItem('contasReceber')) || [];
    const contasPagar = JSON.parse(localStorage.getItem('contasPagar')) || [];
    const clientes = JSON.parse(localStorage.getItem('clientesFornecedores')) || [];

    const minhasReceitas = contasReceber.filter(c => c.usuarioId === usuarioCorrente.id);
    const minhasDespesas = contasPagar.filter(c => c.usuarioId === usuarioCorrente.id);

    // --- RECEITAS ---
    const receitasNormalizadas = minhasReceitas.map(r => {
        let nomePessoa = "Consumidor Final";
        
        // Ajuste para estrutura nova (Objeto) ou antiga (ID)
        if (r.clientes_fornecedoresId || r.clientesFornecedoresMeuId) {
            const idCli = r.clientes_fornecedoresId || 
                          (typeof r.clientesFornecedoresMeuId === 'object' ? r.clientesFornecedoresMeuId.meuId : r.clientesFornecedoresMeuId);
            
            const cli = clientes.find(c => c.meuId == idCli && c.usuarioId === usuarioCorrente.id);
            if(cli) nomePessoa = cli.nomeRazaoSocial;
        }

        // Prioridade Valor
        let valorFinal = 0;
        if (r.valorComDesconto !== undefined) valorFinal = r.valorComDesconto;
        else if (r.valor !== undefined) valorFinal = r.valor;

        return {
            origem: 'receber',
            id: r.meuId,
            // Prioridade Data
            data: r.data_pagamento || r.data_vencimento || new Date().toISOString(),
            pessoa: nomePessoa,
            status: r.status || 'pago', 
            descricao: r.descricao || `Venda #${r.meuId}`,
            valor: Number(valorFinal)
        };
    });

    // --- DESPESAS ---
    const despesasNormalizadas = minhasDespesas.map(d => {
        let nomePessoa = "Fornecedor Diverso";
        
        if (d.clientes_fornecedoresId) {
            const idCli = d.clientes_fornecedoresId;
            const cli = clientes.find(c => c.meuId == idCli && c.usuarioId === usuarioCorrente.id);
            if(cli) nomePessoa = cli.nomeRazaoSocial;
        }

        let valorFinal = 0;
        if (d.valorComDesconto !== undefined) valorFinal = d.valorComDesconto;
        else if (d.valor !== undefined) valorFinal = d.valor;

        return {
            origem: 'pagar',
            id: d.meuId,
            data: d.data_pagamento || d.data_vencimento || new Date().toISOString(),
            pessoa: nomePessoa,
            status: d.status || 'pago',
            descricao: d.descricao || `Conta #${d.meuId}`,
            valor: Number(valorFinal)
        };
    });

    listaUnificada = [...receitasNormalizadas, ...despesasNormalizadas];
    listaUnificada.sort((a, b) => new Date(b.data) - new Date(a.data));
}

// =========================================================
// 4. FILTROS
// =========================================================

function preencherFiltroPessoas() {
    const select = document.getElementById('filtroPessoa');
    if (!select) return;

    const nomes = [...new Set(listaUnificada.map(item => item.pessoa))].sort();
    
    let html = '<option value="">Todos</option>';
    nomes.forEach(nome => {
        if(nome) html += `<option value="${nome}">${nome}</option>`;
    });
    select.innerHTML = html;
}

function aplicarFiltros(e) {
    if(e) e.preventDefault();

    const inicio = document.getElementById('filtroInicio').value;
    const fim = document.getElementById('filtroFim').value;
    const status = document.getElementById('filtroStatus').value.toLowerCase();
    const tipo = document.getElementById('filtroTipo').value;
    const pessoa = document.getElementById('filtroPessoa').value;

    let filtrados = listaUnificada.filter(item => {
        if (inicio && item.data < inicio) return false;
        if (fim && item.data > fim) return false;
        if (status && !item.status.toLowerCase().includes(status)) return false;
        if (tipo && item.origem !== tipo) return false;
        if (pessoa && item.pessoa !== pessoa) return false;
        return true;
    });

    renderizarTabela(filtrados);
    atualizarGrafico(filtrados);
}

// =========================================================
// 5. RENDERIZAÇÃO DA TABELA
// =========================================================

function renderizarTabela(lista) {
    const tbody = document.getElementById('corpoRelFinanceiro');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center p-3 text-muted">Nenhum registro encontrado.</td></tr>';
        return;
    }

    lista.forEach(item => {
        const tr = document.createElement('tr');
        
        const dataObj = new Date(item.data);
        const dataFmt = isNaN(dataObj) ? '-' : dataObj.toLocaleDateString('pt-BR', {timeZone: 'UTC'});
        const valorFmt = makeDecimal(item.valor);
        
        const corValor = item.origem === 'receber' ? 'text-success' : 'text-danger';
        const sinal = item.origem === 'receber' ? '+' : '-';
        
        const badgeTipo = item.origem === 'receber' 
            ? '<span class="badge bg-success text-white">Receita</span>' 
            : '<span class="badge bg-danger text-white">Despesa</span>';
        
        const statusFmt = item.status.charAt(0).toUpperCase() + item.status.slice(1);

        tr.innerHTML = `
            <td>${dataFmt}</td>
            <td><span class="fw-bold">${item.pessoa}</span></td>
            <td>${statusFmt}</td>
            <td class="text-muted small">${item.descricao}</td>
            <td class="${corValor} fw-bold" style="white-space: nowrap;">${sinal} R$ ${valorFmt}</td>
            <td class="text-center">${badgeTipo}</td>
        `;
        tbody.appendChild(tr);
    });
}

// =========================================================
// 6. RENDERIZAÇÃO DO GRÁFICO SVG
// =========================================================

function atualizarGrafico(dados) {
    const receitasPorMes = Array(12).fill(0);
    const despesasPorMes = Array(12).fill(0);

    dados.forEach(item => {
        const data = new Date(item.data);
        if (!isNaN(data)) {
            const mes = data.getUTCMonth(); 
            if (item.origem === 'receber') {
                receitasPorMes[mes] += item.valor;
            } else {
                despesasPorMes[mes] += item.valor;
            }
        }
    });

    const Y_ZERO = 312;
    const Y_MAX = 0;
    const VALOR_MAX = 10000; 
    const PIXELS_POR_REAL = Y_ZERO / VALOR_MAX; 
    
    const X_START = 0;
    const X_STEP = 83; 

    const calcY = (valor) => {
        let v = valor > VALOR_MAX ? VALOR_MAX : valor;
        return Y_ZERO - (v * PIXELS_POR_REAL);
    };

    let ptsRec = "";
    let ptsDesp = "";
    let htmlCirclesRec = "";
    let htmlCirclesDesp = "";

    for (let i = 0; i < 12; i++) {
        const x = X_START + (i * X_STEP);
        
        const yRec = calcY(receitasPorMes[i]);
        ptsRec += `${x},${yRec} `;
        htmlCirclesRec += `<circle cx="${x}" cy="${yRec}" r="4"><title>Mês ${i+1}: R$ ${makeDecimal(receitasPorMes[i])}</title></circle>`;

        const yDesp = calcY(despesasPorMes[i]);
        ptsDesp += `${x},${yDesp} `;
        htmlCirclesDesp += `<circle cx="${x}" cy="${yDesp}" r="4"><title>Mês ${i+1}: R$ ${makeDecimal(despesasPorMes[i])}</title></circle>`;
    }

    const linhaRec = document.getElementById('linhaReceitas');
    const grupoRec = document.getElementById('pontosReceitas');
    const linhaDesp = document.getElementById('linhaDespesas');
    const grupoDesp = document.getElementById('pontosDespesas');

    if(linhaRec) linhaRec.setAttribute('points', ptsRec.trim());
    if(grupoRec) grupoRec.innerHTML = htmlCirclesRec;
    
    if(linhaDesp) linhaDesp.setAttribute('points', ptsDesp.trim());
    if(grupoDesp) grupoDesp.innerHTML = htmlCirclesDesp;
}
initPage()