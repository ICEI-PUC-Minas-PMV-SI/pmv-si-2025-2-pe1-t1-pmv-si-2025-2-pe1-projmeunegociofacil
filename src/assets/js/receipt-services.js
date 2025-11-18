import { loggedUser } from "./auth.js";
import { makeDecimal } from "./utils.js";



const saleId = document.getElementById('sale-number');
const htmlSalesData = document.getElementById('sales-data');
const htmlNameBuyer = document.getElementById('name-buyer');
const htmlSaleDate = document.getElementById('sale-date');
const htmlCalcDiscount = document.getElementById('calc-discount')
const tbodyProducts = document.getElementById('tbody-products')
const tbodyInstallments = document.getElementById('tbody-installments')
const title = document.getElementById('title')
const inputsDiv = document.getElementById('inputs-div')
const paymentTitle = document.getElementById('installments-title')



function allUserSales() {
    return JSON.parse(localStorage.getItem('vendas')).filter(item => {
        return item.usuarioId === loggedUser().id;
    });
}


function allUserClients() {
    return JSON.parse(localStorage.getItem('clientesFornecedores')).filter(item => {
        return item.tipo === "cliente" && item.usuarioId === loggedUser().id;
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

function totalizerInputs(iInputsToSale = currentSale.insumosServico) {
    let totalInputs = 0
    if (iInputsToSale) {
        totalInputs = iInputsToSale.reduce((acumulador, inputs) => {
            const subtotalInputs = inputs.subtotal;
            return acumulador + subtotalInputs;
        }, 0);
    }
    return totalInputs
}

const urlParams = new URLSearchParams(window.location.search);
const receiptId = urlParams.get('id');
const currentSale = allUserSales().find(item => item.meuId == receiptId)
const currentInstallments = allUserContasReceber().filter(item => item.vendaId == receiptId)
const currentInstallmentsSearch = currentInstallments ? currentInstallments : []


if (!receiptId || !currentSale) {
    alert('Venda não encontrada')
    window.location.assign("../../dashboard.html")
}

const searchcurrentClient = allUserClients().find(item => item.meuId == currentSale.clientesFornecedoresMeuId)

const currentClient = searchcurrentClient ? searchcurrentClient : {
    "nomeRazaoSocial": "Consumidor Final",
    "cpfCnpj": "",
    "tem_cnpj": false,
    "telefone": "",
    "endereco": ""
}

console.log(currentInstallmentsSearch)

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
                            <strong><span>${loggedUser().tem_cnpj ? "Razão Social: " : "Nome: "}</span></strong> <span>${loggedUser().tem_cnpj ? loggedUser().razao_social : loggedUser().nome}</span> <br>
                            <strong><span>${loggedUser().tem_cnpj ? "CNPJ: " : "CPF: "}</span></strong> <span>${loggedUser().cpf_cnpj}</span> <br>
                            <strong><span>Endereço:</span></strong> <span>${loggedUser().endereco}</span>
                            <br>
                            <strong><span>Telefone: </span></strong> <span>${loggedUser().telefone}</span>
                            </div>
                            <div class="col-6">
                            <strong><span>${currentClient.tem_cnpj ? "Razão Social: " : "Nome: "}</span></strong> <span>${currentClient.nomeRazaoSocial}</span> <br>
                            <strong><span>${currentClient.tem_cnpj ? "CNPJ: " : "CPF: "}</span></strong> <span>${currentClient.cpfCnpj}</span> <br>
                            <strong><span>Endereço:</span></strong> <span>${currentClient.endereco}</span> <br>
                            <strong><span>Telefone: </span></strong> <span>${currentClient.telefone}</span>
                            </div>
                            </div>
                            </div>`
const saleDateString = new Date(currentSale.dataVenda).toLocaleDateString('pt-BR')
const buyerName = currentClient.nomeRazaoSocial


const htmlInputsData = `<span><strong>Produtos: </strong>${makeDecimal(currentSale.valorTotal-totalizerInputs())}</span><br>
                        <span><strong>Insumos: </strong>${makeDecimal(totalizerInputs())}</span><br>
                        `
const htmlCalcDiscountData = ` <span><strong>Subtotal: </strong>${makeDecimal(currentSale.valorTotal)}</span><br>
                            <span><strong>Desconto: </strong> ${makeDecimal(currentSale.valorDescontoAcrescimo)}</span><br>
                            <span> <strong>Valor Total: </strong>${makeDecimal(currentSale.valorComDesconto)}</span> `
paymentTitle.innerHTML = `Forma de Pagamento: ${currentSale.formaDePagamento}`


htmlNameBuyer.innerHTML = buyerName
htmlSaleDate.innerHTML = saleDateString
if (currentSale.insumosServico.length > 0) {
    htmlCalcDiscount.innerHTML = htmlInputsData + htmlCalcDiscountData
} else { htmlCalcDiscount.innerHTML = htmlCalcDiscountData }

const htmlTbodyInstallments = currentInstallmentsSearch.map(installment => {
    return `
            <tr>
            <td>${new Date(installment.data_vencimento).toLocaleDateString('pt-BR')}</td>
            <td class="text-center"><strong>${installment.parcela}</strong></td>
            <td class="text-end">${makeDecimal(installment.valor)}</td>
            </tr>  
  `;
}).join('');

const htmlTbodyProducts = currentSale.itens.map(product => {
    return `
        <tr>
        <th scope="row">${product.meuId}</th>
        <td>${product.descricao}</td>
        <td class="text-center">${product.unidade}</td>
        <td class="text-center">${product.quantidade}</td>
        <td class="text-end">${makeDecimal(product.precoVenda / product.quantidade)}</td>
        <td class="text-end">${makeDecimal(product.precoVenda)}</td>
        </tr>
  `;
}).join('');
tbodyProducts.innerHTML = htmlTbodyProducts;
tbodyInstallments.innerHTML = htmlTbodyInstallments
title.innerHTML = "Meu Negócio Fácil - Comprovante " + String(currentSale.meuId).padStart(5, '0')



const inputsInitHtml = `<div class="container p-2"></div>
         <span> <strong>Insumos Utilizados: </span> </strong>
        <div class="sale-itens card mb-4">
        <div class="card-body p-0">
        <div class="container">
        <div class="products_list row g-2 align-items-center">

        <table class="table">
        <thead class="table-light x-small">
        <tr>
        <th class="text-start" scope="col">Descrição</th>
        <th class="text-center" scope="col">Quantidade</th>
        <th class="text-center" scope="col">Valor Unitário</th>
        <th class="text-end" scope="col">Subtotal</th>
        </tr>
        </thead>
        <tbody id="tbody-inputs-div" class="table-group-divider" style="font-size: small"> `

const inputsEndHtml = `     
        </tbody>
        </table>
        </div>
        </div>
        </div>
        </div>`

if (currentSale.insumosServico.length > 0) {
    const inputsRowsHtml = currentSale.insumosServico.map(input => {
        return `
           <tr>
            <td class="text-start" scope="col">${input.descricao}</td>
            <td class="text-center" scope="col">${makeDecimal(input.quantidade)}</td>
            <td class="text-center" scope="col">${makeDecimal(input.precoUnitario)}</td>
            <td class="text-end" scope="col">${makeDecimal(input.subtotal)}</td>
            </tr>
            `;
    }).join('');
    inputsDiv.innerHTML = inputsInitHtml + inputsRowsHtml + inputsEndHtml
} else { inputsDiv.innerHTML = "" }

