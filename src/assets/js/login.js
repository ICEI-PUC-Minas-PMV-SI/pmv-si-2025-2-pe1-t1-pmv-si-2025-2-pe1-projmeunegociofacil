import { authPage } from "./config.js"
import { allUsers } from "./utils.js";
import { newUser } from "./signup.js";

const radioPj = document.getElementById('sign-up-is-pj')
const divNomeFantasia = document.getElementById('div-nome-fantasia')
const radioInstPj = document.getElementById('sign-up-isnt-pj')
const divCpfCnpj = document.getElementById('div-cpf-cnpj')
const divNomeDaEmpresa = document.getElementById('div-nome-da-empresa')
const firstAcessModal = document.getElementById('first-acess-modal')

document.getElementById('login-form').addEventListener('submit', performLogin);
document.getElementById('signup-form').addEventListener('submit', newUser);

// if (firstAcessModal) {
//     const ModalInstance = bootstrap.Modal.getOrCreateInstance(firstAcessModal);
//     ModalInstance.show();
// }

async function makeTest() {
    if (localStorage.length === 0) {
        if (firstAcessModal) {
            const ModalInstance = bootstrap.Modal.getOrCreateInstance(firstAcessModal);
            ModalInstance.show();
        }
        try {
            const response = await fetch('assets/data/maketest.json');
            const makeTestData = await response.json();
            Object.keys(makeTestData).forEach(key => {
                const data = makeTestData[key];
                localStorage.setItem(key, JSON.stringify(data));
            })

            // alert('Arquivos de teste carregados com sucesso. \n\nEfetue login utilizando os dados:\nLOGIN: admin@admin.com\nSENHA: admin');
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

// CHANGER PJ/PF
radioPj.addEventListener('change', () => {
    if (radioPj.checked) {
        divNomeFantasia.innerHTML = ` <label for="sign-up-nome">Nome Fantasia</label>
            <input type="text" class="form-control mb-2" id="sign-up-nome" placeholder="Insira o Nome Fantasia">`
        divCpfCnpj.innerHTML = `<label for="sign-up-cpf-cnpj">CNPJ</label>
            <input type="text" class="form-control" id="sign-up-cpf-cnpj" placeholder="Insira o CNPJ">`
        divNomeDaEmpresa.classList.remove('d-none');
    }
});

radioInstPj.addEventListener('change', () => {
    if (radioInstPj.checked) {
        divNomeFantasia.innerHTML = ` <label for="sign-up-nome">Nome Completo</label>
            <input type="text" class="form-control mb-2" id="sign-up-nome" placeholder="Insira o seu Nome Completo">`
        divCpfCnpj.innerHTML = `<label for="sign-up-cpf-cnpj">CPF</label>
            <input type="text" class="form-control" id="sign-up-cpf-cnpj" placeholder="Insira o CPF">`
        divNomeDaEmpresa.classList.add('d-none');
    }
});

makeTest()
