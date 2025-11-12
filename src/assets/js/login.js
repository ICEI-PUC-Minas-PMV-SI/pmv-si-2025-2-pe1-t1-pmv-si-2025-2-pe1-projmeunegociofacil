
// login redirect to:
const LOGIN_URL = "index.html";

// cria o bd de usuarios
var db = {};

// Objeto para o usuário corrente
var usuarioCorrente = {};

async function makeTest() {
    if (window.confirm('Deseja realmente realizar um teste? \nTodos os dados locais salvos anteriormente serão substituídos, sem possibilidade de recuperação.')) {

        try {
            // busca o json e converte para js
            const response = await fetch('assets/data/maketest.json');
            const makeTestData = await response.json();
            localStorage.clear();
            Object.keys(makeTestData).forEach(key => {
                const data = makeTestData[key];
                localStorage.setItem(key, JSON.stringify(data));
            })

            // informa que deu certo
            alert('Arquivos de teste carregados com sucesso. \nEfetue login utilizando os dados:\nLogin: admin@admin.com\nSenha: admin');
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
    var usuariosJSON = localStorage.getItem('usuarios');

    db = JSON.parse(usuariosJSON);

};


// Verifica se o login do usuário está ok e, se positivo, direciona para a página inicial
function loginUser(email_login, senha) {

    // Verifica todos os itens do banco de dados de usuarios 
    // para localizar o usuário informado no formulario de login
    for (var i = 0; i < db.length; i++) {
        var usuario = db[i];

        // Se encontrou login, carrega usuário corrente e salva no Session Storage
        if (email_login == usuario.email_login && senha == usuario.senha) {
            usuarioCorrente.id = usuario.id;
            usuarioCorrente.email_login = usuario.email_login;
            usuarioCorrente.nome = usuario.nome;
            usuarioCorrente.tem_cnpj = usuario.tem_cnpj;
            usuarioCorrente.razao_social = usuario.razao_social;
            usuarioCorrente.cpf_cnpj = usuario.cpfCnpj;
            usuarioCorrente.telefone = usuario.telefone;
            usuarioCorrente.endereco = usuario.endereco;

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

    // --- Início: Lógica para gerar o novo ID ---

    // 1. Encontra o maior ID (maxId) que existe atualmente no array 'db'.
    //    Começamos com um valor inicial de 0.
    //    Para cada 'usuario' no 'db', comparamos seu 'id' com o 'max' atual.
    //    Se o 'id' do usuário for maior, ele se torna o novo 'max'.
    const maxId = db.reduce((max, usuario) => {
        // Converte o id para Número para garantir a comparação correta
        const currentId = Number(usuario.id); 
        return currentId > max ? currentId : max;
    }, 0); // O '0' é o valor inicial. Se 'db' estiver vazio, maxId será 0.

    // 2. O novo ID será o maior ID encontrado + 1.
    //    (Se o db estava vazio, maxId é 0, então o newId será 1).
    let newId = maxId + 1;

    // --- Fim: Lógica para gerar o novo ID ---


    // Cria um objeto de usuario para o novo usuario 
    let usuario = {
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
    console.log(localStorage.getItem('usuarios'))
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

// init 
initLoginApp();