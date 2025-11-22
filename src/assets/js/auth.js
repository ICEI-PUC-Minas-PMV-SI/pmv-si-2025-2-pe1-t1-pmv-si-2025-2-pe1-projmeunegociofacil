
window.addEventListener('load', initPage);

export function initPage() {
    if (!loggedUser()) {
        logoutUser()
    }
    const btnLogout = document.getElementById('btn_logout')
    const spanHello = document.getElementById('nomeUsuario')

    if (btnLogout) { btnLogout.addEventListener('click', logoutUser); }
    if (spanHello) { spanHello.innerHTML = loggedUser().nome; }
}



export function loggedUser() {
    try {
        return JSON.parse(sessionStorage.getItem('loggedUser'))
    }
    catch {
        return null
    }
};

export function logoutUser(event) {
    if (event) event.preventDefault();
    sessionStorage.removeItem('loggedUser');

    // O TRUQUE:
    // 1. window.location.href pega a URL completa atual (ex: .../meu-repo/auth/index.html)
    // 2. '../index.html' diz para subir um nível a partir dessa URL completa.
    // O objeto URL faz a matemática correta mantendo o nome do repositório.
    const targetUrl = new URL('../index.html', window.location.href).href;

    window.location.href = targetUrl;
}