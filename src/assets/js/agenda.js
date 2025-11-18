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

const gridCalendario = document.getElementById('calendario-grid');
        const cabecalhoMesAno = document.getElementById('mes-ano');
        const btnAnterior = document.getElementById('btn-ant');
        const btnProximo = document.getElementById('btn-prox');

        let mesEmExibicao = new Date();
        let compromissos = {};

        function renderizarCalendario() {
          gridCalendario.innerHTML = '';
          
          const ano = mesEmExibicao.getFullYear();
          const mes = mesEmExibicao.getMonth();

          cabecalhoMesAno.textContent = `${mesEmExibicao.toLocaleString('pt-br', { month: 'long' })} de ${ano}`;
          
          const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
          const numDiasNoMes = new Date(ano, mes + 1, 0).getDate();

          let diaAtual = 1;

          for (let i = 0; i < 35; i++) {
                const celula = document.createElement('div');
                celula.className = 'border rounded-lg p-2 h-36 flex flex-col';

                let numeroDia = null;
                let chaveCompromisso = '';

                if (i >= primeiroDiaSemana && diaAtual <= numDiasNoMes) {
                    numeroDia = diaAtual;
                    
                    const diaFormatado = String(numeroDia).padStart(2, '0');
                    const mesFormatado = String(mes + 1).padStart(2, '0');
                    chaveCompromisso = `${ano}-${mesFormatado}-${diaFormatado}`;

                    celula.classList.add('bg-white');
                    
                    const spanDia = document.createElement('span');
                    spanDia.className = 'font-semibold text-gray-900';
                    spanDia.textContent = numeroDia;
                    
                    const caixinhaCompromisso = document.createElement('textarea');
                    caixinhaCompromisso.className = 'w-full flex-grow mt-1 p-1 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-400';
                    caixinhaCompromisso.placeholder = 'Compromisso...';
                    caixinhaCompromisso.dataset.chave = chaveCompromisso;
                    
                    if (compromissos[chaveCompromisso]) {
                        caixinhaCompromisso.value = compromissos[chaveCompromisso];
                    }

                    caixinhaCompromisso.addEventListener('input', (e) => {
                        compromissos[e.target.dataset.chave] = e.target.value;
                    });

                    celula.appendChild(spanDia);
                    celula.appendChild(caixinhaCompromisso);
                    
                    diaAtual++;
                } else {
                    celula.classList.add('bg-gray-50', 'opacity-50');
                }

                gridCalendario.appendChild(celula);
            }
        }

        btnAnterior.addEventListener('click', () => {
            mesEmExibicao.setMonth(mesEmExibicao.getMonth() - 1);
            renderizarCalendario();
        });

        btnProximo.addEventListener('click', () => {
            mesEmExibicao.setMonth(mesEmExibicao.getMonth() + 1);
            renderizarCalendario();
        });

        renderizarCalendario();