import { makeDecimal, totalizerQuantity, totalizerTotal } from "./utils.js";

let selectedClient = null;
let productsToSale = [];

const clientInput = document.getElementById('selected-client');
const searchClientInput = document.getElementById('search-client');
const searchItensInput = document.getElementById('search-itens');
const btnSearchItens = document.getElementById('btn-search-itens');
const tbodyListOfClients = document.getElementById('list-of-clients');
const tbodyListOfProducts = document.getElementById('list-of-products');
const modalClient = document.getElementById('select-client-modal');
const buttonUnselectClient = document.getElementById('button-unselect-client');
const itensForm = document.getElementById('itens-form');
const itensInput = document.getElementById('itens-input');

buttonUnselectClient.addEventListener('click', removeClient);
itensForm.addEventListener('submit', insertProduct);

// ITENS - MUDAR TUDO PARA ITENS OU PRODUCS
function allUserItens() {
    return JSON.parse(localStorage.getItem('produtos_servicos')).filter(item => {
        return item.tipo === "produto" && item.usuarioId === usuarioCorrente.id;
    });
}

function insertProduct(event) {
    event.preventDefault();
    const productToSearch = itensInput.value
    const productToInsert = allUserItens().find(item => item.meuId == productToSearch || item.codigo_barras == productToSearch)
    if (productToInsert === undefined) {
        alert('Produto não encontrado')
        return
    }
    const productOnList = productsToSale.find(item => item.meuId == productToSearch || item.codigo_barras == productToSearch);
    if (productOnList) {
        productOnList.quantidade++;
    } else {
        const productToInsertWhitQuantity = { ...productToInsert, quantidade: 1 };
        productsToSale.push(productToInsertWhitQuantity);
    }
    renderProducts(productsToSale)
    totalizerQuantity(productsToSale);
    totalizerTotal(productsToSale);
    console.log(productsToSale)
    itensInput.value = ''
}


function searchItens() {
    let itensToShow = [];
    renderItensSearch(itensToShow);

    function makeSearch() {
        const searchTerm = searchItensInput.value.toLowerCase().trim();
        if (searchTerm === '') {
            renderItensSearch([]);
        } else {
            itensToShow = allUserItens().filter(item => {
                const meuId = String(item.meuId || '').toLowerCase();
                const codBarras = String(item.codigo_barras || '').toLowerCase();
                const desc = String(item.descricao || '').toLowerCase();
                const ref = String(item.referencia || '').toLowerCase();

                // Agora sim, comparando minúsculo com minúsculo
                return meuId.includes(searchTerm) ||
                    codBarras.includes(searchTerm) ||
                    desc.includes(searchTerm) ||
                    ref.includes(searchTerm);
            });
            renderItensSearch(itensToShow);
            searchItensInput.value = '';
        }
    }

    btnSearchItens.addEventListener('click', () => {
        makeSearch();
    });

    searchItensInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            makeSearch();
        }
    });
}

function renderItensSearch(itensToShow) {
    console.log(itensToShow)
}

function renderProducts(productsToSale) {
    const rowsHtml = productsToSale.map(product => {
        return `
        <tr data-id="${product.id}">
        <th class="text-center pe-4 ps-4" scope="row">${product.meuId}</th>
        <td class="text-start pe-4 ps-4">${product.descricao}</td>
        <td class="text-center pe-4 ps-4"><input class="input-quantidade text-center" value="${product.quantidade}" readonly>
        </td>
        <td class="text-end pe-4 ps-4">${makeDecimal(product.preco_venda)}</td>
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
    tbodyListOfProducts.addEventListener('click', (event) => {
        event.preventDefault();
        const deleteButton = event.target.closest('.btn-outline-danger');
        if (deleteButton) {
            event.preventDefault();
            const row = deleteButton.closest('tr');
            const productId = row.dataset.id;
            if (window.confirm("Tem certeza que deseja excluir este produto?")) {
                const indexToRemove = productsToSale.findIndex(product => product.id == productId);
                if (indexToRemove > -1) {
                    productsToSale.splice(indexToRemove, 1);
                }
                renderProducts(productsToSale);
                totalizerQuantity(productsToSale);
                totalizerTotal(productsToSale);

            }
        }

    });
}

// CLIENTS

function allUserClients() {
    return JSON.parse(localStorage.getItem('clientes_fornecedores')).filter(item => {
        return item.tipo === "cliente" && item.usuarioId === usuarioCorrente.id;
    });
}

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
                const clientName = cliente.nome_razao_social.toLowerCase();
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
        const selectedClientSearch = allUserClients().find(client => client.id == clientId);
        if (selectedClientSearch) {
            selectedClient = selectedClientSearch;
            clientInput.value = selectedClient.nome_razao_social;

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
    <tr data-id="${cliente.id}">
      <th><a href="#">${cliente.nome_razao_social}</a></th>
    </tr>
  `;
    }).join('');
    tbodyListOfClients.innerHTML = rowsHtml;
}

function removeClient(event) {
    if (event.target.id === 'unselect-client') {
        selectedClient = null;
        clientInput.value = "Consumidor Final";
        buttonUnselectClient.innerHTML = '';
    }

}

totalizerQuantity([]);
searchClients();
searchItens();
listOfClientes();
listenerListOfProducts();
