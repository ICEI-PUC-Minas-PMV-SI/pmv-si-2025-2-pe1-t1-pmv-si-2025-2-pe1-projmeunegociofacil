
// login redirect to:
const LOGIN_URL = "index.html";

// cria o bd de usuarios
var db_usuarios = {};

// Objeto para o usuário corrente
var usuarioCorrente = {};

async function makeTest() {


    if (window.confirm('Deseja realmente realizar um teste? \nTodos os dados locais salvos anteriormente serão substituídos, sem possibilidade de recuperação.')) {

        try {
            // busca o json e converte para js
            const response = await fetch('data/maketest.json');
            const dadosCarregados = await response.json(); // Isto é o { usuarios: [...] } do arquivo

            // adiciona UUID
            const dadosComIDs = {
                usuarios: dadosCarregados.usuarios.map(usuario => {
                    return {
                        ...usuario, // Copia login, senha, nome, email
                        "id": generateUUID() // Adiciona o ID dinâmico
                    };
                })
            };

            // apaga o o local storage, copia os dados para o bd e salva no local storage
            localStorage.clear();
            db_usuarios = dadosComIDs;
            localStorage.setItem('db_usuarios', JSON.stringify(dadosComIDs));

            // informa que deu certo
            alert('Arquivos de teste carregados com sucesso. \nEfetue login utilizando os dados:\nLogin: admin@admin.com\nSenha: admin');


        } catch {
            alert('Ocorreu um erro ao carregar os dados de teste.');
        }
    }
}

// função para gerar códigos uuid
function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}



// init userLogged
// Inicializa o usuarioCorrente e banco de dados de usuários da aplicação de Login
function initLoginApp() {
    // PARTE 1 - INICIALIZA USUARIOCORRENTE A PARTIR DE DADOS NO LOCAL STORAGE, CASO EXISTA
    usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    }

    // PARTE 2 - INICIALIZA BANCO DE DADOS DE USUÁRIOS
    // Obtem a string JSON com os dados de usuários a partir do localStorage
    var usuariosJSON = localStorage.getItem('db_usuarios');

    db_usuarios = JSON.parse(usuariosJSON);

};


// Verifica se o login do usuário está ok e, se positivo, direciona para a página inicial
function loginUser(email_login, senha) {

    // Verifica todos os itens do banco de dados de usuarios 
    // para localizar o usuário informado no formulario de login
    for (var i = 0; i < db_usuarios.usuarios.length; i++) {
        var usuario = db_usuarios.usuarios[i];

        // Se encontrou login, carrega usuário corrente e salva no Session Storage
        if (email_login == usuario.email_login && senha == usuario.senha) {
            usuarioCorrente.id = usuario.id;
            usuarioCorrente.email_login = usuario.email_login;
            usuarioCorrente.nome = usuario.nome;

            // Salva os dados do usuário corrente no Session Storage, mas antes converte para string
            sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));

            // Retorna true para usuário encontrado
            return true;
        }
    }

    // Se chegou até aqui é por que não encontrou o usuário e retorna falso
    return false;
}

// Apaga os dados do usuário corrente no sessionStorage
function logoutUser() {
    usuarioCorrente = {};
    sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));
    window.location = LOGIN_URL;
}



function addUser(nome, nomeRazao, isPj, cpfCNPJ, endereco, telefone, email, senha) {

    // Cria um objeto de usuario para o novo usuario 
    let newId = generateUUID();
    let usuario = {
        "id": newId,
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
    db_usuarios.usuarios.push(usuario);

    // Salva o novo banco de dados com o novo usuário no localStorage
    localStorage.setItem('db_usuarios', JSON.stringify(db_usuarios));
}

function setUserPass() {

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
    } else {
        return false;
    }
}

// init 
initLoginApp();