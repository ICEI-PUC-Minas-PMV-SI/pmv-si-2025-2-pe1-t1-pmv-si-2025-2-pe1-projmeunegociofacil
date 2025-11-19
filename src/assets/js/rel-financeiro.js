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
const CHAVE_RELATORIO = 'relatorioFinanceiro';

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
    const salvos = JSON.parse(localStorage.getItem(CHAVE_RELATORIO)) || [];
    const meus = salvos.filter(item => item.usuarioId === usuarioAtual.id);
    if (meus.length) {
        registrosFinanceiros = meus;
        return;
    }
    let clientes = JSON.parse(localStorage.getItem('clientesFornecedores')) || [];
    let contasReceber = JSON.parse(localStorage.getItem('contasReceber')) || [];
    let contasPagar = JSON.parse(localStorage.getItem('contasPagar')) || [];
    if (clientes.length === 0 || contasReceber.length === 0 || contasPagar.length === 0) {
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
    const receitas = contasReceber.filter(item => item.usuarioId === usuarioAtual.id).map((item, index) => montarReceita(item, clientes, index));
    const despesas = contasPagar.filter(item => item.usuarioId === usuarioAtual.id).map((item, index) => montarDespesa(item, clientes, index));
    registrosFinanceiros = receitas.concat(despesas);
    const outros = salvos.filter(item => item.usuarioId !== usuarioAtual.id);
    localStorage.setItem(CHAVE_RELATORIO, JSON.stringify(outros.concat(registrosFinanceiros)));
}

function montarReceita(item, clientes, index) {
    const pessoa = buscarNome(clientes, item.clientesFornecedoresMeuId);
    const status = index % 2 === 0 ? 'Pago' : 'Em aberto';
    return {
        idItem: `receber-${item.meuId}`,
        usuarioId: item.usuarioId,
        tipo: 'receber',
        pessoa,
        status,
        forma: item.formaDePagamento || 'Dinheiro',
        valor: Number(item.valorComDesconto || item.valorTotal || 0),
        emissao: item.dataVenda
    };
}

function montarDespesa(item, clientes, index) {
    const pessoa = buscarNome(clientes, item.clientes_fornecedoresId) || 'Fornecedor';
    const status = index % 3 === 0 ? 'Pago' : 'Em aberto';
    const formas = ['Pix', 'Boleto', 'Transferência', 'Dinheiro'];
    const forma = formas[index % formas.length];
    return {
        idItem: `pagar-${item.id}`,
        usuarioId: item.usuarioId,
        tipo: 'pagar',
        pessoa,
        status,
        forma,
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
    const encontrado = lista.find(item => String(item.meuId) === String(idBusca));
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
    const nomes = registrosFinanceiros.map(item => item.pessoa).filter(Boolean);
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
    let itens = [...registrosFinanceiros];
    if (inputInicio && inputInicio.value) {
        const dataInicial = new Date(inputInicio.value);
        itens = itens.filter(item => {
            const dataItem = new Date(item.emissao);
            return !isNaN(dataItem) && dataItem >= dataInicial;
        });
    }
    if (inputFim && inputFim.value) {
        const dataFinal = new Date(inputFim.value);
        dataFinal.setHours(23, 59, 59, 999);
        itens = itens.filter(item => {
            const dataItem = new Date(item.emissao);
            return !isNaN(dataItem) && dataItem <= dataFinal;
        });
    }
    if (selectStatus && selectStatus.value) {
        itens = itens.filter(item => item.status === selectStatus.value);
    }
    if (selectTipo && selectTipo.value) {
        itens = itens.filter(item => item.tipo === selectTipo.value);
    }
    if (selectPessoa && selectPessoa.value) {
        itens = itens.filter(item => item.pessoa === selectPessoa.value);
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
    const linhas = lista.map(item => {
        const dataTexto = item.emissao ? new Date(item.emissao).toLocaleDateString('pt-BR') : '-';
        const valorTexto = formatarValor(item.valor);
        return `<tr>
            <td>${dataTexto}</td>
            <td>${item.pessoa}</td>
            <td>${item.status}</td>
            <td>${item.forma}</td>
            <td>${valorTexto}</td>
            <td class="text-center">
              <button type="button" class="btn btn-outline-secondary btn-sm btn-excluir-registro" data-id="${item.idItem}">
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
            removerRegistro(this.dataset.id);
        });
    });
}

function removerRegistro(id) {
    if (!id) {
        return;
    }
    const confirmar = confirm('Deseja realmente excluir este registro?');
    if (!confirmar) {
        return;
    }
    registrosFinanceiros = registrosFinanceiros.filter(item => item.idItem !== id);
    const dados = JSON.parse(localStorage.getItem(CHAVE_RELATORIO)) || [];
    const atualizados = dados.filter(item => !(item.idItem === id && item.usuarioId === usuarioAtual.id));
    localStorage.setItem(CHAVE_RELATORIO, JSON.stringify(atualizados));
    preencherFiltroPessoas();
    filtrarRegistros();
}

function formatarValor(valor) {
    const numero = Number(valor) || 0;
    return numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
