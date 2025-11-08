export function newMyId(a) {
    const arrayToMakeMyId = a
    const maxId = arrayToMakeMyId.reduce((max, usuario) => {
        const currentId = Number(usuario.meuId);
        return currentId > max ? currentId : max;
    }, -1);
    const newId = maxId + 1;
    return newId
}