# Programação de Funcionalidades

<!-- Implementação do sistema descritas por meio dos requisitos funcionais e/ou não funcionais. Deve relacionar os requisitos atendidos os artefatos criados (código fonte) além das estruturas de dados utilizadas e as instruções para acesso e verificação da implementação que deve estar funcional no ambiente de hospedagem.

Para cada requisito funcional, pode ser entregue um artefato desse tipo.

O professor Rommel Carneiro apresenta alguns exemplos prontos para serem utilizados como referência:
- Login do sistema: [https://repl.it/@rommelpuc/LoginApp](https://repl.it/@rommelpuc/LoginApp) 
- Cadastro de Contatos: [https://repl.it/@rommelpuc/Cadastro-de-Contatos](https://repl.it/@rommelpuc/Cadastro-de-Contatos)


> **Links Úteis**:
>
> - [Trabalhando com HTML5 Local Storage e JSON](https://www.devmedia.com.br/trabalhando-com-html5-local-storage-e-json/29045)
> - [JSON Tutorial](https://www.w3resource.com/JSON)
> - [JSON Data Set Sample](https://opensource.adobe.com/Spry/samples/data_region/JSONDataSetSample.html)
> - [JSON - Introduction (W3Schools)](https://www.w3schools.com/js/js_json_intro.asp)
> - [JSON Tutorial (TutorialsPoint)](https://www.tutorialspoint.com/json/index.htm)

## Exemplo -->

## Requisitos Atendidos

As tabelas que se seguem apresentam os requisitos funcionais e não-funcionais que relacionam o escopo do projeto com os artefatos criados:

### Requisitos Funcionais

|ID    | Descrição do Requisito | Responsável | Artefato Criado |
|------|------------------------|------------|-----------------|
| RF-01 | O sistema deve permitir o cadastro de usuários e login com email e senha. | Lucas Mendes Fernandes | index.html | 
| RF-02 | O sistema deve exibir na tela inicial um dashboard mostrando informações relevantes, como as vendas do mês. | Alex Daniel Muzzi Souza | dashboard.html | 
| RF-03 | O sistema deve permitir o cadastro de clientes e fornecedores e exibir todos em uma lista com filtros. | Augustus Dayrell de Moura Souza | clientes_fornecedores.html | 
| RF-04 | O sistema deve permitir cadastrar produtos e serviços e exibir todos em uma lista com filtros. | Vitor Martins de Moraes | produtos_servicos.html | 
| RF-05 | O sistema deve permitir a emissão de venda de produtos, possibilitando a seleção de cliente, produtos e forma de pagamento. | Lucas Mendes Fernandes | faturamento_produtos.html | 
| RF-06 | O sistema deve permitir a emissão de serviços com seleção de cliente, serviços realizados, forma de pagamento e lançamento de insumos. | Lucas Mendes Fernandes | faturamento_servicos.html | 
| RF-07 | O sistema deve permitir salvar as vendas e serviços como "em aberto", exibindo-os em uma lista e possibilitando editar ou finalizar o item desejado. | Matteo Leonardo Gysel | vendas_aberto.html | 
| RF-08 | O sistema deve permitir listar as faturas a receber e a pagar e permitir o cadastro de novas faturas. | Vitor Martins de Moraes | receber.html, pagar.html | 
| RF-08 | O sistema deve permitir listar as faturas a receber e a pagar e permitir o cadastro de novas faturas. | Vitor Martins de Moraes | receber.html | 
| RF-09 | O sistema deve permitir ao usuário criar compromissos e administrá-los por meio de uma agenda e gerir compromissos recorrentes. | Matteo Leonardo Gysel | agenda.html | 
| RF-10 | O sistema deve permitir a emissão de relatórios de vendas e serviços realizados, possibilitando filtrar por cliente ou por data. | Lucas Mendes Fernandes | rel_faturamento.html | 
| RF-11 | O sistema deve permitir a emissão de relatório de faturas pagas, a pagar, recebidas, a receber e de fluxo de caixa. | Augustus Dayrell de Moura Souza | rel_financeiro.html | 
| RF-12 | O sistema deve permitir a emissão de relatório de produtos, com saldos em estoque, ou de serviços, estilo tabela de preços. | Alex Daniel Muzzi Souza | rel_produtos_servicos.html | 

## Descrição das estruturas:

## Usuarios
Armazena os dados do usuário principal do sistema (a empresa que utiliza o ERP).

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:--------------:|-------------------|-------------------------------------------|------------------------------------------------|
| id | Número (Inteiro) | Identificador único do usuário | 1 |
| tem_cnpj | Booleano | Indica se o usuário possui CNPJ (Pessoa Jurídica) | `true` |
| razao_social | Texto | Razão Social da empresa | "Empresa XPTO LTDA" |
| nome | Texto | Nome de fantasia ou nome | "XPTO" |
| cpf_cnpj | Texto | CPF ou CNPJ do usuário | "00.000.000/0001-00" |
| endereco | Texto | Endereço completo (pode ser nulo) | "Rua das Flores, 123, São Paulo, SP" |
| telefone | Texto | Número de telefone para contato | "(11) 99999-8888" |
| email_login | Texto | Email utilizado para login no sistema | "admin@meuerp.com" |
| senha_hash | Texto | Senha criptografada (hash) | "hash_da_senha" |



## Clientes_Fornecedores
Cadastro unificado de clientes e fornecedores.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:--------------:|-------------------|-------------------------------------------|------------------------------------------------|
| usuarioId | Número (Inteiro) | ID do usuário proprietário  (FK de `usuarios`) | 1 |
| id | Número (Inteiro) | Identificador único | 101 |
| tipo | Texto | Define se é "cliente" ou "fornecedor" | "cliente" |
| nome_razao_social | Texto | Nome Completo (PF) ou Razão Social (PJ) | "Cliente Exemplo SA" |
| cpf_cnpj | Texto | Documento (CPF ou CNPJ) | "11.111.111/0001-11" |
| telefone | Texto | Número de telefone para contato | "(11) 99999-8888" |
| email | Texto | Email principal de contato | "contato@cliente.com" |
| endereco | Texto | Endereço completo (pode ser nulo) | "Rua das Flores, 123, São Paulo, SP" |

## Produtos_Servicos
Cadastro de produtos (para estoque) e serviços prestados.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:--------------:|-------------------|-------------------------------------------|------------------------------------------------|
| usuarioId | Número (Inteiro) | ID do usuário proprietário  (FK de `usuarios`) | 1 |
| id | Número (Inteiro) | Identificador único | 301 |
| tipo | Texto | Define se é "produto" ou "servico" | "produto" |
| descricao | Texto | Descrição detalhada do item | "Mouse Sem Fio Ultra Slim" |
| codigo_barras | Texto | Código de barras (EAN, etc.) (pode ser nulo) | "7890123456789" |
| preco_venda | Número (Decimal) | Preço de venda ao cliente | 89.90 |
| preco_custo | Número (Decimal) | Preço de custo de aquisição/produção (pode ser 0 ou nulo) | 45.00 |
| estoque_atual | Número (Inteiro) | Quantidade em estoque (pode ser nulo para serviços) | 50 |
| unidade | Texto | Unidade de medida (un, kg, hr, etc.) | "un" |

## Vendas
Registra as transações de venda de produtos ou serviços.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:--------------:|-------------------|-------------------------------------------|------------------------------------------------|
| usuarioId | Número (Inteiro) | ID do usuário proprietário  (FK de `usuarios`) | 1 |
| id | Número (Inteiro) | Identificador único da venda | 501 |
| clientes_fornecedoresId | Número (Inteiro) | ID do cliente (FK de `clientes_fornecedores`) | 101 |
| tipo_venda | Texto | Define se a venda é de "produto" ou "servico" | "produto" |
| data_venda | Data/Hora (Texto ISO) | Data e hora em que a venda foi realizada | "2025-09-26T15:00:00Z" |
| status | Texto | Status da venda (ex: "finalizada", "cancelada", "orçamento") | "finalizada" |
| valor_total | Número (Decimal) | Valor total da transação | 89.90 |
| observacoes | Texto | Observações adicionais sobre a venda | "o cliente irá buscar amanhã" |
| itens | Array (Objeto) | Lista dos produtos/serviços vendidos (ver subtabela) | [...] |
| insumos_servico| Array (Objeto) | Lista de insumos/custos de um serviço (ver subtabela) | [...] |

### Vendas - Itens (subtabela de `vendas`)
Itens individuais dentro de uma venda.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:--------------:|-------------------|-------------------------------------------|------------------------------------------------|
| usuarioId | Número (Inteiro) | ID do usuário proprietário  (FK de `usuarios`) | 1 |
| produtos_servicosId | Número (Inteiro) | ID do produto/serviço (FK de `produtos_servicos`) | 301 |
| descricao | Texto | Descrição do item (cache da venda) | "Mouse Sem Fio Ultra Slim" |
| quantidade | Número (Inteiro/Decimal) | Quantidade vendida | 1 |
| preco_unitario | Número (Decimal) | Preço unitário no momento da venda | 89.90 |
| subtotal | Número (Decimal) | Valor total do item (quantidade * preco_unitario) | 89.90 |
| unidade | Texto | Unidade de medida (cache da venda) | "un" |

### Vendas - Insumos_Servico (subtabela de `vendas`)
Insumos ou custos associados a uma venda (geralmente de serviço).

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:--------------:|-------------------|-------------------------------------------|------------------------------------------------|
| descricao | Texto | Descrição do insumo utilizado | "20m fio 5mm" |
| valor | Número (Decimal) | Custo do insumo | 50.00 |

## Faturas
Controle financeiro (Contas a Pagar e Contas a Receber).

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:--------------:|-------------------|-------------------------------------------|------------------------------------------------|
| usuarioId | Número (Inteiro) | ID do usuário proprietário  (FK de `usuarios`) | 1 |
| id | Número (Inteiro) | Identificador único da fatura | 601 |
| tipo | Texto | Define se é "receber" ou "pagar" | "receber" |
| vendaId | Número (Inteiro) | ID da venda associada (pode ser nulo) | 501 |
| clientes_fornecedoresId | Número (Inteiro) | ID do cliente/fornecedor (FK) | 101 |
| descricao | Texto | Descrição da fatura (ex: "Venda #501", "Aluguel") | "Recebimento da Venda #501" |
| valor | Número (Decimal) | Valor da fatura | 89.90 |
| data_vencimento| Data (Texto ISO) | Data limite para pagamento/recebimento | "2025-10-26" |
| data_pagamento | Data (Texto ISO) | Data em que foi paga/recebida (pode ser nulo) | `null` |
| status | Texto | Status da fatura (ex: "pendente", "pago", "atrasado") | "pendente" |

## Agenda_Compromissos
Armazena eventos, reuniões e lembretes.

| **Nome** | **Tipo** | **Descrição** | **Exemplo** |
|:--------------:|-------------------|-------------------------------------------|------------------------------------------------|
| usuarioId | Número (Inteiro) | ID do usuário proprietário  (FK de `usuarios`) | 1 |
| id | Número (Inteiro) | Identificador único do compromisso | 801 |
| titulo | Texto | Título ou breve descrição do evento | "Reunião com Cliente Exemplo SA" |
| data_hora | Data/Hora (Texto ISO) | Data e hora de início do compromisso | "2025-10-05T14:00:00Z" |
| vendaId | Número (Inteiro) | ID da venda associada (pode ser nulo) | `null` |
| clientes_fornecedoresId | Número (Inteiro) | ID do cliente/fornecedor associado (FK) | 101 |
| recorrencia | Array (Data/Hora) | Lista de datas/horas das próximas ocorrências (se houver) | `["2025-11-05T14:00:00Z", ...]` |