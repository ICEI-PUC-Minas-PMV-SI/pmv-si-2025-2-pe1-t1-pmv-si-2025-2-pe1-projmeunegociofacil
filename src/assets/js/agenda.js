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