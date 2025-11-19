document.addEventListener('DOMContentLoaded', () => {
  carregaConteudoPelaUrl();
});

window.addEventListener('popstate', () => {
  carregaConteudoPelaUrl();
});

function carregaConteudoPelaUrl() {
  const params = new URLSearchParams(window.location.search);
  const paginaSolicitada = params.get('page');

  let urlParaCarregar = '../assets/partials/dashboard.html'; 
  
  if (paginaSolicitada) {
      urlParaCarregar = `../assets/partials/${paginaSolicitada}.html`;
  }

  const objConfig = { method: 'GET', url: urlParaCarregar };

  request(objConfig)
    .then(response => loadResult(response, urlParaCarregar))
    .catch(e => console.error("Erro na navegação:", e));
}

const request = obj => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(obj.method, obj.url, true);
    xhr.send();

    xhr.addEventListener('load', () => {
      if(xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(xhr.statusText);
      }
    });
  });
};

document.addEventListener('click', e => {
  const el = e.target.closest('a');
  if (!el || !el.getAttribute('href')) return;
  
  const href = el.getAttribute('href');
  const isInsideSidebar = el.closest('#offcanvasSidebar');
  const isHash = href.includes('#'); 

  if (isInsideSidebar && !isHash) {
    e.preventDefault();
    loadPage(el);

    // Fecha o menu mobile se estiver aberto
    const offcanvasEl = document.getElementById('offcanvasSidebar');
    if (offcanvasEl) {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
        if (bsOffcanvas) bsOffcanvas.hide(); 
    }
  }
});

async function loadPage(el) {
  const href = el.getAttribute('href');
  
  const objConfig = {
    method: 'GET',
    url: href 
  };

  try {
    const response = await request(objConfig);
    
    let nomePagina = href.split('/').pop().replace('.html', '');

    window.history.pushState({}, "", `?page=${nomePagina}`);

    loadResult(response, href); 
  } catch(e) {
    console.log("Erro ao carregar: " + href);
    console.log(e);
  }
}

function loadResult(response, url) {
  const parser = new DOMParser();
  const novoHTML = parser.parseFromString(response, 'text/html');

  const tituloNovo = novoHTML.querySelector('title')?.innerText || '';
  document.title = `Meu Negócio Fácil - ${tituloNovo}`;

  const containerAtual = document.querySelector('.page-content');
  const novoConteudo = novoHTML.querySelector('.page-content');

  if (novoConteudo) {
      containerAtual.innerHTML = novoConteudo.innerHTML;
  } else {
      containerAtual.innerHTML = response;
  }

  const scripts = novoHTML.querySelectorAll('script');
  scripts.forEach(scriptAntigo => {
      const scriptNovo = document.createElement('script');
      Array.from(scriptAntigo.attributes).forEach(attr => scriptNovo.setAttribute(attr.name, attr.value));
      scriptNovo.appendChild(document.createTextNode(scriptAntigo.innerHTML));
      document.body.appendChild(scriptNovo);
  });

  atualizaSidebar(url);
}

function atualizaSidebar(url) {
  const links = document.querySelectorAll('#offcanvasSidebar .nav-link');
  links.forEach(l => l.classList.remove('active'));

  const linkAtivo = document.querySelector(`#offcanvasSidebar .nav-link[href="${url}"]`);

  if (linkAtivo) {
    linkAtivo.classList.add('active');

    const menuCollapsePai = linkAtivo.closest('.collapse');

    if (menuCollapsePai) {
      menuCollapsePai.classList.add('show');

      const botaoToggle = document.querySelector(`[href="#${menuCollapsePai.id}"], [data-bs-target="#${menuCollapsePai.id}"]`);
      
      if (botaoToggle) {
        botaoToggle.classList.remove('collapsed');
        botaoToggle.setAttribute('aria-expanded', 'true');
      }
    }
  }
}
window.reloadContent = carregaConteudoPelaUrl;