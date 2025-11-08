import { newMyId } from "./utils.js";

let selectedClient = null;
let productsToSale = [];
let totalWithDiscountGlobal = 0;






// CLIENT
const clientInput = document.getElementById('selected-client');

// SEARCH CLIENT
const searchClientInput = document.getElementById('search-client');
const tbodyListOfClients = document.getElementById('list-of-clients');
const buttonUnselectClient = document.getElementById('button-unselect-client');

// SEARCH PRODUCTS
const searchProductsInput = document.getElementById('search-products-input');
const btnSearchProducts = document.getElementById('btn-search-products');
const tableProductsSearch = document.getElementById('table-products-search');

// PRODUCTS
const tbodyListOfProducts = document.getElementById('list-of-products');
const productsForm = document.getElementById('products-form');
const productsInput = document.getElementById('products-input');
const quantitySpan = document.getElementById('quantity');
const totalizerTotalSpan = document.getElementById('totalizer-total');
const subtotalSpan = document.getElementById('totalizer-subtotal');
const totalSpan = document.getElementById('total-span');



// MODAL
const modalClient = document.getElementById('select-client-modal');
const modalSearchProducts = document.getElementById('search-products-modal');
const saveModal = document.getElementById('save-modal')

// SAVE
const saveClient = document.getElementById('save-client');
const saveTelefone = document.getElementById('save-telefone');
const saveCpfCnpj = document.getElementById('save-cpf-cnpj');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('save-btn');
const saveObservacoes = document.getElementById('save-observacoes');

// CHECKOUT
const btnInsertDiscountIncriase = document.getElementById('btn-insert-discount-incriase')
const discountIncriase = document.getElementById('discount-incriase')
const typeDiscountIncriase = document.getElementById('type-discount-incriase')
const valorDiscountIncriase = document.getElementById('valor-discount-incriase')
const discountView = document.getElementById('discount-view');
const checkoutModal = document.getElementById('checkout-modal');
const paymentMethod = document.getElementById('payment-method')
const colPaymentInstallment = document.getElementById('col-payment-installment')
const selectedPaymentInstallment = document.getElementById('selected-payment-installment')
const viewParcSpan = document.getElementById('view-parc-span')
const btnFinishSale = document.getElementById('btn-finish-sale')



btnFinishSale.addEventListener('click', finishSale)
paymentMethod.addEventListener('change', blockInstallments)
btnInsertDiscountIncriase.addEventListener('click', updateDiscountIncriase)
btnCancel.addEventListener('click', cancelSale)
btnSave.addEventListener('click', save)
modalClient.addEventListener('hidden.bs.modal', cleanSearch);
modalSearchProducts.addEventListener('hidden.bs.modal', cleanSearch);
buttonUnselectClient.addEventListener('click', removeClient);
productsForm.addEventListener('submit', insertProductFromInput);
checkoutModal.addEventListener('show.bs.modal', verifyProductsIsValid)
saveModal.addEventListener('show.bs.modal', verifyProductsIsValid)
selectedPaymentInstallment.addEventListener('change', updatePayment)

// INIT
function allUserUnclosedSales() {
    try {
        return JSON.parse(localStorage.getItem('vendasEmAberto')).filter(item => {
            return item.usuarioId === usuarioCorrente.id;
        });
    }
    catch {
        return []
    }
}

function allUserSales() {
    try {
        return JSON.parse(localStorage.getItem('vendas')).filter(item => {
            return item.usuarioId === usuarioCorrente.id;
        });
    }
    catch {
        return []
    }
}

function allUserProducts() {


    try {
        return JSON.parse(localStorage.getItem('produtosServicos')).filter(item => {
            return item.tipo === "produto" && item.usuarioId === usuarioCorrente.id;
        });
    }
    catch {
        return []
    }
}

function allUserClients() {
    try {
        return JSON.parse(localStorage.getItem('clientesFornecedores')).filter(item => {
            return item.tipo === "cliente" && item.usuarioId === usuarioCorrente.id;
        });
    }
    catch {
        return []
    }
}

function allUserContasReceber() {
    try {
        return JSON.parse(localStorage.getItem('contasReceber')) || [];
    }
    catch {
        return []
    }
}

// UTILS
function cleanSearch() {
    searchClientInput.value = '';
    renderClients(firstClients());
    renderProductsSearch([]);
    searchProductsInput.value = '';
}

function cancelSale() {
    if (confirm('Deseja realmente cancelar a venda?')) {
        location.reload();
    }
}


function makeDecimal(number) {
    return number.toLocaleString('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

}

function totalizerQuantity(productsToSale) {
    const quantify = productsToSale.reduce((acumulador, produto) => {
        return acumulador + produto.quantidade;
    }, 0);
    renderTotalizerQuantity(quantify)
    return quantify;
}

function renderTotalizerQuantity(quantify) {
    quantitySpan.innerHTML = quantify;
}

function totalizerTotal(productsToSale) {
    const valorTotal = productsToSale.reduce((acumulador, produto) => {
        const subtotalProduto = produto.quantidade * produto.precoVenda;
        return acumulador + subtotalProduto;
    }, 0);
    renderTotalizerTotal(valorTotal)
    return valorTotal
}

function renderTotalizerTotal(valorTotal) {
    totalizerTotalSpan.innerHTML = makeDecimal(valorTotal);
    subtotalSpan.innerHTML = makeDecimal(valorTotal);
    totalSpan.innerHTML = makeDecimal(valorTotal);
}

function verifyProductsIsValid(event) {
    if (productsToSale.length === 0) {
        event.preventDefault();
        alert("Adicione produtos para prosseguir.");
    }


}

// PRODUCTS
function insertProductFromInput(event) {
    event.preventDefault();
    const productToSearch = productsInput.value
    makeInsertProduct(productToSearch)
    productsInput.value = ''

}

function makeInsertProduct(productToSearch) {
    const productToInsert = allUserProducts().find(item => item.meuId == productToSearch || item.codigoBarras == productToSearch)
    if (productToInsert === undefined) {
        alert('Produto não encontrado')
        return
    }
    const productOnList = productsToSale.find(item => item.meuId == productToSearch || item.codigoBarras == productToSearch);
    if (productOnList) {
        productOnList.quantidade++;
    } else {
        const productToInsertWhitQuantity = { ...productToInsert, quantidade: 1 };
        productsToSale.push(productToInsertWhitQuantity);
    }
    renderProducts(productsToSale)
    totalizerQuantity(productsToSale);
    totalizerTotal(productsToSale);

}

function renderProducts(productsToSale) {
    const rowsHtml = productsToSale.map(product => {
        return `
        <tr data-id="${product.meuId}">
        <th class="text-center pe-4 ps-4" scope="row">${product.meuId}</th>
        <td class="text-start pe-4 ps-4">${product.descricao}</td>
        <td class="text-center pe-4 ps-4"><input class="input-quantidade text-center" value="${product.quantidade}" readonly>
        </td>
        <td class="text-end pe-4 ps-4">${makeDecimal(product.precoVenda)}</td>
        <td class="text-center pe-4" style="min-width: 110px;"> 
        <button class="btn btn-outline-primary btn-sm me-1"><i class="bi bi-pencil"></i></button>
        <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button>
        </td>
        </tr>
  `;
    }).join('');
    tbodyListOfProducts.innerHTML = rowsHtml;
}


function listenerListOfProducts() {
    function saveProductQuantity(row, input) {
        const productId = row.dataset.id;
        const inputfield = Number(input.value);
        const newQuantity = Number.isInteger(inputfield) ? inputfield : NaN;
        if (isNaN(newQuantity) || newQuantity <= 0) {
            alert("Insira um valor inteiro maior que 0.");
            input.focus();
            return;
        }
        const productToUpdate = productsToSale.find(product => product.meuId == productId);
        if (productToUpdate) {
            productToUpdate.quantidade = newQuantity;
        }
        input.readOnly = true;
        input.classList.remove('form-control');
        const editButton = row.querySelector('.btn-outline-success');
        const icon = editButton.querySelector('i');
        icon.classList.remove('bi-check');
        icon.classList.add('bi-pencil');
        editButton.classList.remove('btn-outline-success');
        editButton.classList.add('btn-outline-primary');
        totalizerQuantity(productsToSale);
        totalizerTotal(productsToSale);
    }
    tbodyListOfProducts.addEventListener('click', (event) => {
        event.preventDefault();
        const deleteButton = event.target.closest('.btn-outline-danger');
        if (deleteButton) {
            const row = deleteButton.closest('tr');
            const productId = row.dataset.id;
            if (window.confirm("Deseja realmente excluir o produto?")) {
                const indexToRemove = productsToSale.findIndex(product => product.meuId == productId);
                if (indexToRemove > -1) {
                    productsToSale.splice(indexToRemove, 1);
                }
                renderProducts(productsToSale);
                totalizerQuantity(productsToSale);
                totalizerTotal(productsToSale);
            }
        }
        const editButton = event.target.closest('.btn-outline-primary, .btn-outline-success');
        if (editButton) {
            const row = editButton.closest('tr');
            const input = row.querySelector('.input-quantidade');
            const icon = editButton.querySelector('i');

            if (icon.classList.contains('bi-pencil')) {
                input.readOnly = false;
                input.classList.add('form-control');
                input.focus();
                input.select();

                icon.classList.remove('bi-pencil');
                icon.classList.add('bi-check');
                editButton.classList.remove('btn-outline-primary');
                editButton.classList.add('btn-outline-success');

            }
            else if (icon.classList.contains('bi-check')) {
                saveProductQuantity(row, input);
            }
        }
    });
    tbodyListOfProducts.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' &&
            event.target.classList.contains('input-quantidade') &&
            !event.target.readOnly) {
            event.preventDefault();
            const input = event.target;
            const row = input.closest('tr');

            saveProductQuantity(row, input);
        }
    });
}

// SEARCH PRODUCTS
function searchProducts() {
    let productsToShow = [];
    renderProductsSearch(productsToShow);

    function makeSearch() {
        const searchTerm = searchProductsInput.value.toLowerCase().trim();
        if (searchTerm === '') {
            renderProductsSearch([]);
        } else {
            productsToShow = allUserProducts().filter(item => {
                const meuId = String(item.meuId || '').toLowerCase();
                const codBarras = String(item.codigoBarras || '').toLowerCase();
                const desc = String(item.descricao || '').toLowerCase();
                const ref = String(item.referencia || '').toLowerCase();

                return meuId.includes(searchTerm) ||
                    codBarras.includes(searchTerm) ||
                    desc.includes(searchTerm) ||
                    ref.includes(searchTerm);
            });
            renderProductsSearch(productsToShow);
            searchProductsInput.value = '';
        }
    }

    btnSearchProducts.addEventListener('click', () => {
        makeSearch();
    });

    searchProductsInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            makeSearch();
        }
    });
}

function renderProductsSearch(productsToShow) {
    const initrows = `
    <div class="table-responsive">
    <table class="table table-hover mb-0 tabelaModal">
    <thead class="table-light">
    <tr>
    <th scope="col">Código</th>
    <th scope="col">Referência</th>
    <th scope="col">Descrição</th>
    <th scope="col">Valor</th>
    </tr>
    </thead>
    <tbody id="list-of-products-search"> `
    const rowsHtml = productsToShow.map(product => {
        return `
    <tr data-id="${product.meuId}">
    <th scope="row">${product.meuId}</th>
      <td>${product.referencia ?? ""}</td>
    <td>${product.descricao}</td>
      <td>${makeDecimal(product.precoVenda)}</td>
    </tr>
  `;
    }).join('');
    const endrows = `
    </tbody>
    </table>
    </div>`
    tableProductsSearch.innerHTML = initrows + rowsHtml + endrows;
}

function listOfProductsSearch() {
    tableProductsSearch.addEventListener('click', (event) => {
        event.preventDefault();
        const clickedRow = event.target.closest('#list-of-products-search tr');
        if (!clickedRow) return;
        const productMyId = clickedRow.dataset.id;
        const selectedProductSearch = allUserProducts().find(product => product.meuId == productMyId);
        if (selectedProductSearch) {
            makeInsertProduct(productMyId);
            const modalInstance = bootstrap.Modal.getInstance(modalSearchProducts);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    });

}

// CLIENTS
function firstClients() {
    const initialClients = allUserClients().slice(0, 10);
    return initialClients;
}

function searchClients() {
    let clientsToShow = firstClients();
    renderClients(clientsToShow);
    searchClientInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        if (searchTerm === '') {
            clientsToShow = allUserClients().slice(0, 10);
        } else {
            clientsToShow = allUserClients().filter(cliente => {
                const clientName = cliente.nomeRazaoSocial.toLowerCase();
                return clientName.includes(searchTerm);
            });
        }
        return renderClients(clientsToShow);
    });
}

function listOfClientes() {
    tbodyListOfClients.addEventListener('click', (event) => {
        event.preventDefault();
        const clickedRow = event.target.closest('tr');
        if (!clickedRow) return;
        const clientId = clickedRow.dataset.id;
        const selectedClientSearch = allUserClients().find(client => client.meuId == clientId);
        if (selectedClientSearch) {
            selectedClient = selectedClientSearch;
            clientInput.value = selectedClient.nomeRazaoSocial;
            saveClient.value = selectedClient.nomeRazaoSocial;
            saveTelefone.value = selectedClient.telefone;
            saveCpfCnpj.value = selectedClient.cpfCnpj;


            const modalInstance = bootstrap.Modal.getInstance(modalClient);
            if (modalInstance) {
                modalInstance.hide();
            }
            buttonUnselectClient.innerHTML = `  
                <div class="input-group-append">
                <button id="unselect-client" class="btn btn-outline-secondary selected-client" type="button">x</button>
                </div>`;
        }
    });

}

function renderClients(clientsToShow) {
    const rowsHtml = clientsToShow.map(cliente => {
        return `
    <tr data-id="${cliente.meuId}">
      <th><a href="#">${cliente.nomeRazaoSocial}</a></th>
    </tr>
  `;
    }).join('');
    tbodyListOfClients.innerHTML = rowsHtml;
}

function removeClient(event) {
    if (event.target.id === 'unselect-client') {
        selectedClient = null;
        saveClient.value = "";
        saveTelefone.value = "";
        saveCpfCnpj.value = "";
        clientInput.value = "Consumidor Final";
        buttonUnselectClient.innerHTML = '';
    }

}

// SAVE

function save() {
    if (!selectedClient && saveClient.value.length < 5) {
        saveClient.classList.add('is-invalid');
    }
    else {
        saveClient.classList.remove('is-invalid');
        const currentCliente = selectedClient ? selectedClient : saveClient.value;
        const unclosedSale = {
            "meuId": newMyId(allUserUnclosedSales()),
            "usuarioId": usuarioCorrente.id,
            "clientesFornecedoresMeuId": currentCliente,
            "tipoVenda": "produto",
            "dataVenda": new Date(),
            "quantidadeItens": totalizerQuantity(productsToSale),
            "valorTotal": totalizerTotal(productsToSale),
            "observacoes": saveObservacoes,
            "itens": productsToSale,
            "insumosServico": null
        };
        const currentUnslosedSales = allUserUnclosedSales()
        currentUnslosedSales.push(unclosedSale);
        localStorage.setItem('vendasEmAberto', JSON.stringify(currentUnslosedSales));
        const modalInstance = bootstrap.Modal.getInstance(saveModal);
        if (modalInstance) {
            modalInstance.hide();
        }
        alert('Venda gravada com sucesso!')
        location.reload();

    }


}

// CHECKOUT

function blockInstallments() {
    if (paymentMethod.value == 'credito') {
        colPaymentInstallment.style.display = 'block';
    } else {
        colPaymentInstallment.style.display = 'none';
    }
}

function makeDiscountIncriase(valor) {
    if (valor) {
        if (discountIncriase.value == "discount") {
            if (typeDiscountIncriase.value == "%") {
                return (valorDiscountIncriase.value / 100 * totalizerTotal(productsToSale)) * -1
            } else if (typeDiscountIncriase.value == "R$") {
                return valorDiscountIncriase.value / -1

            }
        } else if (discountIncriase.value == "increase") {
            if (typeDiscountIncriase.value == "%") {
                return valorDiscountIncriase.value / 100 * totalizerTotal(productsToSale)
            } else if (typeDiscountIncriase.value == "R$") {
                return valorDiscountIncriase.value
            }
        }
    } else {

    }

}
function renderDiscountView(discount) {
    const discountDecimal = makeDecimal(discount)
    discountView.innerHTML = `
            <span class="text-danger"><small>Desconto: <strong>
            <span></span>${discountDecimal}</strong></small></span>
            `
    return discount
}

function updateDiscountIncriase() {
    if (valorDiscountIncriase.value) {
        const totalWhithoutDiscount = totalizerTotal(productsToSale)
        const discountValue = renderDiscountView(makeDiscountIncriase(valorDiscountIncriase.value))
        const totalWhithDiscount = totalWhithoutDiscount + discountValue
        totalWithDiscountGlobal = totalWhithDiscount
        valorDiscountIncriase.value = ""
        totalSpan.innerHTML = totalWhithDiscount.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else if (totalWithDiscountGlobal) {
        const totalWhithDiscount = totalWithDiscountGlobal
        totalSpan.innerHTML = totalWhithDiscount.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else {
        totalWithDiscountGlobal = totalizerTotal(productsToSale)
    }
}
function updatePayment() {
    updateDiscountIncriase()
    const actualSelectedPaymentInstallment = selectedPaymentInstallment.value
    const actualInsallment = (totalWithDiscountGlobal / actualSelectedPaymentInstallment).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    if (selectedPaymentInstallment.value > 1) {
        viewParcSpan.innerHTML = `<small><strong>${actualSelectedPaymentInstallment}x</strong>
                    ${actualInsallment} </small>
    `
    } else { viewParcSpan.innerHTML = "" }
}

// function finishSale() {
//     let paymentMethodSelected = ""
//     const currentCliente = selectedClient ? selectedClient : "Consumidor Final";
//     if (selectedPaymentInstallment.value == 1) {
//         paymentMethodSelected = paymentMethodSelected = paymentMethod.value
//     } else {
//         paymentMethodSelected = paymentMethod.value + " " + selectedPaymentInstallment.value + "x"
//     }
//     //  FALTA OS PAGAMENTOS*****************************************************************************************

//     const finishedSale = {
//         "meuId": newMyId(allUserSales()),
//         "usuarioId": usuarioCorrente.id,
//         "clientesFornecedoresMeuId": currentCliente,
//         "tipoVenda": "produto",
//         "dataVenda": new Date(),
//         "quantidadeItens": totalizerQuantity(productsToSale),
//         "valorTotal": totalizerTotal(productsToSale),
//         "valorDescontoAcrescimo": (totalizerTotal(productsToSale) - totalWithDiscountGlobal),
//         "valorComDesconto": totalWithDiscountGlobal,
//         "itens": productsToSale,
//         "formaDePagamento": paymentMethodSelected,
//         "observacoes": saveObservacoes,
//         "insumosServico": null
//     };
//     const currentSales = allUserSales()
//     currentSales.push(finishedSale);
//     localStorage.setItem('vendas', JSON.stringify(currentSales));
//     const payments = []







//     const modalInstance = bootstrap.Modal.getInstance(checkoutModal);
//     if (modalInstance) {
//         modalInstance.hide();
//     }
//     alert('Venda gravada com sucesso!')
//     location.reload();

// }


function finishSale() {
    let paymentMethodSelected = ""
    if (selectedPaymentInstallment.value == 1) {
        paymentMethodSelected = paymentMethod.options[paymentMethod.selectedIndex].text;
    } else {
        paymentMethodSelected = paymentMethod.options[paymentMethod.selectedIndex].text + " " + selectedPaymentInstallment.value + "x"
    }
    const newSaleId = newMyId(allUserSales());
    const currentClienteObject = selectedClient ? selectedClient : null;
    const clienteId = currentClienteObject ? currentClienteObject.meuId : null; // Pega o ID do cliente ou null
    const totalAmount = totalWithDiscountGlobal;
    const paymentMethodType = paymentMethod.value; // 'credito', 'dinheiro', etc.
    const finishedSale = {
        "meuId": newSaleId,
        "usuarioId": usuarioCorrente.id,
        "clientesFornecedoresMeuId": clienteId, // Corrigido: Usar o ID do cliente
        "tipoVenda": "produto",
        "dataVenda": new Date().toISOString(), // Usar formato ISO para consistência
        "quantidadeItens": totalizerQuantity(productsToSale),
        "valorTotal": totalizerTotal(productsToSale),
        "valorDescontoAcrescimo": (totalizerTotal(productsToSale) - totalAmount),
        "valorComDesconto": totalAmount,
        "itens": productsToSale,
        "formaDePagamento": paymentMethodSelected,
        "observacoes": saveObservacoes.value, // Certifique-se de pegar o .value
        "insumosServico": null
    };
    const currentSales = allUserSales()
    currentSales.push(finishedSale);
    localStorage.setItem('vendas', JSON.stringify(currentSales));

    const allContas = allUserContasReceber();
    let nextContaMeuId = newMyId(allContas); // Pega o próximo ID para contas
    const newPayments = [];
    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    let numberOfInstallments = 1;
    if (paymentMethodType === 'credito') {
        numberOfInstallments = parseInt(selectedPaymentInstallment.value, 10);
    }

    const totalInCents = Math.round(totalAmount * 100);
    const baseInstallmentCents = Math.floor(totalInCents / numberOfInstallments);
    let remainderCents = totalInCents % numberOfInstallments;

    for (let i = 1; i <= numberOfInstallments; i++) {
        let currentInstallmentCents = baseInstallmentCents;
        if (remainderCents > 0) {
            currentInstallmentCents++;
            remainderCents--;
        }
        const installmentValue = currentInstallmentCents / 100;

        let status = "pendente";
        let dataPagamento = null;
        let dataVencimento;
        let descricao;

        if (paymentMethodType === 'credito' && numberOfInstallments > 1) {
            const dueDate = new Date(hoje);
            dueDate.setDate(dueDate.getDate() + (i * 30));
            dataVencimento = dueDate.toISOString().split('T')[0];
            descricao = `Recebimento Venda #${newSaleId} (Parc. ${i}/${numberOfInstallments})`;
        } else {
            status = "pago";
            dataPagamento = hojeFormatado;
            dataVencimento = hojeFormatado;
            descricao = `Recebimento Venda #${newSaleId} (${paymentMethodSelected})`;
        }

        const newConta = {
            "meuId": nextContaMeuId,
            "tipo": "receber",
            "vendaId": newSaleId,
            "clientes_fornecedoresId": clienteId,
            "descricao": descricao,
            "valor": installmentValue,
            "data_vencimento": dataVencimento,
            "data_pagamento": dataPagamento,
            "status": status,
            "usuarioId": usuarioCorrente.id
        };

        newPayments.push(newConta);
        nextContaMeuId++;
    }

    const allContasAtualizado = [...allContas, ...newPayments];
    localStorage.setItem('contasReceber', JSON.stringify(allContasAtualizado));

    const modalInstance = bootstrap.Modal.getInstance(checkoutModal);
    if (modalInstance) {
        modalInstance.hide();
    }
    alert('Venda gravada com sucesso!')
    location.reload();
}



totalizerQuantity([]);
totalizerTotal([]);
searchClients();
listOfClientes();
listOfProductsSearch();
listenerListOfProducts();
searchProducts();

