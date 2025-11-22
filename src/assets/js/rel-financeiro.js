import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js";
import { makeDecimal } from "./utils.js"; 

const usuarioCorrente = loggedUser();
if (!usuarioCorrente) {
    window.location.href = LOGIN_URL;
}

<<<<<<< HEAD
let listaUnificada = []; 
=======
let usuarioAtual = null;
let registrosFinanceiros = [];
>>>>>>> 4cecb5fe4b8cc8d48182163340080fe7214cf916

window.addEventListener('load', initPage);

function initPage() {
    const btnFiltrar = document.getElementById('btnFiltrarFinanceiro');
    if(btnFiltrar) btnFiltrar.addEventListener('click', aplicarFiltros);

    carregarDadosReais();
    
    preencherFiltroPessoas();
    
    renderizarTabela(listaUnificada);
    atualizarGrafico(listaUnificada);
}

<<<<<<< HEAD
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
=======
async function prepararDados() {
    let clientes = [];
    let contasReceber = [];
    let contasPagar = [];
    try {
        clientes = JSON.parse(localStorage.getItem('clientesFornecedores')) || [];
        contasReceber = JSON.parse(localStorage.getItem('contasReceber')) || [];
        contasPagar = JSON.parse(localStorage.getItem('contasPagar')) || [];
    } catch {
        clientes = [];
        contasReceber = [];
        contasPagar = [];
    }
    if (clientes.length === 0 || (contasReceber.length === 0 && contasPagar.length === 0)) {
        try {
            const resposta = await fetch('assets/data/maketest.json');
            const base = await resposta.json();
            if (clientes.length === 0) {
                clientes = base.clientesFornecedores || [];
                localStorage.setItem('clientesFornecedores', JSON.stringify(clientes));
            }
            if (contasReceber.length === 0) {
                contasReceber = base.contasReceber || [];
                localStorage.setItem('contasReceber', JSON.stringify(contasReceber));
            }
            if (contasPagar.length === 0) {
                contasPagar = base.contasPagar || [];
                localStorage.setItem('contasPagar', JSON.stringify(contasPagar));
            }
        } catch {
            clientes = [];
            contasReceber = [];
            contasPagar = [];
        }
    }
    const receitas = contasReceber.filter(function (item) {
        return item.usuarioId === usuarioAtual.id;
    }).map(function (item) {
        return montarReceita(item, clientes);
    });
    const despesas = contasPagar.filter(function (item) {
        return item.usuarioId === usuarioAtual.id;
    }).map(function (item) {
        return montarDespesa(item, clientes);
    });
    registrosFinanceiros = receitas.concat(despesas);
}

function montarReceita(item, clientes) {
    const pessoa = buscarNome(clientes, item.clientesFornecedoresMeuId);
    const status = item.status ? item.status : item.data_pagamento ? 'Pago' : 'Em aberto';
    return {
        idItem: `receber-${item.meuId}`,
        usuarioId: item.usuarioId,
        tipo: 'receber',
        pessoa,
        status,
        forma: item.formaDePagamento || 'Não informado',
        valor: Number(item.valorComDesconto || item.valorTotal || 0),
        emissao: item.dataVenda
    };
}

function montarDespesa(item, clientes) {
    const pessoa = buscarNome(clientes, item.clientes_fornecedoresId);
    const status = item.status ? item.status : item.data_pagamento ? 'Pago' : 'Em aberto';
    return {
        idItem: `pagar-${item.id}`,
        usuarioId: item.usuarioId,
        tipo: 'pagar',
        pessoa,
        status,
        forma: item.formaDePagamento || 'Não informado',
        valor: Number(item.valor || 0),
        emissao: item.data_vencimento
    };
}

function buscarNome(lista, idBusca) {
    if (!idBusca) {
        return 'Consumidor Final';
    }
    if (!Array.isArray(lista)) {
        return 'Consumidor Final';
    }
    const encontrado = lista.find(function (item) {
        return String(item.meuId) === String(idBusca);
    });
    if (encontrado) {
        return encontrado.nomeRazaoSocial || encontrado.nome || 'Contato';
    }
    return 'Consumidor Final';
}
>>>>>>> 4cecb5fe4b8cc8d48182163340080fe7214cf916

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
<<<<<<< HEAD

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
=======
    const atual = selectPessoa.value;
    const nomes = registrosFinanceiros.map(function (item) {
        return item.pessoa;
    }).filter(Boolean);
    const unicos = [];
    nomes.forEach(function (nome) {
        if (!unicos.includes(nome)) {
            unicos.push(nome);
>>>>>>> 4cecb5fe4b8cc8d48182163340080fe7214cf916
        }
    });

<<<<<<< HEAD
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
=======
function filtrarRegistros(event) {
    if (event) {
        event.preventDefault();
    }
    let itens = registrosFinanceiros.slice();
    if (inputInicio && inputInicio.value) {
        const dataInicial = new Date(inputInicio.value);
        itens = itens.filter(function (item) {
            const dataItem = new Date(item.emissao);
            return !isNaN(dataItem) && dataItem >= dataInicial;
        });
    }
    if (inputFim && inputFim.value) {
        const dataFinal = new Date(inputFim.value);
        dataFinal.setHours(23, 59, 59, 999);
        itens = itens.filter(function (item) {
            const dataItem = new Date(item.emissao);
            return !isNaN(dataItem) && dataItem <= dataFinal;
        });
    }
    if (selectStatus && selectStatus.value) {
        itens = itens.filter(function (item) {
            return item.status === selectStatus.value;
        });
    }
    if (selectTipo && selectTipo.value) {
        itens = itens.filter(function (item) {
            return item.tipo === selectTipo.value;
        });
    }
    if (selectPessoa && selectPessoa.value) {
        itens = itens.filter(function (item) {
            return item.pessoa === selectPessoa.value;
        });
    }
    renderTabela(itens);
}

function renderTabela(lista) {
    if (!tabelaBody) {
        return;
    }
    if (!lista || lista.length === 0) {
        tabelaBody.innerHTML = '<tr><td colspan="6" class="text-center py-3">Nenhum registro encontrado.</td></tr>';
        return;
    }
    const linhas = lista.map(function (item) {
        const dataTexto = item.emissao ? new Date(item.emissao).toLocaleDateString('pt-BR') : '-';
        const valorTexto = formatarValor(item.valor);
        return `<tr data-id="${item.idItem}" data-tipo="${item.tipo}">
            <td>${dataTexto}</td>
            <td>${item.pessoa}</td>
            <td>${item.status}</td>
            <td>${item.forma}</td>
            <td>${valorTexto}</td>
            <td class="text-center">
              <button type="button" class="btn btn-outline-secondary btn-sm btn-excluir-registro" data-id="${item.idItem}" data-tipo="${item.tipo}">
                <i class="bi bi-trash3-fill"></i>
              </button>
            </td>
        </tr>`;
    }).join('');
    tabelaBody.innerHTML = linhas;
    registrarAcoesExcluir();
}

function registrarAcoesExcluir() {
    const botoes = document.querySelectorAll('.btn-excluir-registro');
    botoes.forEach(function (botao) {
        botao.addEventListener('click', function () {
            removerRegistro(this.dataset.id, this.dataset.tipo);
        });
    });
}

function removerRegistro(id, tipo) {
    if (!id || !tipo) {
        return;
    }
    const confirmar = confirm('Deseja realmente excluir este registro?');
    if (!confirmar) {
        return;
    }
    if (tipo === 'receber') {
        let contas = [];
        try {
            contas = JSON.parse(localStorage.getItem('contasReceber')) || [];
        } catch {
            contas = [];
        }
        contas = contas.filter(function (item) {
            return !(String(item.meuId) === id.replace('receber-', '') && item.usuarioId === usuarioAtual.id);
        });
        localStorage.setItem('contasReceber', JSON.stringify(contas));
    } else if (tipo === 'pagar') {
        let contas = [];
        try {
            contas = JSON.parse(localStorage.getItem('contasPagar')) || [];
        } catch {
            contas = [];
        }
        contas = contas.filter(function (item) {
            return !(String(item.id) === id.replace('pagar-', '') && item.usuarioId === usuarioAtual.id);
        });
        localStorage.setItem('contasPagar', JSON.stringify(contas));
    }
    prepararDados().then(function () {
        preencherFiltroPessoas();
        filtrarRegistros();
    });
}
>>>>>>> 4cecb5fe4b8cc8d48182163340080fe7214cf916

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