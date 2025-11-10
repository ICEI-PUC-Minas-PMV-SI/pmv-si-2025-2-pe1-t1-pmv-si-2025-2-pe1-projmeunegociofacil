document.addEventListener('DOMContentLoaded', function () {
  const agendaDiaria = document.getElementById('agendaDiaria');
  const scrollContainer = document.querySelector('.table-responsive-agenda-diaria');
  const targetRow = document.getElementById('initial-hour');

  agendaDiaria.addEventListener('shown.bs.collapse', function () {
    if (scrollContainer && targetRow) {
      scrollContainer.scrollTop = targetRow.offsetTop;
    }
  });
});

export function initDialog(name) {
  const dialogElement = document.querySelector('[data-dialog=${name}]');
  const closeButtonElements = document.querySelectorAll("data-dialog-close-button");

  for (const closeButtonElement of closeButtonElements) {
    closeButtonElement.addEventListener("click", () => {
      dialogElement.close();
    });
  }

  dialogElement.addEventListener("click", (event) => {
    if (event.target === dialogElement) {
      dialogElement.close();
    }
  })

  return {
    open() {
      dialogElement.showModal();
    },
    close() {
      dialogElement.close();
    }
  }
}

export function intiEventDialog() {
  const dialog = initDialog("event-form")

  document.addEventListener
  ("event-creat-request", () => {
    console.log("Dialog open requested");
  })
}

export function initEventFormDialog() {
  const dialog = initDialog("event-form")
  const eventForm = initEventForm();

  document.addEventListener("event-creat-request", () => {
    dialog.open();
  })
}

export function initEventForm() {
  const formElement = document.querySelector("[data-event-form]");

  formElement.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("Form submitted");
  });

  return {};
}

function salvarContaPagar() {
  const modal = document.getElementById('novocompromissoModal')
  modal.classList.replace('salvar')
}