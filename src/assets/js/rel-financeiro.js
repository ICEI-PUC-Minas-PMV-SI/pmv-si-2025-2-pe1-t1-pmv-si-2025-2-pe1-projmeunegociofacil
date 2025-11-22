import { loggedUser, logoutUser } from "./auth.js";

const inputInicio = document.getElementById('filtroInicio');
const inputFim = document.getElementById('filtroFim');
const selectStatus = document.getElementById('filtroStatus');
const selectTipo = document.getElementById('filtroTipo');
const selectPessoa = document.getElementById('filtroPessoa');
const btnFiltrar = document.getElementById('btnFiltrarFinanceiro');
const tabelaBody = document.getElementById('corpoRelFinanceiro');

let usuarioAtual = null;
let registrosFinanceiros = [];

window.addEventListener('load', iniciarPagina);

async function iniciarPagina() {
    usuarioAtual = loggedUser();
    if (!usuarioAtual) {
        logoutUser();
        return;
    }
    await prepararDados();
    preencherFiltroPessoas();
    filtrarRegistros();
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', filtrarRegistros);
    }
}

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

function preencherFiltroPessoas() {
    if (!selectPessoa) {
        return;
    }
    const atual = selectPessoa.value;
    const nomes = registrosFinanceiros.map(function (item) {
        return item.pessoa;
    }).filter(Boolean);
    const unicos = [];
    nomes.forEach(function (nome) {
        if (!unicos.includes(nome)) {
            unicos.push(nome);
        }
    });
    let opcoes = '<option value="">Todos</option>';
    unicos.forEach(function (nome) {
        opcoes += `<option value="${nome}">${nome}</option>`;
    });
    selectPessoa.innerHTML = opcoes;
    if (atual && unicos.includes(atual)) {
        selectPessoa.value = atual;
    }
}

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

function formatarValor(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
