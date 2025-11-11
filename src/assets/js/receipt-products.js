const saleId = document.getElementById('sale-number');
const htmlSalesData = document.getElementById('sales-data');


function allUserSales() {
        return JSON.parse(localStorage.getItem('vendas')).filter(item => {
            return item.usuarioId === usuarioCorrente.id;
        });
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
        return JSON.parse(localStorage.getItem('clientesFornecedores')).filter(item => {
            return item.tipo === "cliente" && item.usuarioId === usuarioCorrente.id;
        });
    }

function allUserContasReceber() {
    try {
        return JSON.parse(localStorage.getItem('contasReceber')) || [];
    }
    catch {
        return []
    }
}

const urlParams = new URLSearchParams(window.location.search);
const receiptId = urlParams.get('id');
const currentSale = allUserSales().find(item => item.meuId == receiptId)

// USUSARIOCORRENTnome, nomeRazao, isPj, cpfCNPJ, endereco, telefone, email, senha

if (!receiptId || !currentSale) {
    alert('Venda não encontrada')
    window.location.assign("../../dashboard.html")
}
const currentClient = allUserClients().find(item => item.meuId == currentSale.meuId) 

// INNER
saleId.innerHTML = String(currentSale.meuId).padStart(5, '0')
htmlSalesData.innerHTML = ` <div class="sale-data row ms-2 me-2 mb-4">
                            <div class="row">
                            <div class="col-6">
                            <strong><span>Emissor</span></strong>
                            </div>
                            <div class="col-6">
                            <strong><span>Destinatário</span></strong>
                            </div>
                            </div>
                            <div class="row">
                            <div class="col-6">
                            <strong><span>${usuarioCorrente.tem_cnpj ? "Razão Social: " : "Nome: "}</span></strong> <span>${usuarioCorrente.tem_cnpj ? usuarioCorrente.razao_social : usuarioCorrente.nome }</span> <br>
                            <strong><span>CNPJ:</span></strong> <span>00.000.000/0001-00</span> <br>
                            <strong><span>Endereço:</span></strong> <span>Rua das Flores, 123, São Paulo,
                            SP</span>
                            <br>
                            <strong><span>Telefone: </span></strong> <span>(11) 99999-8888</span>
                            </div>
                            <div class="col-6">
                            <strong><span>${currentClient ? "Razão Social: " : "Nome: "}</span></strong> <span>${currentClient.nomeRazaoSocial}</span> <br>
                            <strong><span>CNPJ:</span></strong> <span>00.000.000/0001-00</span> <br>
                            <strong><span>Endereço:</span></strong> <span>Rua das Flores, 123, São Paulo,
                            SP</span> <br>
                            <strong><span>Telefone: </span></strong> <span>(11) 99999-8888</span>
                            </div>
                            </div>
                            </div>`



