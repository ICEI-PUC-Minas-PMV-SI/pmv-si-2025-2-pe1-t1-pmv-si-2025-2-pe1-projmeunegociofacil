
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

    const targetUrl = new URL('../index.html', window.location.href).href;

    window.location.href = targetUrl;
}