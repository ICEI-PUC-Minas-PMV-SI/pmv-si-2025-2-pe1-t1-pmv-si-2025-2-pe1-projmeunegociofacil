const quantitySpan = document.getElementById('quantity');
const totalSpan = document.getElementById('totalizer-total');

export function makeDecimal(number) {
    return number.toLocaleString('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

}

export function totalizerQuantity(itensToSale) {
    const quantify = itensToSale.reduce((acumulador, produto) => {
        return acumulador + produto.quantidade;
    }, 0);
    renderTotalizerQuantity(quantify)
    return quantify;
}

function renderTotalizerQuantity(quantify) {
    quantitySpan.innerHTML = quantify;
}


export function totalizerTotal(itensToSale) {
    const valorTotal = itensToSale.reduce((acumulador, produto) => {
        const subtotalProduto = produto.quantidade * produto.preco_venda;
        return acumulador + subtotalProduto;
    }, 0);
    renderTotalizerTotal(valorTotal)
    return valorTotal;
}

function renderTotalizerTotal (valorTotal) {
    totalSpan.innerHTML = makeDecimal(valorTotal);

}