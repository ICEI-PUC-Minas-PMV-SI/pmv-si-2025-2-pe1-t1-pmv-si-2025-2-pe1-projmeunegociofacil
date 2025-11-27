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

function init() {
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
              <tbody id="list-of-sales">`
    const endRows = `</tbody>
            </table>
          </div>
        </div>`
    const rowsHtml = allUserUnclosedSales().map(sale => {
      const tipoVenda = sale.tipoVenda == "produto" ? "Produto" : "Serviço"
      let url = ""
      if (sale.tipoVenda == "produto") {
        url = "../auth/index.html?page=faturamento_produtos&unclosed-sale=" + sale.meuId
      } else if (sale.tipoVenda == "servico") {
        url = "../auth/index.html?page=faturamento_servicos&unclosed-sale=" + sale.meuId
      }
      const clientName = typeof(sale.clientesFornecedoresMeuId) == "string" ? sale.clientesFornecedoresMeuId : sale.clientesFornecedoresMeuId.nomeRazaoSocial

      return `

<tr data-id="${sale.meuId}">
                  <td>${sale.meuId}</td>
                  <td>${clientName}</td>
                  <td>${tipoVenda}</td>
                  <td class="text-end">${makeDecimal(sale.valorTotal)}</td>
                  <td class="text-center">
                    <a href="${url}"> <button class="btn btn-outline-primary btn-sm me-1"><i class="bi bi-pencil"></i></button></a>
                    <button class="btn btn-outline-danger btn-sm"><i class="bi bi-trash"></i></button> 
                  </td>
                </tr>
  `;
    }).join('');
    divRender.innerHTML = initRows + rowsHtml + endRows
    listenerListOfSales()
  }
}

function listenerListOfSales() {
  const tbodyListOfSales = document.getElementById('list-of-sales')
  tbodyListOfSales.addEventListener('click', (event) => {
    const deleteButton = event.target.closest('.btn-outline-danger');
    const allSalesTemp = allUserUnclosedSales()
    if (deleteButton) {
      event.preventDefault();
      const row = deleteButton.closest('tr');
      const saleRowId = row.dataset.id;
      console.log(saleRowId)
      if (window.confirm("Deseja realmente excluir a venda em aberto?")) {
        if (allSalesTemp.length > 0) {
          const indexToRemove = allSalesTemp.findIndex(sale => sale.meuId == saleRowId && sale.usuarioId === loggedUser().id);
          if (indexToRemove > -1) {
            allSalesTemp.splice(indexToRemove, 1);
            localStorage.setItem('vendasEmAberto', JSON.stringify(allSalesTemp));
            alert('Venda excluída com sucesso!')
            if (allUserUnclosedSales().length > 0) {
              init();
              return
            }
          }

        }
        alert('Ocorreu um erro ao excluir a venda.')
      }
    }
  });
}

init()