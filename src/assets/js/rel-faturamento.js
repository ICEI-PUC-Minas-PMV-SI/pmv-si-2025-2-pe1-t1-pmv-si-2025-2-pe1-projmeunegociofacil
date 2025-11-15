const clientsFilterDiv = document.getElementById('clients-filter-div')
const initDate = document.getElementById('init-date')
const endDate = document.getElementById('end-date')
const filterTypeInput = document.getElementById('filter-type')
const filterPaymentInpyt = document.getElementById('filter-payment')
const btnMakeFilter = document.getElementById('btn-make-filter')

btnMakeFilter.addEventListener('click', makeFilter)

// INIT
function allUserSales() {
    return JSON.parse(localStorage.getItem('vendas')).filter(item => {
        return item.usuarioId === usuarioCorrente.id;
    });
}

function allUserClients() {
    return JSON.parse(localStorage.getItem('clientesFornecedores')).filter(item => {
        return item.tipo === "cliente" && item.usuarioId === usuarioCorrente.id;
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
    const clientsFilter = document.getElementById('clients-filter')

    event.preventDefault();
    let filtredSales = allUserSales()
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

                // Agora, ele só tenta o .toLowerCase() se salePaymentText "existir"
                // (não for undefined, null, ou uma string vazia)
                return salePaymentText && salePaymentText.toLowerCase().includes(paymentText);
            });
        }
    }
    filterDate()
    filterType()
    filterClient()
    filterPayment()
    initDate.value = ""
    endDate.value = ""
    filterTypeInput.value = ""
    filterPayment.value = ""
    clientsFilter.value = ""
    console.log(filtredSales)
}




listOfClients();