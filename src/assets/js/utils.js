function newMyId(a) {
    const arrayToMakeMyId = a
    const maxId = arrayToMakeMyId.reduce((max, usuario) => {
        const currentId = Number(usuario.meuId);
        return currentId > max ? currentId : max;
    }, -1);
    const newId = maxId + 1;
    return newId
}

function makeDecimal(number) {
    const numberVerified = number ? number : 0
    return numberVerified.toLocaleString('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

}

export { makeDecimal, newMyId }