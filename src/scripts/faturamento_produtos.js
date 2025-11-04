let selectedClient = null;
let allUserClients = [];
let clientsToShow = [];
let allUserItens = [];
let productsToSale = [];

const clientInput = document.getElementById('selected-client');
const searchInput = document.getElementById('search-client');
const tbodyListOfClients = document.getElementById('list-of-clients');
const tbodyListOfProducts = document.getElementById('list-of-products');
const modalClient = document.getElementById('select-client-modal');
const buttonUnselectClient = document.getElementById('button-unselect-client');
const itensForm = document.getElementById('itens-form');
const itensInput = document.getElementById('itens-input');
const quantitySpan = document.getElementById('quantity');
const totalSpan = document.getElementById('totalizer-total');



buttonUnselectClient.addEventListener('click', removeClient);
itensForm.addEventListener('submit', insertProduct);

function insertProduct(event) {
    event.preventDefault();
    const productToSearch = itensInput.value
    const productToInsert = allUserItens.find(item => item.meuId == productToSearch || item.codigo_barras == productToSearch)
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

function makeDecimal(number) {
    return number.toLocaleString('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

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

function totalizerQuantity(productsToSale) {
    const quantify = productsToSale.reduce((acumulador, produto) => {
        return acumulador + produto.quantidade;
    }, 0);
    quantitySpan.innerHTML = quantify;
}

function totalizerTotal(productsToSale) {
    const valorTotal = productsToSale.reduce((acumulador, produto) => {
        const subtotalProduto = produto.quantidade * produto.preco_venda;
        return acumulador + subtotalProduto;
    }, 0);
    totalSpan.innerHTML = makeDecimal(valorTotal);
}


function removeClient(event) {
    if (event.target.id === 'unselect-client') {
        selectedClient = null;
        clientInput.value = "Consumidor Final";
        buttonUnselectClient.innerHTML = '';
    }

}

function loadClients() {
    // Busca TODOS os clientes
    allUserClients = JSON.parse(localStorage.getItem('clientes_fornecedores')).filter(item => {
        return item.tipo === "cliente" && item.usuarioId === usuarioCorrente.id;
    });
}

function loadProducts() {
    // Busca TODOS os clientes
    allUserItens = JSON.parse(localStorage.getItem('produtos_servicos')).filter(item => {
        return item.tipo === "produto" && item.usuarioId === usuarioCorrente.id;
    });
}

function firstClients() {
    const initialClients = allUserClients.slice(0, 10);
    return initialClients;
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

function searchClients() {
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        if (searchTerm === '') {
            clientsToShow = allUserClients.slice(0, 10);
        } else {
            clientsToShow = allUserClients.filter(cliente => {
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
        const selectedClient = allUserClients.find(client => client.id == clientId);
        if (selectedClient) {
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
totalizerQuantity([]);
loadClients();
loadProducts();
renderClients(firstClients());
searchClients();
listOfClientes();
listenerListOfProducts();