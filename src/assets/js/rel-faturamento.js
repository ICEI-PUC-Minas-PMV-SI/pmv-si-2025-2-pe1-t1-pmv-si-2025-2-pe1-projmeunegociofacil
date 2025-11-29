import { makeDecimal } from "./utils.js";
import { loggedUser } from "./auth.js";

const clientsFilterDiv = document.getElementById('clients-filter-div')
const initDate = document.getElementById('init-date')
const endDate = document.getElementById('end-date')
const filterTypeInput = document.getElementById('filter-type')
const filterPaymentInpyt = document.getElementById('filter-payment')
const btnMakeFilter = document.getElementById('btn-make-filter')
const results = document.getElementById('results')
let filtredSales = []

listOfClients()

btnMakeFilter.addEventListener('click', makeFilter)

// INIT
function allSales() {
    try {
        return JSON.parse(localStorage.getItem('vendas'));
    }
    catch {
        return []
    }
}

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

function allUserClients() {
    return JSON.parse(localStorage.getItem('clientesFornecedores')).filter(item => {
        return item.tipo === "cliente" && item.usuarioId === loggedUser().id;
    }).sort((a, b) => {
        const nomeA = a.nomeRazaoSocial || '';
        const nomeB = b.nomeRazaoSocial || '';

        return nomeA.localeCompare(nomeB);
    });
}

// FILTERS 
function listOfClients() {
    const initHtml = `<label for="clients-filter" class="form-label fw-semibold">Cliente:</label>
              <select class="form-select" id="clients-filter">
                <option value="" selected>Todos os clientes</option> `
    const rowsHtml = allUserClients().map(client => {
        return `
           <option value="${client.meuId}">${client.nomeRazaoSocial}</option>
            `;
    }).join('');
    const endHml = ` </select> `
    clientsFilterDiv.innerHTML = initHtml + rowsHtml + endHml;
}

// MAKE FILTER
function makeFilter(event) {
    filtredSales = allUserSales()
    const clientsFilter = document.getElementById('clients-filter')
    if (event) {event.preventDefault();}

    function filterDate() {
        if (initDate.value || endDate.value) {
            if (initDate.value && endDate.value) {
                if (initDate.value <= endDate.value) {
                    filtredSales = filtredSales.filter(sale => {
                        const dataVenda = new Date(sale.dataVenda);
                        const dataInicio = new Date(initDate.value);
                        const dataFim = new Date(endDate.value);
                        dataFim.setDate(dataFim.getDate() + 1);
                        return dataVenda >= dataInicio && dataVenda < dataFim;
                    });
                } else { alert('Digite Corretamente as datas.') }
            } else { alert('Digite Corretamente as datas.') }
        }
    }
    function filterType() {
        if (filterTypeInput.value) {
            filtredSales = filtredSales.filter(sale => {
                return sale.tipoVenda == filterTypeInput.value;
            });
        }
    }
    function filterClient() {
        if (clientsFilter.value) {
            filtredSales = filtredSales.filter(sale => {
                return sale.clientesFornecedoresMeuId == clientsFilter.value;
            });
        }
    }
    function filterPayment() {
        if (filterPaymentInpyt.value) {
            const paymentText = filterPaymentInpyt.value.toLowerCase()
            filtredSales = filtredSales.filter(sale => {
                const salePaymentText = sale.formaDePagamento;
                return salePaymentText && salePaymentText.toLowerCase().includes(paymentText);
            });
        }
    }
    filterDate()
    filterType()
    filterClient()
    filterPayment()
    renderFilter(filtredSales)
    // initDate.value = ""
    // endDate.value = ""
    // filterTypeInput.value = ""
    // filterPayment.value = ""
    // clientsFilter.value = ""
}

function renderFilter() {
    if (filtredSales.length > 0) {
        const initHtml = `<div class="card mb-4">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0" id="tabelaProdutosServicos">
              <thead class="table-light">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Data</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Forma de Pagamento</th>
                  <th class="text-end" scope="col">Valor</th>
                  <th class="text-center" scope="col">Ação</th>
                </tr>
              </thead>
              <tbody id="list-of-sales">`

        const endHtml = `     
        </tbody>
            </table>
          </div>
        </div>
      </div>`
        const rowsHtml = filtredSales.map(sale => {
            const searchcurrentClient = allUserClients().find(item => item.meuId == sale.clientesFornecedoresMeuId)
            const currentClient = searchcurrentClient ? searchcurrentClient : {
                "nomeRazaoSocial": "Consumidor Final",
                "cpfCnpj": "",
                "tem_cnpj": false,
                "telefone": "",
                "endereco": ""
            }
            let url = ""
            if (sale.tipoVenda == "produto") {
                url = "../assets/static/receipt-products.html?id=" + sale.meuId
            } else if (sale.tipoVenda == "servico") {
                url = "../assets/static/receipt-services.html?id=" + sale.meuId
            }
            return `
           
            <tr data-id=${sale.meuId}>
                  <td }>${sale.meuId}</td>
                  <td>${new Date(sale.dataVenda).toLocaleDateString('pt-BR')}</td>
                  <td>${sale.tipoVenda.charAt(0).toUpperCase() + sale.tipoVenda.slice(1)}</td>
                  <td>${currentClient.nomeRazaoSocial}</td>
                  <td>${sale.formaDePagamento}</td>
                  <td class="text-end">${makeDecimal(sale.valorTotal)}</td>
                  <td class="text-center">
                    <button class="btn btn-outline-danger btn-sm"><i class="bi bi-x-circle"></i></button>
                    <a href="${url}"> <button class="btn btn-outline-success btn-sm"><i class="bi bi-printer"></i></button></a>
                  </td>
                </tr>
            `;
        }).join('');
        results.innerHTML = initHtml + rowsHtml + endHtml
        listenerListOfSales()
    } else {
        results.innerHTML = `<div class="col text-center"><h4>Nenhuma venda encontrada.</h4></div>`
    }

}

function listenerListOfSales() {
    const tbodyListOfSales = document.getElementById('list-of-sales')
    tbodyListOfSales.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.btn-outline-danger');
        const allSalesTemp = allSales()
        if (deleteButton) {
            event.preventDefault();
            const row = deleteButton.closest('tr');
            const saleRowId = row.dataset.id;
            console.log(saleRowId)
            if (window.confirm("Deseja realmente excluir a venda?")) {
                if (allSalesTemp.length > 0) {
                    const indexToRemove = allSalesTemp.findIndex(sale => sale.meuId == saleRowId && sale.usuarioId === loggedUser().id);
                    if (indexToRemove > -1) {
                        allSalesTemp.splice(indexToRemove, 1);
                        localStorage.setItem('vendas', JSON.stringify(allSalesTemp));
                        alert('Venda excluída com sucesso!')
                        if (filtredSales.length > 0) {
                            const indexToRemove = filtredSales.findIndex(sale => sale.meuId == saleRowId && sale.usuarioId === loggedUser().id);
                            if (indexToRemove > -1) {
                                filtredSales.splice(indexToRemove, 1);
                            }
                            renderFilter();
                            return
                        }
                    }

                }
                alert('Ocorreu um erro ao excluir a venda.')
            }
        }
    });
}

listOfClients();
makeFilter()