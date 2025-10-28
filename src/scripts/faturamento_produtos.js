var client

function searchClient() {
    // if (client == null) {
    //     console.log('consumidor final');
    // }

}

function loadClients() {
    // const allClients = ;
    const userClients = JSON.parse(localStorage.getItem('clientes_fornecedores')).filter(item => {
        return item.tipo === "cliente" && item.usuarioId === usuarioCorrente.id;
    });

    tbodyListOfClients = document.getElementById('list-of-clients')

    // const rowsHtml = userClients.slice(0, 10).map(cliente => {

    const rowsHtml = userClients.map(cliente => {
        return `
    <tr data-id="${cliente.id}">
      <th><a href="#">${cliente.nome_razao_social}</a></th>
    </tr>
  `;
    });

    // 3. Junta todas as strings do array em uma única string (sem vírgulas)
    const finalHtmlString = rowsHtml.join('');

    // 4. Insere o HTML gerado dentro do <tbody>
    tbodyListOfClients.innerHTML = finalHtmlString;

    console.log(userClients)
    // array.forEach(allClients => { 

    // });








    // var prods = '';
    // for (i=0; i < db.dados.length; i++) {
    //     prods += `<p class="produto-item">Produto: ${ db.dados[i].titulo } <br> <img src="${ db.dados[i].imagem }"></p>`;
    // }
    // document.getElementById('lista-produtos').innerHTML = prods;
}


function searchItem() { }
function addItem() { }
function save() { }
function finish() { }

searchClient();
loadClients();