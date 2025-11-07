import { makeDecimal, totalizerQuantity, totalizerTotal } from "./utils.js";

let selectedClient = null;
let productsToSale = [];

const clientInput = document.getElementById('selected-client');
const searchClientInput = document.getElementById('search-client');
const searchProductsInput = document.getElementById('search-products-input');
const btnSearchProducts = document.getElementById('btn-search-products');
const tbodyListOfClients = document.getElementById('list-of-clients');
const tableProductsSearch = document.getElementById('table-products-search');
const tbodyListOfProducts = document.getElementById('list-of-products');
const modalClient = document.getElementById('select-client-modal');
const modalSearchProducts = document.getElementById('search-products-modal');
const saveModal = document.getElementById('save-modal')
const buttonUnselectClient = document.getElementById('button-unselect-client');
const productsForm = document.getElementById('products-form');
const productsInput = document.getElementById('products-input');
const saveClient = document.getElementById('save-client');
const saveTelefone = document.getElementById('save-telefone');
const saveCpfCnpj = document.getElementById('save-cpf-cnpj');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('save-btn');



btnCancel.addEventListener('click', cancelSale)
btnSave.addEventListener('click', save)
modalClient.addEventListener('hidden.bs.modal', cleanSearch);
modalSearchProducts.addEventListener('hidden.bs.modal', cleanSearch);
buttonUnselectClient.addEventListener('click', removeClient);
productsForm.addEventListener('submit', insertProductFromInput);

// INIT
function allUserProducts() {
    return JSON.parse(localStorage.getItem('produtosServicos')).filter(item => {
        return item.tipo === "produto" && item.usuarioId === usuarioCorrente.id;
    });
}

function allUserClients() {
    return JSON.parse(localStorage.getItem('clientesFornecedores')).filter(item => {
        return item.tipo === "cliente" && item.usuarioId === usuarioCorrente.id;
    });
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
        cleanSale();
    }
}

function cleanSale() {
    cleanSearch();
    productsToSale = [];
    renderProducts(productsToSale);
    totalizerQuantity(productsToSale);
    totalizerTotal(productsToSale);
    selectedClient = null;
    saveClient.value = "";
    saveTelefone.value = "";
    saveCpfCnpj.value = "";
    clientInput.value = "Consumidor Final";
    buttonUnselectClient.innerHTML = '';
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
    if (productsToSale.length == 0) {
        alert('Não é possível gravar uma venda sem itens.')
    }
    else if (selectedClient = null || saveClient.value.length < 5) {
        saveClient.classList.add('is-invalid');
    }
    else {
        saveClient.classList.remove('is-invalid');
        console.log(selectedClient = null || saveClient.value.length)
        console.log(productsToSale)
        console.log(totalizerQuantity(productsToSale))
        console.log(totalizerTotal(productsToSale))
        cleanSale();
        const modalInstance = bootstrap.Modal.getInstance(saveModal);
        if (modalInstance) {
            modalInstance.hide();
        }
        alert('Venda gravada com sucesso!')
    }


}

totalizerQuantity([]);
totalizerTotal([]);
searchClients();
listOfClientes();
listOfProductsSearch();
listenerListOfProducts();
searchProducts();
