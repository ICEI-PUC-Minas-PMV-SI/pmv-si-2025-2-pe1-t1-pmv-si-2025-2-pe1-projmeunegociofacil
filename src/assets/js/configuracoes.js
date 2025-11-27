import { loggedUser } from "./auth.js";
import { allUsers } from "./utils.js";
import { logoutUser } from "./auth.js"

const spanNomeFantasia = document.getElementById('span-nome-fantasia')
const spanCpfCnpj = document.getElementById('span-cpf-cnpj')
const divNomeDaEmpresa = document.getElementById('div-nome-da-empresa')
const nome = document.getElementById('sign-up-nome')
const nomeRazao = document.getElementById('sign-up-razao-social')
const cpfCNPJ = document.getElementById('sign-up-cpf-cnpj')
const endereco = document.getElementById('sign-up-endereco')
const telefone = document.getElementById('sign-up-telefone')
const email = document.getElementById('sign-up-email')

document.getElementById('btn-salvar').addEventListener('click', updateUser);
document.getElementById('btn-reset').addEventListener('click', resetSystem);


const db = allUsers();
const currentUser = loggedUser();

function renderData() {
    if (loggedUser().tem_cnpj) {
        spanNomeFantasia.innerHTML = "Nome Fantasia"
        spanCpfCnpj.innerHTML = "CNPJ"
        divNomeDaEmpresa.classList.remove('d-none');
    }
    nome.value = loggedUser().nome
    nomeRazao.value = loggedUser().razao_social
    cpfCNPJ.value = loggedUser().cpf_cnpj
    endereco.value = loggedUser().endereco
    telefone.value = loggedUser().telefone
    email.value = loggedUser().email_login
}

function performUpdateUser(nome, nomeRazao, isPj, cpfCNPJ, endereco, telefone, email, senha) {

    const userIndex = db.findIndex(usuario => usuario.id === currentUser.id);

    if (userIndex !== -1) {

        db[userIndex].nome = nome;
        db[userIndex].razao_social = nomeRazao;
        db[userIndex].tem_cnpj = isPj;
        db[userIndex].endereco = endereco;
        db[userIndex].telefone = telefone;
        db[userIndex].email_login = email;

        if (senha && senha.length >= 8) {
            db[userIndex].senha = senha;
        }

        localStorage.setItem('usuarios', JSON.stringify(db));

    } else {
        alert("Erro: Usuário não encontrado na base de dados.");
    }
}
function checkFields(nome, nomeRazao, isPj, endereco, telefone, email, senha) {

    if (endereco.length < 5) {
        alert('Preencha corretamente o Endereço');
        return true;
    }
    else if (telefone.length < 5) {
        alert('Preencha corretamente o Telefone');
        return true;
    }
    else if (email.length < 5) {
        alert('Preencha corretamente o E-mail');
        return true;
    }

    else if (senha.length > 0 && senha.length < 8) {
        alert('A senha precisa ter mais de 8 caracteres');
        return true;
    }
    else if (isPj == true && nomeRazao.length < 5) {
        alert('Cadastro Pessoa Jurídica\nInforme a Razão Social');
        return true;
    }

    else if (db.some(usuario => usuario.email_login === email && usuario.id !== currentUser.id)) {
        alert('Erro: Este e-mail já está em uso por outro usuário.');
        return true;
    }

    else {
        return false;
    }
}

export function updateUser(event) {
    event.preventDefault();

    const nome = document.getElementById('sign-up-nome').value || "";
    const nomeRazao = document.getElementById('sign-up-razao-social').value || "";
    const isPj = currentUser.tem_cnpj;
    const cpfCNPJ = document.getElementById('sign-up-cpf-cnpj').value || ""; // Readonly, mas enviamos para manter consistência
    const endereco = document.getElementById('sign-up-endereco').value || "";
    const telefone = document.getElementById('sign-up-telefone').value || "";
    const email = document.getElementById('sign-up-email').value || "";
    const senha = document.getElementById('sign-up-password').value || "";
    const senha2 = document.getElementById('sign-up-password2').value || "";

    if (senha.length > 0 && senha !== senha2) {
        alert('As senhas informadas não conferem.');
        return;
    }
    if (checkFields(nome, nomeRazao, isPj, endereco, telefone, email, senha)) {
        return;
    }
    performUpdateUser(nome, nomeRazao, isPj, cpfCNPJ, endereco, telefone, email, senha);

    alert('Dados atualizados com sucesso!');

    logoutUser()
}

function resetSystem() {
    if (confirm(`Confirma o RESET TOTAL do sistema?\nTodos os dados serão apagados.`)) { 
        localStorage.clear()
        logoutUser()
     }
}

renderData()