import { authPage } from "./config.js"
import { allUsers } from "./utils.js";
import { newUser } from "./signup.js";


async function makeTest() {

    if (localStorage.length === 0) {
        alert('LocalStorage vazio, carregando arquivos de teste...');

        try {
            const response = await fetch('assets/data/maketest.json');
            const makeTestData = await response.json();
            Object.keys(makeTestData).forEach(key => {
                const data = makeTestData[key];
                localStorage.setItem(key, JSON.stringify(data));
            })

            alert('Arquivos de teste carregados com sucesso. \n\nEfetue login utilizando os dados:\nLOGIN: admin@admin.com\nSENHA: admin');
            console.log(localStorage.getItem('usuarios'))
            console.log(localStorage.getItem('clientes_fornecedores'))
            console.log(localStorage.getItem('produtos_servicos'))
            console.log(localStorage.getItem('vendas'))
            console.log(localStorage.getItem('faturas'))
            console.log(localStorage.getItem('agenda_compromissos'))

        } catch {
            alert('Ocorreu um erro ao carregar os dados de teste.');
        }
    }
}


function searchUser(email_login, senha) {
    if (allUsers().length !== 0) {
        const userToLogin = allUsers().find(user => user.email_login === email_login && user.senha === senha);
        if (userToLogin) {
            sessionStorage.setItem('loggedUser', JSON.stringify(userToLogin));
            return userToLogin
        }
    }
}


function performLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const result = searchUser(username, password);
    if (result) {
        window.location.href = authPage;
    }
    else {
        alert('Usuário ou senha incorretos');
    }
}

document.getElementById('login-form').addEventListener('submit', performLogin);

document.getElementById('btn_salvar').addEventListener('click', newUser);

makeTest()
