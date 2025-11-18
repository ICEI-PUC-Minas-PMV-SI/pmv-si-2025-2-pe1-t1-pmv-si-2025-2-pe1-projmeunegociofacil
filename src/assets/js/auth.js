import { LOGIN_URL } from "./config.js"

window.addEventListener('load', initPage);

function initPage() {
    const btnLogout = document.getElementById('btn_logout')
    const spanHello = document.getElementById('nomeUsuario')

    if (btnLogout) { btnLogout.addEventListener('click', logoutUser); }
    if (spanHello) { spanHello.innerHTML = loggedUser().nome; }
    
    if (!loggedUser().email_login) {
        logoutUser()
    }
}


export function loggedUser() {
    const loggedUserJSON = sessionStorage.getItem('loggedUser');
    if (loggedUserJSON) {
        return JSON.parse(loggedUserJSON);
    }
};

function logoutUser(event) {
    if (event) event.preventDefault();
    sessionStorage.setItem('loggedUser', JSON.stringify({}));
    window.location.href = LOGIN_URL;
}


