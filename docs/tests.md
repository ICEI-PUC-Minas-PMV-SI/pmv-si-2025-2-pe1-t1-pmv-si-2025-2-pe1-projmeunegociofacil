# Testes

Neste projeto serão realizados dois tipos de testes:

 - O **Teste de Software**, que utiliza uma abordadem de caixa preta, e tem por objetivo verificar a conformidade do software com os requisitos funcionais e não funcionais do sistema.
 - O **Teste de Usabilidade**, que busca avaliar a qualidade do uso do sistema por um usuário do público alvo. 

Se quiser conhecer um pouco mais sobre os tipos de teste de software, leia o documento [Teste de Software: Conceitos e tipos de testes](https://blog.onedaytesting.com.br/teste-de-software/).

A documentação dos testes é dividida nas seguintes seções:

 - [Plano de Testes de Software](#plano-de-testes-de-software)
 - [Registro dos Testes de Software](#registro-dos-testes-de-software)
 - [Avaliação dos Testes de Software](#avaliação-dos-testes-de-software)
 - [Cenários de Teste de Usabilidade](#cenários-de-teste-de-usabilidade)
 - [Registro dos Testes de Usabilidade](#registro-dos-testes-de-usabilidade)
 - [Avaliação dos Testes de Usabilidade](#avaliação-dos-testes-de-usabilidade)

# Teste de Software

Este documento detalha o plano de testes para o sistema "Meu Negócio Fácil", com base nos requisitos funcionais (RF) e não funcionais (RNF) definidos. O objetivo é validar o funcionamento de cada módulo e garantir a conformidade com as especificações.

## Plano de Testes de Software

Abaixo estão detalhados os casos de teste (CT) a serem executados.

---

**Caso de Teste** | **CT01 - Cadastro de Novo Usuário (Sucesso)**
:--- | :---
**Procedimento** | 1) Acessar a **Home**. <br> 2) Clicar no botão "Efetuar Cadastro". <br> 3) Preencher todos os campos do formulário no modal com dados válidos. <br> 4) Certificar que os campos "Senha" e "Repita a Senha" são idênticos. <br> 5) Clicar no botão "Efetuar Cadastro" do modal.
**Requisitos associados** | RF-01
**Resultado esperado** | O modal de cadastro é fechado e um alerta de sucesso (ex: "Usuário salvo com sucesso") é exibido.
**Dados de entrada** | Dados de usuário válidos, senhas coincidentes.
**Resultado obtido** | Sucesso

---

**Caso de Teste** | **CT02 - Cadastro de Novo Usuário (Falha - Senha Divergente)**
:--- | :---
**Procedimento** | 1) Acessar **Home**. <br> 2) Clicar em "Efetuar Cadastro". <br> 3) Preencher todos os campos, mas inserir valores diferentes em "Senha" e "Repita a Senha". <br> 4) Clicar no botão "Efetuar Cadastro" do modal.
**Requisitos associados** | RF-01
**Resultado esperado** | Um alerta (ex: "As senhas informadas não conferem") é exibido e o cadastro não é concluído.
**Dados de entrada** | Dados de usuário válidos, senhas divergentes.
**Resultado obtido** | Sucesso

---

**Caso de Teste** | **CT03 - Login de Usuário (Sucesso)**
:--- | :---
**Procedimento** | 1) Acessar **Home**. <br> 2) Clicar no botão "Login". <br> 3) Preencher o e-mail e a senha com dados de um usuário válido (ex: 'teste@teste.com', '1234'). <br> 4) Clicar no botão "Efetuar Login".
**Requisitos associados** | RF-01, RNF-01
**Resultado esperado** | O usuário é autenticado e redirecionado para a página **Dashboard**.
**Dados de entrada** | E-mail: 'admin@admin.com', Senha: 'admin'
**Resultado obtido** | Sucesso

---

**Caso de Teste** | **CT04 - Login de Usuário (Falha - Senha Inválida)**
:--- | :---
**Procedimento** | 1) Acessar **Home**. <br> 2) Clicar no botão "Login". <br> 3) Preencher com um e-mail válido e uma senha inválida. <br> 4) Clicar no botão "Efetuar Login".
**Requisitos associados** | RF-01, RNF-01
**Resultado esperado** | Um alerta (ex: "Usuário ou senha incorretos") é exibido e o usuário permanece na **Home**.
**Dados de entrada** | E-mail: 'teste@teste.com', Senha: 'invalid'
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT05 - Visualização do Dashboard e Verificação de Acesso**
:--- | :---
**Procedimento** | 1) Efetuar login com sucesso (CT03). <br> 2) Ao ser redirecionado para `dashboard.html`, verificar os elementos da página. <br> 3) Tentar acessar `dashboard.html` diretamente em uma nova sessão (sem login) e verificar se é redirecionado para o login.
**Requisitos associados** | RF-02, RNF-01
**Resultado esperado** | O dashboard é exibido corretamente após o login, mostrando o nome do usuário, gráficos e tabelas. O acesso direto sem login falha (redireciona para `index.html`).
**Dados de entrada** | N/A (Navegação)
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT06 - Adicionar Novo Cliente**
:--- | :---
**Procedimento** | 1) Navegar para `clientes_fornecedores.html`. <br> 2) Clicar no botão "Novo Cliente/Fornecedor". <br> 3) No modal, preencher Código, selecionar "Cliente" no Tipo, Nome e CPF/CNPJ. <br> 4) Clicar em "Salvar".
**Requisitos associados** | RF-03
**Resultado esperado** | O modal é fechado e o novo cliente é adicionado e exibido na tabela da página principal.
**Dados de entrada** | Código: 10, Tipo: Cliente, Nome: "Teste Cliente", Documento: "111.111.111-11"
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT07 - Buscar Cliente/Fornecedor**
:--- | :---
**Procedimento** | 1) Navegar para `clientes_fornecedores.html`. <br> 2) Digitar um termo de busca (ex: "Maria") no campo "Buscar".
**Requisitos associados** | RF-03
**Resultado esperado** | A tabela é filtrada dinamicamente para exibir apenas os registros que contêm o termo "Maria" (com base nos dados mocados ou adicionados).
**Dados de entrada** | Termo de busca: "Maria"
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT08 - Excluir Cliente/Fornecedor**
:--- | :---
**Procedimento** | 1) Navegar para `clientes_fornecedores.html`. <br> 2) Localizar um registro na tabela. <br> 3) Clicar no ícone de lixeira (excluir) referente a esse registro. <br> 4) Confirmar a exclusão na caixa de diálogo do navegador (confirm).
**Requisitos associados** | RF-03
**Resultado esperado** | O registro é removido da tabela.
**Dados de entrada** | N/A (Confirmação de exclusão)
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT09 - Adicionar Novo Produto**
:--- | :---
**Procedimento** | 1) Navegar para `produtos_servicos.html`. <br> 2) Clicar no botão "Novo Produto/Serviço". <br> 3) No modal, preencher Código, selecionar "Produto" no Tipo, Descrição e Unidade. <br> 4) Clicar em "Salvar".
**Requisitos associados** | RF-04
**Resultado esperado** | O modal é fechado e o novo produto é adicionado e exibido na tabela da página principal.
**Dados de entrada** | Código: 100, Tipo: Produto, Descrição: "Produto Teste", Unidade: "PC"
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT10 - Adicionar Novo Serviço**
:--- | :---
**Procedimento** | 1) Navegar para `produtos_servicos.html`. <br> 2) Clicar no botão "Novo Produto/Serviço". <br> 3) No modal, preencher Código, selecionar "Serviço" no Tipo, Descrição e Unidade (ex: HORA). <br> 4) Clicar em "Salvar".
**Requisitos associados** | RF-04
**Resultado esperado** | O modal é fechado e o novo serviço é adicionado e exibido na tabela da página principal.
**Dados de entrada** | Código: 101, Tipo: Serviço, Descrição: "Consultoria", Unidade: "HORA"
**Resultado obtido** | Sucesso

---

**Caso de Teste** | **CT11 - Lançar Venda de Produto (PDV)**
:--- | :---
**Procedimento** | 1) Navegar para **Faturamento de Produtos**. <br> 2) Clicar em "Consumidor Final" para abrir o modal de seleção de cliente e selecionar um. <br> 3) Digitar um código de produto válido no campo "Digite o código" e pressionar Enter. <br> 4) Alternativamente, clicar em "Buscar Produto", selecionar um produto no modal e fechar.
**Requisitos associados** | RF-05
**Resultado esperado** | O produto é adicionado à lista de "Produtos" na tabela, e o "Total" no rodapé é atualizado.
**Dados de entrada** | Código de produto válido.
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT12 - Finalizar Venda de Produto (Pagamento)**
:--- | :---
**Procedimento** | 1) Em **Faturamento de Produtos**, após adicionar produtos (CT11). <br> 2) Clicar em "Efetuar Pagamento". <br> 3) No modal "Efetuar Pagamento", selecionar uma Forma de Pagamento (ex: "Dinheiro"). <br> 4) Clicar em "Finalizar Venda".
**Requisitos associados** | RF-05
**Resultado esperado** | O modal de pagamento é fechado e o modal "Concluído com sucesso" é exibido. A venda é limpa da tela.
**Dados de entrada** | Forma de Pagamento: "Dinheiro"
**Resultado obtido** | Sucesso

---

**Caso de Teste** | **CT13 - Lançar Venda de Serviço**
:--- | :---
**Procedimento** | 1) Navegar para **Faturamento de Serviços**. <br> 2) Selecionar um cliente (similar ao CT11). <br> 3) Clicar em "Buscar Serviço" e selecionar um serviço no modal.
**Requisitos associados** | RF-06
**Resultado esperado** | O serviço é adicionado à lista na tabela e o "Total" é atualizado.
**Dados de entrada** | Seleção de serviço no modal.
**Resultado obtido** | Sucesso

---

**Caso de Teste** | **CT14 - Adicionar Insumo ao Serviço**
:--- | :---
**Procedimento** | 1) Em **Faturamento de Serviços**, após adicionar um serviço (CT13). <br> 2) Clicar em "Adicionar Insumo". <br> 3) Preencher o modal "Adicionar Insumo" (Quantidade, Valor Unitário, Descrição). <br> 4) Clicar em "Salvar".
**Requisitos associados** | RF-06
**Resultado esperado** | O modal é fechado, o insumo é listado na seção "Insumos" (abaixo da tabela principal) e o "Total" geral é recalculado para incluir o valor do insumo.
**Dados de entrada** | Qtd: 2, Valor Unitário: 10.00, Descrição: "Parafuso"
**Resultado obtido** | Sucesso

---

**Caso de Teste** | **CT15 - Gravar Venda como "Em Aberto"**
:--- | :---
**Procedimento** | 1) Em **Faturamento** de **Produtos ou Faturameno de Serviços**, adicionar itens e um cliente. <br> 2) Clicar no botão "Gravar". <br> 3) Preencher o nome do cliente no modal "Gravar Venda" e clicar em "Salvar". <br> 4) Navegar para **Vendas em Aberto**.
**Requisitos associados** | RF-05, RF-06, RF-07
**Resultado esperado** | A venda gravada aparece na lista da tabela em **Vendas em Aberto**.
**Dados de entrada** | Nome do cliente no modal "Gravar".
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT16 - Editar Venda "Em Aberto"**
:--- | :---
**Procedimento** | 1) Navegar para `vendas_aberto.html`. <br> 2) Localizar uma venda gravada (do CT15). <br> 3) Clicar no ícone de lápis (editar) correspondente.
**Requisitos associados** | RF-07
**Resultado esperado** | O usuário é redirecionado de volta para a tela de faturamento (produtos ou serviços) com todos os dados da venda (cliente, itens) pré-carregados para edição.
**Dados de entrada** | N/A (Navegação)
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT17 - Adicionar Nova Conta a Pagar**
:--- | :---
**Procedimento** | 1) Navegar para `pagar.html`. <br> 2) Clicar em "+ Nova Conta". <br> 3) Preencher o modal "Adicionar Nova Conta a Pagar" (Status, Tipo, Valor, Descrição, Vencimento). <br> 4) Clicar em "Salvar".
**Requisitos associados** | RF-08
**Resultado esperado** | O modal é fechado e a nova conta é adicionada e exibida na tabela.
**Dados de entrada** | Status: Pendente, Tipo: "Fornecedor", Valor: 200.00, Descrição: "Material Escritório"
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT18 - Adicionar Nova Conta a Receber**
:--- | :---
**Procedimento** | 1) Navegar para `receber.html`. <br> 2) Clicar em "Nova Fatura". <br> 3) Preencher o modal "Adicionar/Editar Conta a Receber" (Status, Tipo, Cliente, Descrição, Vencimento, Valor). <br> 4) Clicar em "Salvar".
**Requisitos associados** | RF-08
**Resultado esperado** | O modal é fechado e a nova fatura é adicionada e exibida na tabela.
**Dados de entrada** | Status: Pendente, Tipo: "Serviço", Cliente: "Cliente Teste", Valor: 500.00
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT19 - Adicionar Compromisso na Agenda**
:--- | :---
**Procedimento** | 1) Navegar para `agenda.html`. <br> 2) Clicar em "Novo Compromisso". <br> 3) No modal, inserir a "Descrição do Compromisso" e a "Data do Compromisso". <br> 4) Clicar em "Salvar".
**Requisitos associados** | RF-09
**Resultado esperado** | O modal é fechado. (A validação visual do evento no calendário depende da implementação JS da agenda).
**Dados de entrada** | Descrição: "Reunião Equipe", Data: (data futura)
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT20 - Alternar Visualização da Agenda (Diário/Mensal)**
:--- | :---
**Procedimento** | 1) Navegar para `agenda.html`. <br> 2) Clicar no botão "Diário/Mensal".
**Requisitos associados** | RF-09
**Resultado esperado** | A visualização da agenda alterna entre a exibição do calendário mensal e a exibição da agenda diária (por horas).
**Dados de entrada** | N/A (Clique)
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT21 - Teste de Responsividade (Menu Sidebar)**
:--- | :---
**Procedimento** | 1) Acessar qualquer página logada (ex: `dashboard.html`) em um desktop. <br> 2) Reduzir a largura da janela do navegador (simulando um dispositivo móvel). <br> 3) Observar o menu lateral. <br> 4) Clicar no botão "hamburger" (ícone de lista) que aparece no topo.
**Requisitos associados** | RNF-02
**Resultado esperado** | Em larguras menores, o menu lateral (sidebar) desaparece. O botão "hamburger" é exibido. Ao clicar no botão, o menu (offcanvas) desliza para a tela.
**Dados de entrada** | N/A (Redimensionamento de tela)
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT22 - Interação com Filtros (Relatório Produtos/Serviços)**
:--- | :---
**Procedimento** | 1) Acessar `rel_produtos_servicos.html` (após login). <br> 2) Interagir com os campos de filtro (Tipo, Fornecedor, Produtos/Serviços, Saldo). <br> 3) Clicar no botão "Filtrar".
**Requisitos associados** | RF-10, RNF-01
**Resultado esperado** | A página permite a seleção de valores nos filtros e o clique no botão "Filtrar" (a ação de filtragem real depende do backend, mas a interação da interface é testada). O acesso sem login é bloqueado.
**Dados de entrada** | N/A (Interação com a UI)
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT23 - Interação com Filtros (Relatório Financeiro)**
:--- | :---
**Procedimento** | 1) Acessar `rel_financeiro.html` (após login). <br> 2) Interagir com os campos de filtro (Período, Status, Tipo, Cliente/Fornecedor). <br> 3) Clicar no botão "Filtrar".
**Requisitos associados** | RF-11, RNF-01
**Resultado esperado** | A página permite a seleção de valores nos filtros e o clique no botão "Filtrar". O gráfico SVG e a tabela são exibidos. O acesso sem login é bloqueado.
**Dados de entrada** | N/A (Interação com a UI)
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT24 - Interação com Filtros (Relatório Faturamento)**
:--- | :---
**Procedimento** | 1) Acessar `rel_faturamento.html` (após login). <br> 2) Interagir com os campos de filtro (Período, Tipo, Forma de Pagamento). <br> 3) Clicar no botão "Filtrar".
**Requisitos associados** | RF-12, RNF-01
**Resultado esperado** | A página permite a seleção de valores nos filtros e o clique no botão "Filtrar". O acesso sem login é bloqueado (verificado pelo script `if (!usuarioCorrente.email_login)`).
**Dados de entrada** | N/A (Interação com a UI)
**Resultado obtido** | Sucesso

---

**Caso de Teste** | **CT25 - Teste de Usabilidade (Consistência da Interface)**
:--- | :---
**Procedimento** | 1) Efetuar login. <br> 2) Navegar entre **Dashboard**, **Clientes e Fornecedores**, **Produtos e Serviços**, **Faturamento de Produtos**, **Faturamento de Serviços**, **Vendas em Aberto**, **Agenda**, **Relatório Financeiro**, **Relatório Faturamento**, **Relatório de Produtos e Serviços** e **Configurações**. <br> 3) Observar o layout geral.
**Requisitos associados** | RNF-04
**Resultado esperado** | Todas as páginas logadas exibem o mesmo Topbar (barra azul com "Olá, [Nome]" e "Logout") e o mesmo menu lateral (Sidebar/Offcanvas). O estilo visual (botões, fontes) é consistente.
**Dados de entrada** | N/A (Navegação)
**Resultado obtido** | Sucesso

---

**Caso de Teste** | `rever` **CT26 - Teste de Desempenho (Carga de Página) - (Planejado)**
:--- | :---
**Procedimento** | 1) (Planejado) Utilizar ferramentas (ex: Lighthouse, PageSpeed Insights) em ambiente de homologação. <br> 2) Medir o tempo de carregamento (LCP - Largest Contentful Paint) da `dashboard.html` após o login.
**Requisitos associados** | RNF-03
**Resultado esperado** | (Planejado) O tempo de LCP deve ser inferior a 2.5 segundos, conforme especificado no requisito RNF-03.
**Dados de entrada** | N/A (Ferramenta de medição)
**Resultado obtido** | Pendente (Fase de Testes de Desempenho)

---

**Caso de Teste** | `rever` **CT27 - Teste de Confiabilidade (Estresse) - (Planejado)**
:--- | :---
**Procedimento** | 1) (Planejado) Utilizar ferramenta de teste de carga (ex: JMeter, K6) em ambiente de homologação. <br> 2) Simular 50 usuários concorrentes (conforme RNF-05) realizando as ações de Login (CT03) e Faturamento (CT11) por um período de 10 minutos.
**Requisitos associados** | RNF-05, RNF-03
**Resultado esperado** | (Planejado) O sistema deve manter a funcionalidade (taxa de erro < 1%) e o tempo de resposta médio não deve degradar significativamente (conforme RNF-03) durante o teste.
**Dados de entrada** | N/A (Script de teste de carga)
**Resultado obtido** | Pendente (Fase de Testes de Carga)

## Registro dos Testes de Software

Esta seção deve apresentar o relatório com as evidências dos testes de software realizados no sistema pela equipe, baseado no plano de testes pré-definido. Documente cada caso de teste apresentando um vídeo ou animação que comprove o funcionamento da funcionalidade. Veja os exemplos a seguir.

|*Caso de Teste*                                 |*CT01 - Criar conta parte 1*                                         |
|---|---|
|Requisito Associado | RF-001 - A aplicação deve permitir que os usuários criem uma conta e gerenciem seu cadastro|
|Link do vídeo do teste realizado: | https://1drv.ms/u/s!AhD2JqpOUvJChapRtRSQ9vPzbNLwGA?e=mxZs6t| 

|*Caso de Teste*                                 |*CT02 - Criar conta parte 2*                                        |
|---|---|
|Requisito Associado | RF-001 - A aplicação deve permitir que os usuários criem uma conta e gerenciem seu cadastro|
|Link do vídeo do teste realizado: | https://1drv.ms/v/s!AhD2JqpOUvJChapQ8CPXL-TI_A7iVg?e=spD3Ar | 


## Avaliação dos Testes de Software

Discorra sobre os resultados do teste. Ressaltando pontos fortes e fracos identificados na solução. Comente como o grupo pretende atacar esses pontos nas próximas iterações. Apresente as falhas detectadas e as melhorias geradas a partir dos resultados obtidos nos testes.

## Testes de unidade automatizados (Opcional)

Se o grupo tiver interesse em se aprofundar no desenvolvimento de testes de software, ele podera desenvolver testes automatizados de software que verificam o funcionamento das funções JavaScript desenvolvidas. Para conhecer sobre testes unitários em JavaScript, leia 0 documento  [Ferramentas de Teste para Java Script](https://geekflare.com/javascript-unit-testing/).

# Testes de Usabilidade

O objetivo do Plano de Testes de Usabilidade é obter informações quanto à expectativa dos usuários em relação à  funcionalidade da aplicação de forma geral.

Para tanto, elaboramos quatro cenários, cada um baseado na definição apresentada sobre as histórias dos usuários, definido na etapa das especificações do projeto.

Foram convidadas quatro pessoas que os perfis se encaixassem nas definições das histórias apresentadas na documentação, visando averiguar os seguintes indicadores:

Taxa de sucesso: responde se o usuário conseguiu ou não executar a tarefa proposta;

Satisfação subjetiva: responde como o usuário avalia o sistema com relação à execução da tarefa proposta, conforme a seguinte escala:

1. Péssimo; 
2. Ruim; 
3. Regular; 
4. Bom; 
5. Ótimo.

Tempo para conclusão da tarefa: em segundos, e em comparação com o tempo utilizado quando um especialista (um desenvolvedor) realiza a mesma tarefa.

Objetivando respeitar as diretrizes da Lei Geral de Proteção de Dados, as informações pessoais dos usuários que participaram do teste não foram coletadas, tendo em vista a ausência de Termo de Consentimento Livre e Esclarecido.

Apresente os cenários de testes utilizados na realização dos testes de usabilidade da sua aplicação. Escolha cenários de testes que demonstrem as principais histórias de usuário sendo realizadas. Neste tópico o grupo deve detalhar quais funcionalidades avaliadas, o grupo de usuários que foi escolhido para participar do teste e as ferramentas utilizadas.

> - [UX Tools](https://uxdesign.cc/ux-user-research-and-user-testing-tools-2d339d379dc7)


## Cenários de Teste de Usabilidade

| Nº do Cenário | Descrição do cenário |
|---------------|----------------------|
| 1             | Você é uma pessoa que deseja comprar um iphone. Encontre no site um iphone e veja detalhes de localização e contato da loja que anunciando. |
| 2             | Você é uma pessoa que deseja comprar um smartphone até R$ 2.000,00. Encontre no site smartphone's nessa faixa de preço. |



## Registro de Testes de Usabilidade

Cenário 1: Você é uma pessoa que deseja comprar um iphone. Encontre no site um iphone e veja detalhes de localização e contato da loja que anunciando.

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 1       | SIM             | 5                    | 27.87 segundos                  |
| 2       | SIM             | 5                    | 17.11 segundos                  |
| 3       | SIM             | 5                    | 39.09 segundos                  |
|  |  |  |  |
| **Média**     | 100%           | 5                | 28.02 segundos                           |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 8.66 segundos |


    Comentários dos usuários: Achei o site muito bom e intuitivo. 
    Não tive dificuldades e acho que ficou bem intuitivo.


Cenário 2: Você é uma pessoa que deseja comprar um smartphone até R$ 2.000,00. Encontre no site smartphone's nessa faixa de preço.

| Usuário | Taxa de sucesso | Satisfação subjetiva | Tempo para conclusão do cenário |
|---------|-----------------|----------------------|---------------------------------|
| 1       | SIM             | 5                    | 22.54 segundos                          |
| 2       | SIM             | 5                    | 31.42 segundos                          |
| 3       | SIM             | 4                    | 36.21 segundos                          |
|  |  |  |  |
| **Média**     | 100%           | 4.67                | 30.05 segundos                           |
| **Tempo para conclusão pelo especialista** | SIM | 5 | 13.57 segundos |


    Comentários dos usuários: O site é fácil de acessar, mas algumas páginas poderiam 
    redirecionar a gente automaticamente para outras. Senti a falta de mais opções de filtros, 
    tanto na hora da pesquisa, quanto depois dela, nos resultados.

## Avaliação dos Testes de Usabilidade

Tomando como base os resultados obtidos, foi possível verificar que a aplicação web apresenta bons resultados quanto à taxa de sucesso na interação dos usuários, tendo em vista que os cenários propostos foram concluídos com sucesso.

Além disso, a aplicação obteve também uma elevada satisfação subjetiva dos usuários no momento que realizavam os cenários propostos. Prova são as médias das avaliações em cada um dos cenários, que variou entre 4 (bom) e 5 (ótimo).

Com relação ao tempo para conclusão de cada tarefa/cenário, notamos discrepância entre a média de tempo dos usuários e o tempo do especialista/desenvolvedor em todos os cenários. Tal discrepância, em certa medida, é esperada, tendo em vista que o desenvolvedor já tem prévio conhecimento de toda a interface da aplicação, do posicionamento dos elementos, lógica de organização das páginas, etc.

Contudo, tendo em vista que a diferença foi relevante (por exemplo, 113 segundos — média usuários — contra 25 segundos — especialista — no cenário três), e ainda os comentários feitos por alguns usuários, entendemos haver oportunidades de melhoria na usabilidade da aplicação.



