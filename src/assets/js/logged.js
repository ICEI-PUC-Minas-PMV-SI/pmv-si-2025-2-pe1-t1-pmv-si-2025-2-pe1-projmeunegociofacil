
// login redirect to:
const LOGIN_URL = "../index.html";


var usuarioCorrente = {};



// if (!usuarioCorrente.email_login) {
//     window.location.href = LOGIN_URL;
// }



// Associa ao evento de carga da página a função para verificar se o usuário está logado
window.addEventListener('load', initPage);

function initPage() {
    document.getElementById('btn_logout').addEventListener('click', logoutUser);
    document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome;
}






















function initLoginApp() {
    // PARTE 1 - INICIALIZA USUARIOCORRENTE A PARTIR DE DADOS NO LOCAL STORAGE, CASO EXISTA
    usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    }

    // PARTE 2 - INICIALIZA BANCO DE DADOS DE USUÁRIOS
    // Obtem a string JSON com os dados de usuários a partir do localStorage
    var usuariosJSON = localStorage.getItem('usuarios');

    db = JSON.parse(usuariosJSON);

};

function logoutUser() {
    sessionStorage.setItem('usuarioCorrente', JSON.stringify({}));
    window.location = LOGIN_URL;
}


initLoginApp();