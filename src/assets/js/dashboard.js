import { loggedUser } from "./auth.js";
import { makeDecimal } from "./utils.js";

const dashboardDiv = document.getElementById('dashboard-div');
const tableBody = document.querySelector('tbody');

function allUserSales() {
    try {
        return JSON.parse(localStorage.getItem('vendas')).filter(item => {
            return item.usuarioId === loggedUser().id;
        });
    }
    catch {
        return []
    }
}

function allUserProducts() {


    try {
        return JSON.parse(localStorage.getItem('produtosServicos')).filter(item => {
            return item.tipo === "produto" && item.usuarioId === loggedUser().id;
        });
    }
    catch {
        return []
    }
}

function renderSalesChart() {
    const vendas = allUserSales();
    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const totais2024 = new Array(12).fill(0);
    const totais2025 = new Array(12).fill(0);

    vendas.forEach(venda => {
        const data = new Date(venda.dataVenda);
        const ano = data.getFullYear();
        const mes = data.getMonth();

        if (ano === 2024) {
            totais2024[mes] += parseFloat(venda.valorTotal);
        } else if (ano === 2025) {
            totais2025[mes] += parseFloat(venda.valorTotal);
        }
    });

    let htmlContent = '<h5 class="mb-3">Vendas mensais</h5>';

    meses.forEach((nomeMes, index) => {
        const total2024 = totais2024[index];
        const meta = total2024 > 0 ? total2024 * 1.10 : 0;
        const realizado = totais2025[index];

        let porcentagem = 0;
        if (meta > 0) {
            porcentagem = (realizado / meta) * 100;
        } else if (realizado > 0) {
            porcentagem = 100;
        }

        const larguraBarra = porcentagem > 100 ? 100 : porcentagem;

        let corBarra = '#2988CA';
        if (realizado >= meta && meta > 0) {
            corBarra = '#198754';
        }

        const valorK = (realizado / 1000).toFixed(1).replace('.', ',');
        const textoExibicao = `R$ ${valorK}K`;

        const corTexto = larguraBarra > 20 ? '#ffffff' : '#333333';
        const sombraTexto = larguraBarra > 20 ? '0px 0px 2px rgba(0,0,0,0.2)' : 'none';

        htmlContent += `
        <div class="row align-items-center mb-2">
            <div class="col-3 col-sm-2 text-end small" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${nomeMes}">
                ${nomeMes}
            </div>
            <div class="col-9 col-sm-10">
                <div class="progress" style="height: 25px; background-color: #e9ecef;">
                    <div class="progress-bar d-flex justify-content-center align-items-center" role="progressbar" 
                         style="width: ${larguraBarra}%; background-color: ${corBarra}; transition: width 0.6s ease; overflow: visible;"
                         aria-valuenow="${larguraBarra}" aria-valuemin="0" aria-valuemax="100">
                        
                        <span style="white-space: nowrap; font-size: 0.85rem; font-weight: 600; color: ${corTexto}; text-shadow: ${sombraTexto};">
                            ${textoExibicao}
                        </span>
                        
                    </div>
                </div>
            </div>
        </div>`;
    });

    dashboardDiv.innerHTML = htmlContent;
}

function renderMissingProducts() {
    const produtos = allUserProducts();

    const produtosEmFalta = produtos.filter(p => {
        const estoque = Number(p.estoqueAtual);
        return estoque <= 0;
    });

    if (tableBody) {
        tableBody.innerHTML = '';

        if (produtosEmFalta.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-3">Nenhum produto em falta no estoque.</td>
                </tr>`;
            return;
        }

        produtosEmFalta.forEach(produto => {
            const tr = document.createElement('tr');

            const tdCodigo = document.createElement('td');
            tdCodigo.textContent = produto.meuId || '-';

            const tdTipo = document.createElement('td');
            tdTipo.textContent = 'Produto';

            const tdDescricao = document.createElement('td');
            tdDescricao.textContent = produto.descricao || 'Sem descrição';


            const tdPreco = document.createElement('td');
            tdPreco.textContent = `R$ ${makeDecimal(produto.precoVenda)}`;

            const tdSaldo = document.createElement('td');
            tdSaldo.classList.add('text-danger', 'fw-bold', 'text-center'); 
            tdSaldo.textContent = produto.estoqueAtual;

            tr.appendChild(tdCodigo);
            tr.appendChild(tdDescricao); // Substituindo a coluna "Tipo" visualmente pela descrição
            tr.appendChild(tdPreco);     // Substituindo Nome
            tr.appendChild(tdSaldo);     // Substituindo Unidade

            tableBody.appendChild(tr);
        });

        
    }
}

function init() {
    renderSalesChart();
    renderMissingProducts();
}

init();