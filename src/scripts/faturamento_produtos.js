let selectedClientForSale = null;
let allUserClients = []; 
let tbodyListOfClients;

function loadClients() {
    // Busca TODOS os clientes
    allUserClients = JSON.parse(localStorage.getItem('clientes_fornecedores')).filter(item => {
        return item.tipo === "cliente" && item.usuarioId === usuarioCorrente.id;
    });

    tbodyListOfClients = document.getElementById('list-of-clients');

    // Renderiza os 10 primeiros
    const initialClients = allUserClients.slice(0, 10);
    const rowsHtml = initialClients.map(cliente => {
        return `
    <tr data-id="${cliente.id}">
      <th><a href="#">${cliente.nome_razao_social}</a></th>
    </tr>
  `;
    }).join('');
    tbodyListOfClients.innerHTML = rowsHtml;

    // FILTRO DE BUSCA 
    const searchInput = document.getElementById('search-client');
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        let clientsToShow = []; 

        if (searchTerm === '') {
            clientsToShow = allUserClients.slice(0, 10);
        } else {
            clientsToShow = allUserClients.filter(cliente => {
                const clientName = cliente.nome_razao_social.toLowerCase();
                return clientName.startsWith(searchTerm);
            });
        }

        const filteredHtml = clientsToShow.map(cliente => {
            return `
        <tr data-id="${cliente.id}">
          <th><a href="#">${cliente.nome_razao_social}</a></th>
        </tr>
      `;
        }).join('');
        tbodyListOfClients.innerHTML = filteredHtml;
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
        const selectedClient = allUserClients.find(client => client.id == clientId); // Usar '==' é seguro aqui pois data-id é string

        if (selectedClient) {
            // Salva o cliente na variável global (para usar na "venda")
            selectedClientForSale = selectedClient;
            console.log("Cliente selecionado:", selectedClientForSale);

            // Atualiza o valor do input fora do modal
            const clientInput = document.getElementById('select_cliente_fat_produtos');
            clientInput.value = selectedClient.nome_razao_social;

            // Fecha o modal (usando a API do Bootstrap)
            const modalElement = document.getElementById('SelectClientesModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    });

    console.log("Todos os clientes carregados:", allUserClients);
}

function searchItem() { }
function addItem() { }
function save() { }
function finish() { }

loadClients();