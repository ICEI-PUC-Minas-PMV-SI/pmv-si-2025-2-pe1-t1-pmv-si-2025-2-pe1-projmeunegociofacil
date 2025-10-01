# Especificações do Projeto

## Personas

Optou-se pela abordagem de Personas, ao invés de Perfis de Usuário, por ser a mais adequada ao público-alvo do projeto: pequenos empreendedores que geralmente gerenciam seus negócios sozinhos. Dessa forma, é importante compreender a fundo suas motivações e desafios. A metodologia de Personas permite projetar uma solução mais empática, intuitiva e que resolve problemas reais do seu dia a dia.  

**João, o Comerciante (50 anos)**: Proprietário de uma pequena mercearia, busca otimizar seu controle de estoque, ter um cadastro dos seus clientes e realizar o cálculo de suas vendas de forma mais prática.  
 
**Roberto, o Prestador de Serviços (45 anos)**: Atende chamados e agendamentos. Seu objetivo é manter um histórico dos serviços realizados, organizar a agenda e registrar rapidamente os insumos utilizados nos atendimentos.  

## Histórias de Usuários

|EU COMO... `PERSONA`| QUERO/PRECISO ... `FUNCIONALIDADE` |PARA ... `MOTIVO/VALOR`                 |
|--------------------|------------------------------------|----------------------------------------|
 | Comerciante | Que meus dados estejam protegidos por senha | Evitar o acesso não autorizado | 
 | Comerciante | Cadastrar meus clientes e fornecedores | Organizar a base de clientes, facilitar emissão de recibos e acompanhar clientes recorrentes | 
 | Comerciante | Cadastrar meus produtos e controlar o estoque | Controlar o estoque, manter preços atualizados e ter base de dados para emissão de vendas | 
 | Comerciante | Registrar as vendas de forma rápida e simples | Controlar as movimentações, acompanhar o fluxo de caixa e o estoque | 
 | Comerciante | Cadastrar e acompanhar faturas a receber e a pagar | Controlar melhor as faturas a pagar e a receber | 
 | Prestador de Serviços | Cadastrar os tipos de serviços que ofereço | Para organizar preços e agilizar lançamentos de vendas | 
 | Prestador de Serviços | Registrar e acompanhar minhas ordens de serviço | Orçar e registrar os serviços prestados e ter acompanhamento dos serviços em aberto | 
 | Prestador de Serviços | Uma agenda de compromissos | Ter clareza nos prazos de entrega, nos agendamentos com clientes e na gestão de recorrências | 
 | Prestador de Serviços | Emitir relatórios de vendas e insumos | Ter clareza dos ganhos e acompanhar o dia-a-dia do pequeno negócio | 

## Requisitos


### Requisitos Funcionais

|ID    | Descrição do Requisito  | Prioridade | 
|------|-----------------------------------------|----| 
 | RF-01 | O sistema deve permitir o cadastro de usuários e login com email e senha. | Alta | 
 | RF-02 | O sistema deve exibir na tela inicial um dashboard mostrando informações relevantes, como as vendas do mês. | Média | 
 | RF-03 | O sistema deve permitir o cadastro de clientes e fornecedores e exibir todos em uma lista com filtros. | Alta | 
 | RF-04 | O sistema deve permitir cadastrar produtos e serviços e exibir todos em uma lista com filtros. | Alta | 
 | RF-05 | O sistema deve permitir a emissão de venda de produtos, possibilitando a seleção de cliente, produtos e forma de pagamento. | Alta | 
 | RF-06 | O sistema deve permitir a emissão de serviços com seleção de cliente, serviços realizados, forma de pagamento e lançamento de insumos. | Alta | 
 | RF-07 | O sistema deve permitir salvar as vendas e serviços como "em aberto", exibindo-os em uma lista e possibilitando editar ou finalizar o item desejado. | Baixa | 
 | RF-08 | O sistema deve permitir listar as faturas a receber e a pagar e permitir o cadastro de novas faturas. | Média | 
 | RF-09 | O sistema deve permitir ao usuário criar compromissos e administrá-los por meio de uma agenda e gerir compromissos recorrentes. | Média | 
 | RF-10 | O sistema deve permitir a emissão de relatórios de vendas e serviços realizados, possibilitando filtrar por cliente ou por data. | Baixa | 
 | RF-11 | O sistema deve permitir a emissão de relatório de faturas pagas, a pagar, recebidas, a receber e de fluxo de caixa. | Baixa | 
 | RF-12 | O sistema deve permitir a emissão de relatório de produtos, com saldos em estoque, ou de serviços, estilo tabela de preços. | Baixa |  


### Requisitos não Funcionais

|ID     | Descrição do Requisito  |Prioridade |
|-------|-------------------------|----|
 | RNF-01 | A interface deve ser minimalista e proporcionar um aprendizado rápido. | Alta | 
 | RNF-02 | Garantir que a interface seja responsiva, proporcionando acesso em dispositivos móveis. | Alta | 
 | RNF-03 | O sistema deve ser totalmente gratuito, sem limitações de acesso às funcionalidades. | Alta | 
 | RNF-04 | Garantir que cada usuário tenha acesso apenas aos dados da organização da qual faz parte. | Alta | 
 | RNF-05 | Permitir acesso offline. | Média | 

 ### Metodologia

Para o gerenciamento do projeto adotou-se a metodologia ágil **SCRUM**, por sua flexibilidade e foco na entrega de valor contínuo.   

O trabalho foi organizado em Sprints semanais. Para a gestão visual das tarefas e o acompanhamento do progresso de cada Sprint, utilizou-se um quadro Kanban na ferramenta Trello, com colunas como **Product Backlog, Sprint Backlog, Em Andamento e Concluído**. Reuniões semanais serão realizadas para planejar as atividades da semana seguinte e revisar o que foi entregue.

 #### Ferramentas de apoio
* **Trello**: Utilizado para a gestão de tarefas e organização do quadro Kanban.  

* **Figma**: Ferramenta de design utilizada para a prototipagem da interface e criação da identidade visual do sistema.

* **VS Code**: Ambiente de desenvolvimento principal para a codificação do projeto.

* **Git & GitHub**: Essencial para o controle de versionamento do projeto.