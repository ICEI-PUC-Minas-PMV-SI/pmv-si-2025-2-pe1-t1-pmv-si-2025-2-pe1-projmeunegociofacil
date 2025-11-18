import { LOGIN_URL } from "./config.js"

window.addEventListener('load', initPage);

function initPage() {
    document.getElementById('btn_logout').addEventListener('click', logoutUser);
    document.getElementById('nomeUsuario').innerHTML = loggedUser().nome;
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


