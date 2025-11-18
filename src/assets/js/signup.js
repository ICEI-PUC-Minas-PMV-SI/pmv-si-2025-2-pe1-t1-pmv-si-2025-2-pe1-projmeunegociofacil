import { newUserId, allUsers } from "./utils.js"
const db = allUsers();



function addUser(nome, nomeRazao, isPj, cpfCNPJ, endereco, telefone, email, senha) {

    const newId = newUserId(allUsers())
    // Cria um objeto de usuario para o novo usuario 
    const usuario = {
        "id": newId, // <-- Aplicamos o novo ID aqui
        "tem_cnpj": isPj,
        "razao_social": nomeRazao,
        "nome": nome,
        "cpf_cnpj": cpfCNPJ,
        "telefone": telefone,
        "endereco": endereco,
        "email_login": email,
        "senha": senha,


    };

    // Inclui o novo usuario no banco de dados baseado em JSON
    db.push(usuario);

    // Salva o novo banco de dados com o novo usuário no localStorage
    localStorage.setItem('usuarios', JSON.stringify(db));
}

function checkFields(nome, nomeRazao, isPj, cpfCNPJ, endereco, telefone, email, senha) {

    if (nome.length < 5) {
        alert('Preencha corretamente o Nome');
        return true;
    }
    else if (endereco.length < 5) {
        alert('Preencha corretamente o Endereço');
        return true;
    }
    else if (telefone.length < 5) {
        alert('Preencha corretamente o Telefone');
        return true;
    }
    else if (email.length < 10) {
        alert('Preencha corretamente o E-mail');
        return true;
    }
    else if (cpfCNPJ.length < 11) {
        alert('Preencha corretamente o E-mail');
        return true;
    }
    else if (senha.length < 8) {
        alert('A senha precisa ter mais de 8 caracteres');
        return true;
    }
    else if (isPj == true && nomeRazao.length < 5) {
        alert('Cadastro Pessoa Jurídica\nInforme a Razão Social');
        return true;
    } // --- NOVAS VALIDAÇÕES (Duplicidade) ---

    // Verifica se o e-mail já existe no banco de dados 'db'
    // O 'db' foi carregado no initLoginApp()
    else if (db.some(usuario => usuario.email_login === email)) {
        alert('Erro: Este e-mail já está cadastrado.');
        return true;
    }

    // Verifica se o CPF/CNPJ já existe no banco de dados 'db'
    else if (db.some(usuario => usuario.cpf_cnpj === cpfCNPJ)) {
        alert('Erro: Este CPF/CNPJ já está cadastrado.');
        return true;
    }

    // Se passou por todas as verificações, retorna false (sem erros)
    else {
        return false;
    }
}

export function newUser(event) {
    event.preventDefault();

    const nome = document.getElementById('sign-up-nome').value || "";
    const nomeRazao = document.getElementById('sign-up-razao-social').value || "";
    const isPj = document.getElementById('sign-up-is-pj').checked;
    const cpfCNPJ = document.getElementById('sign-up-cpf-cnpj').value || "";
    const endereco = document.getElementById('sign-up-endereco').value || "";
    const telefone = document.getElementById('sign-up-telefone').value || "";
    const email = document.getElementById('sign-up-email').value || "";
    const senha = document.getElementById('sign-up-password').value || "";
    const senha2 = document.getElementById('sign-up-password2').value;
    if (senha != senha2) {
        alert('As senhas informadas não conferem.');
        return
    }
    if (checkFields(nome, nomeRazao, isPj, cpfCNPJ, endereco, telefone, email, senha)) {
        return
    }
    addUser(nome, nomeRazao, isPj, cpfCNPJ, endereco, telefone, email, senha);
    alert('Usuário salvo com sucesso. Proceda com o login para acessar o sistema.');
    bootstrap.Modal.getInstance(document.getElementById('SignUpModal')).hide()
}