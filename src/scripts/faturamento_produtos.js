let selectedClient = null;
let allUserClients = [];
let clientsToShow = [];
let allUserItens = [];
let itensToSale = [];


const clientInput = document.getElementById('selected-client');
const tbodyListOfClients = document.getElementById('list-of-clients');
const modalClient = document.getElementById('select-client-modal');
const buttonUnselectClient = document.getElementById('button-unselect-client');
const itensForm = document.getElementById('itens-form');
const itensInput = document.getElementById('itens-input');

buttonUnselectClient.addEventListener('click', removeClient);
itensForm.addEventListener('submit', insertItem);

function insertItem(event) {
    event.preventDefault();
    const itemToSearch = itensInput.value
    const itemToInsert = allUserItens.find(item => item.meuId == itemToSearch)
    if (itemToInsert === undefined) {
        alert('Produto não encontrado')
        return
    }
    const itemOnList = itensToSale.find(item => item.meuId == itemToSearch);
    if (itemOnList) {
        itemOnList.quantidade++;
        alert('quantidade ajustada')
        console.log(itensToSale)
        itensInput.value = ''
        return

    }
    const itemToInsertWhitQuantity = { ...itemToInsert, quantidade: 1 };
    itensToSale.push(itemToInsertWhitQuantity);
    console.log(itensToSale)
    itensInput.value = ''
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

function loadItens() {
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
    const searchInput = document.getElementById('search-client');
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

    tbodyListOfClients.addEventListener('click', (event) => {
        // Impede que o link <a href="#"> mude a URL
        event.preventDefault();

        // Encontra a linha <tr> mais próxima de onde o usuário clicou
        const clickedRow = event.target.closest('tr');

        // Se o usuário clicou em um espaço vazio (e não numa linha), não faz nada
        if (!clickedRow) return;

        // Pega o ID do cliente no 'data-id' da <tr>
        const clientId = clickedRow.dataset.id;

        // Encontra o objeto completo do cliente na lista 'allUserClients'
        const selectedClient = allUserClients.find(client => client.id == clientId);

        if (selectedClient) {
            // Atualiza o valor do input fora do modal
            clientInput.value = selectedClient.nome_razao_social;


            const modalInstance = bootstrap.Modal.getInstance(modalClient);
            if (modalInstance) {
                modalInstance.hide();
            }
            buttonUnselectClient.innerHTML = `  <div class="input-group-append">
    <button id="unselect-client" class="btn btn-outline-secondary selected-client" type="button">x</button>
  </div>`;
        }
    });

}



loadClients();
loadItens();
renderClients(firstClients());
searchClients();