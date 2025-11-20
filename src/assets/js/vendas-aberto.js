import { loggedUser } from "./auth.js";
import { makeDecimal } from "./utils.js";
const divRender = document.getElementById('div-render')



function allUserUnclosedSales() {
  try {
    return JSON.parse(localStorage.getItem('vendasEmAberto')).filter(item => {
      return item.usuarioId === loggedUser().id;
    });
  }
  catch {
    return []
  }
}

if (allUserUnclosedSales().length > 0) {
  renderUnclosedSales()
} else {
  divRender.innerHTML = `<div class="text-center mt-5"><h2>Nenhuma venda em aberto</h2> </div>`

}


function renderUnclosedSales() {
  const initRows = `<div class="card-body p-3">
          <div class="table-responsive">
            <table class="table table-hover mb-0" id="tabelaContasPagar">
              <thead class="table-light">
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Tipo</th>
                  <th class="text-end" scope="col">Valor</th>
                  <th class="text-center" scope="col">Ação</th>
                </tr>
              </thead>
              <tbody>`
  const endRows = `</tbody>
            </table>
          </div>
        </div>`
  const rowsHtml = allUserUnclosedSales().map(sale => {
    const tipoVenda = sale.tipoVenda == "produto" ? "Produto" : "Serviço"
    let url = ""
    if (sale.tipoVenda == "produto") {
      url = "../assets/static/receipt-products.html?id=" + sale.meuId
    } else if (sale.tipoVenda == "servico") {
      url = "../assets/static/receipt-services.html?id=" + sale.meuId
    }
    return `

<tr data-id="${sale.meuId}">
                  <td>${sale.meuId}</td>
                  <td>${sale.clientesFornecedoresMeuId.nomeRazaoSocial}</td>
                  <td>${tipoVenda}</td>
                  <td class="text-end">${makeDecimal(sale.valorTotal)}</td>
                  <td class="text-center">
                    <button class="btn btn-outline-primary btn-sm me-1"><i class="bi bi-pencil"></i></button>
                    <a href="${url}"> <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button> </a>
                  </td>
                </tr>
  `;
  }).join('');
  divRender.innerHTML = initRows + rowsHtml + endRows
}