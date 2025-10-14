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
