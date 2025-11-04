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

function listOfProducts() {
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
            }
        }
    
    });
}


// function setupProductListListeners() {
//         const deleteButton = event.target.closest('.btn-outline-danger');

//         if (deleteButton) {
//             // Impede qualquer comportamento padrão do botão (como enviar um formulário)
//             event.preventDefault(); 
            
//             // Encontra a linha <tr> mais próxima do botão para pegar o ID
//             const row = deleteButton.closest('tr');
//             const productId = row.dataset.id;
            
//             // 1. Abre a caixa de confirmação
//             const userConfirmed = window.confirm("Tem certeza que deseja excluir este produto?");
            
//             // 2. Se o usuário clicou "OK"
//             if (userConfirmed) {
                
//                 // ----- MÉTODO RECOMENDADO: Atualizar os dados e renderizar -----
                
//                 // A. Encontre o índice do produto na sua array de dados.
//                 //    (Estou assumindo que a array se chama 'productsToSale'
//                 //    e está acessível neste escopo, com base no seu código)
//                 const indexToRemove = productsToSale.findIndex(product => product.id == productId);
                
//                 // B. Se o produto foi encontrado, remova-o da array
//                 if (indexToRemove > -1) {
//                     productsToSale.splice(indexToRemove, 1);
//                 }
                
//                 // C. Renderize a tabela novamente com a array atualizada
//                 //    Isso remove a linha da tela automaticamente.
//                 renderProducts(productsToSale);

//                 // Nota: Se você só quiser remover o item da tela sem
//                 // atualizar a array de dados, você poderia usar 'row.remove()'.
//                 // Mas isso é arriscado, pois seus dados ficariam dessincronizados.
//                 // O método acima (A, B, C) é o mais correto.
//             }
//         }

//         // Bônus: Você pode adicionar a lógica do botão de editar aqui também
//         const editButton = event.target.closest('.btn-outline-primary');
//         if (editButton) {
//             event.preventDefault();
//             const productId = editButton.closest('tr').dataset.id;
//             console.log(`Editar produto ID: ${productId}`);
//             // ... sua lógica para abrir o modal de edição ...
//         }
//     });
// }


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

loadClients();
loadProducts();
renderClients(firstClients());
searchClients();
listOfClientes();
listOfProducts();