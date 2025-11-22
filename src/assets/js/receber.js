import { loggedUser, logoutUser } from "./auth.js";
import { LOGIN_URL } from "./config.js";
import { makeDecimal, newMyId } from "./utils.js";

// ==========================================
// 1. AUTENTICAÇÃO E DADOS GLOBAIS
// ==========================================
const usuarioCorrente = loggedUser();

if (!usuarioCorrente || !usuarioCorrente.email_login) {
  window.location.href = LOGIN_URL;
}

const ID_LOGIN_GLOBAL = usuarioCorrente.id;

// ==========================================
// 2. FUNÇÕES DE BUSCA DE DADOS
// ==========================================

function allContasReceber() {
    try {
        return JSON.parse(localStorage.getItem('contasReceber')) || [];
    } catch {
        return [];
    }
}

function allUserContacts() {
    try {
        const db = JSON.parse(localStorage.getItem('clientesFornecedores')) || [];
        return db.filter(item => String(item.usuarioId) === String(ID_LOGIN_GLOBAL))
                 .sort((a, b) => (a.nomeRazaoSocial || '').localeCompare(b.nomeRazaoSocial || ''));
    } catch (e) {
        console.error("Erro ao carregar contatos:", e);
        return [];
    }
}

function saveContasReceber(data) {
    localStorage.setItem('contasReceber', JSON.stringify(data));
}

// ==========================================
// 3. INICIALIZAÇÃO
// ==========================================

function initPage() {
  document.getElementById('btn_logout').addEventListener('click', logoutUser);
  document.getElementById('nomeUsuario').innerHTML = usuarioCorrente.nome; 
  
  const inputBusca = document.getElementById('busca-receber');
  if(inputBusca) {
      inputBusca.addEventListener('input', () => renderizarTabela());
  }

  renderizarTabela(); 
}

// ==========================================
// 4. RENDERIZAÇÃO E UTILITÁRIOS
// ==========================================

function formatarDataParaExibicao(dataString) {
    if (!dataString) return '';
    if (dataString.includes('T')) {
        const dateObj = new Date(dataString);
        return dateObj.toLocaleDateString('pt-BR');
    }
    const [ano, mes, dia] = dataString.split('-');
    return `${dia}/${mes}/${ano}`;
}

function getNomeCliente(id) {
    if (!id) return 'Consumidor Final';
    const contatos = allUserContacts();
    const cliente = contatos.find(c => c.meuId == id);
    return cliente ? cliente.nomeRazaoSocial : 'Desconhecido';
}

function listOfContacts() {
    const select = document.getElementById('modalClienteConta');
    if(!select) return;

    const contatos = allUserContacts();
    
    let optionsHtml = `<option value="">Selecione um cliente...</option>`;
    
    if (contatos.length > 0) {
        optionsHtml += contatos.map(contato => {
            const tipoFmt = contato.tipo ? ` (${contato.tipo.charAt(0).toUpperCase() + contato.tipo.slice(1)})` : '';
            return `<option value="${contato.meuId}">${contato.nomeRazaoSocial}${tipoFmt}</option>`;
        }).join('');
    } else {
        optionsHtml += `<option value="" disabled>Nenhum cliente cadastrado</option>`;
    }
    
    select.innerHTML = optionsHtml;
}

// --- CORREÇÃO: LÓGICA DE RECIBO NO MODAL ---
function gerarRecibo(id) {
    const contas = allContasReceber();
    // Busca a conta pelo ID
    const conta = contas.find(c => c.meuId == id && String(c.usuarioId) === String(ID_LOGIN_GLOBAL));
    
    if(!conta) {
        alert("Erro: Conta não encontrada.");
        return;
    }

    // Coleta dados para o recibo
    const nomeEmitente = usuarioCorrente.razao_social || usuarioCorrente.nome;
    const cpfCnpjEmitente = usuarioCorrente.cpf_cnpj;
    
    const nomePagador = getNomeCliente(conta.clientes_fornecedoresId) || conta.cliente || "Consumidor Final";
    
    let valorRaw = conta.valorComDesconto !== undefined ? conta.valorComDesconto : conta.valor;
    const valorFormatado = makeDecimal(Number(valorRaw));
    
    const dataPagamento = conta.data_pagamento 
        ? new Date(conta.data_pagamento).toLocaleDateString('pt-BR') 
        : new Date().toLocaleDateString('pt-BR'); // Se não pago, usa hoje como data do recibo

    // Monta o HTML do Recibo
    const htmlRecibo = `
        <div style="border: 2px dashed #333; padding: 30px; background-color: #fff; font-family: 'Courier New', Courier, monospace;">
            <div class="text-center mb-4">
                <h2 style="margin:0;">RECIBO</h2>
                <small>Nº ${String(conta.meuId).padStart(6, '0')}</small>
            </div>
            
            <div class="d-flex justify-content-between align-items-center mb-4">
                <span style="font-size: 1.2em;">Valor: <strong>R$ ${valorFormatado}</strong></span>
                <span>Data: ${dataPagamento}</span>
            </div>

            <p style="line-height: 1.8; font-size: 1.1em; text-align: justify;">
                Recebi(emos) de <strong>${nomePagador}</strong> a importância de 
                <strong>R$ ${valorFormatado}</strong>, referente a: <br>
                <em>${conta.descricao}</em>.
            </p>
            
            <p class="mt-2">
                Parcela: ${conta.parcela || '1/1'} | Vencimento Original: ${formatarDataParaExibicao(conta.data_vencimento)}
            </p>

            <br><br><br>
            <div class="text-center">
                __________________________________________________<br>
                <strong>${nomeEmitente}</strong><br>
                CPF/CNPJ: ${cpfCnpjEmitente}<br>
            </div>
        </div>
    `;

    // Injeta no modal
    const divConteudo = document.getElementById('recibo-conteudo');
    if(divConteudo) divConteudo.innerHTML = htmlRecibo;

    // Abre o modal
    const modalEl = document.getElementById('reciboModal');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

function imprimirRecibo() {
    const conteudo = document.getElementById('recibo-conteudo').innerHTML;
    const janela = window.open('', '', 'height=600,width=800');
    janela.document.write('<html><head><title>Imprimir Recibo</title>');
    janela.document.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">');
    janela.document.write('</head><body >');
    janela.document.write(conteudo);
    janela.document.write('</body></html>');
    janela.document.close();
    janela.focus();
    setTimeout(() => {
        janela.print();
        janela.close();
    }, 500);
}

function renderizarTabela() {
    const tabela = document.querySelector('#tabelaContasReceber tbody');
    if (!tabela) return; 

    tabela.innerHTML = '';

    const contas = allContasReceber();
    let listaFiltrada = contas.filter(c => String(c.usuarioId) === String(ID_LOGIN_GLOBAL));

    const termo = document.getElementById('busca-receber')?.value.toLowerCase();
    if (termo) {
        listaFiltrada = listaFiltrada.filter(c => {
            const desc = (c.descricao || '').toLowerCase();
            const status = (c.status || '').toLowerCase();
            return desc.includes(termo) || status.includes(termo);
        });
    }

    listaFiltrada.sort((a, b) => {
        if (a.status === 'pendente' && b.status !== 'pendente') return -1;
        if (a.status !== 'pendente' && b.status === 'pendente') return 1;
        return new Date(a.data_vencimento) - new Date(b.data_vencimento);
    });

    if (listaFiltrada.length === 0) {
        tabela.innerHTML = `<tr><td colspan="7" class="text-center p-3">Nenhuma conta a receber encontrada.</td></tr>`;
        return;
    }

    listaFiltrada.forEach(conta => {
        const venc = formatarDataParaExibicao(conta.data_vencimento);
        const nomeCliente = getNomeCliente(conta.clientes_fornecedoresId);
        
        let valorRaw = conta.valorComDesconto !== undefined ? conta.valorComDesconto : conta.valor;
        const valorFmt = makeDecimal(Number(valorRaw));

        const contaId = conta.meuId;

        let statusBadge = '';
        // Normaliza status para minúsculo para comparação segura
        const statusNormalized = (conta.status || '').toLowerCase();

        if(statusNormalized === 'pago') {
            statusBadge = '<span class="badge bg-success text-white">Recebido</span>';
        } else if (statusNormalized === 'cancelado') {
            statusBadge = '<span class="badge bg-secondary text-white">Cancelado</span>';
        } else {
            statusBadge = '<span class="badge bg-warning text-dark">Pendente</span>';
        }

        // CORREÇÃO: Botão de Recibo só aparece se estiver PAGO
        const btnRecibo = (statusNormalized === 'pago') 
            ? `<button class="btn btn-outline-dark btn-sm me-1" title="Gerar Recibo" onclick="gerarRecibo(${contaId})"><i class="bi bi-receipt"></i></button>`
            : '';

        const btnEdit = `<button class="btn btn-outline-primary btn-sm me-1" onclick="abrirModalContaReceber(${contaId})"><i class="bi bi-pencil"></i></button>`;
        const btnDel = `<button class="btn btn-outline-danger btn-sm" onclick="excluirItem(${contaId})"><i class="bi bi-trash"></i></button>`;

        tabela.insertAdjacentHTML(
            'beforeend',
            `
            <tr id="conta-receber-${contaId}">
                <td>${statusBadge}</td>
                <td>${nomeCliente}</td>
                <td>${conta.descricao}</td>
                <td>${venc}</td>
                <td class="text-end">R$ ${valorFmt}</td>
                <td class="text-center">${btnRecibo + btnEdit + btnDel}</td>
            </tr>
        `
        );
    });
}

// ==========================================
// 5. CRUD (MODAL)
// ==========================================

function abrirModalContaReceber(id) {
    const modalTitle = document.getElementById('contaReceberModalLabel');
    const form = document.getElementById('formContaReceber');

    form.reset();
    document.getElementById('contaReceberId').value = '';
    
    listOfContacts();

    if (id) {
        modalTitle.textContent = 'Editar Conta a Receber';
        
        const contas = allContasReceber();
        const conta = contas.find(c => c.meuId == id && String(c.usuarioId) === String(ID_LOGIN_GLOBAL));
        
        if (!conta) return;

        document.getElementById('contaReceberId').value = id;
        document.getElementById('modalStatusReceber').value = conta.status; 
        document.getElementById('modalClienteConta').value = conta.clientes_fornecedoresId || '';
        
        let valorRaw = conta.valorComDesconto !== undefined ? conta.valorComDesconto : conta.valor;
        document.getElementById('modalValorReceber').value = Number(valorRaw).toFixed(2);
        
        document.getElementById('modalDescricaoReceber').value = conta.descricao;
        
        let dataVenc = conta.data_vencimento;
        if(dataVenc && dataVenc.includes('T')) dataVenc = dataVenc.split('T')[0];
        document.getElementById('modalVencimentoReceber').value = dataVenc;

    } else {
        modalTitle.textContent = 'Adicionar Nova Conta a Receber';
    }
    
    const el = document.getElementById('contaReceberModal');
    if(el) {
        const modal = bootstrap.Modal.getOrCreateInstance(el);
        modal.show();
    }
}

function salvarContaReceber() {
    const id = document.getElementById('contaReceberId').value;
    
    const status = document.getElementById('modalStatusReceber').value;
    const clienteId = document.getElementById('modalClienteConta').value;
    const valorInput = document.getElementById('modalValorReceber').value;
    const valor = parseFloat(valorInput); 
    const descricao = document.getElementById('modalDescricaoReceber').value;
    const vencimento = document.getElementById('modalVencimentoReceber').value;

    if (!status || !valorInput || !descricao || !vencimento) {
        alert('Preencha todos os campos obrigatórios.');
        return;
    }

    const dadosConta = {
        status: status,
        tipo: 'receber', // Fixo
        clientes_fornecedoresId: clienteId ? Number(clienteId) : null,
        valorComDesconto: valor, // Padronizado
        valor: valor, // Fallback
        descricao: descricao,
        data_vencimento: vencimento,
        data_pagamento: status === 'pago' ? new Date().toISOString() : null,
        usuarioId: ID_LOGIN_GLOBAL,
        parcela: '1/1'
    };

    let contas = allContasReceber();

    if (id) {
        const index = contas.findIndex(c => c.meuId == id && String(c.usuarioId) === String(ID_LOGIN_GLOBAL));
        if (index === -1) {
            alert('Conta não encontrada.');
            return;
        }
        contas[index] = { ...contas[index], ...dadosConta };

    } else {
        const novoId = newMyId(contas);
        contas.push({
            meuId: novoId,
            vendaId: null, 
            ...dadosConta
        });
    }

    saveContasReceber(contas); 
    renderizarTabela();
    
    const el = document.getElementById('contaReceberModal');
    if(el) {
        const modal = bootstrap.Modal.getInstance(el);
        if(modal) modal.hide();
    }
}

function excluirItem(id) { 
    if (!confirm('Deseja realmente excluir esta conta?')) return;
    
    let contas = allContasReceber();
    contas = contas.filter(c => !(c.meuId == id && String(c.usuarioId) === String(ID_LOGIN_GLOBAL)));
    
    saveContasReceber(contas);
    renderizarTabela();
}

// Expor funções globalmente
window.gerarRecibo = gerarRecibo;
window.imprimirRecibo = imprimirRecibo;
window.abrirModalContaReceber = abrirModalContaReceber;
window.salvarContaReceber = salvarContaReceber;
window.excluirItem = excluirItem; 

initPage();