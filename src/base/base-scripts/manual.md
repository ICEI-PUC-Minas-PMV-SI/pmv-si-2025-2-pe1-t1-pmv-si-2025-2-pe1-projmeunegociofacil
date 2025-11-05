# Manual de Padrões: Manipulação do LocalStorage

## 1. Visão Geral

Este documento descreve o padrão adotado no projeto para ler e escrever dados no `localStorage` do navegador. O `localStorage` é utilizado como um banco de dados local simples para armazenar todos os dados da aplicação.

O padrão principal é: **Uma Chave por Tipo de Dado**. Não armazenamos itens individuais (como `usuario_1`, `cliente_5`) em chaves separadas. Em vez disso, armazenamos um *array completo* de objetos para cada entidade principal, usando uma chave específica.

## 2. Estrutura de Chaves

Os dados da aplicação são organizados nas seguintes chaves principais no `localStorage`:

* `usuarios`: (Array) Lista de todos os usuários cadastrados no sistema.
* `clientes_fornecedores`: (Array) Lista de todos os clientes e fornecedores de *todos* os usuários.
* `produtos_servicos`: (Array) Lista de todos os produtos e serviços de *todos* os usuários.
* `vendas`: (Array) Lista de todas as vendas de *todos* os usuários.
* `faturas`: (Array) Lista de todas as contas a pagar e receber de *todos* os usuários.
* `agenda_compromissos`: (Array) Lista de todos os compromissos de *todos* os usuários.
* `config`: (Array) Configurações da aplicação.

Cada item dentro desses arrays (exceto `usuarios`) contém uma chave `usuarioId` para indicar a qual usuário pertence.

## 3. O Padrão CRUD (Create, Read, Update, Delete)

Todas as operações de manipulação de dados devem seguir o ciclo **Ler-Modificar-Escrever**.

1.  **Ler (Read):** Carregar o array completo do `localStorage` para a memória.
2.  **Modificar (Modify):** Alterar esse array em memória (adicionar, editar ou remover itens).
3.  **Escrever (Write):** Salvar (sobrescrever) o array modificado de volta no `localStorage`.

---

### 3.1. Leitura (Read)

**NUNCA** presuma que os dados no `localStorage` pertencem apenas ao usuário logado.

**Padrão de Leitura:**
1.  Obtenha o array completo (string) do `localStorage` usando `localStorage.getItem("nome_da_chave")`.
2.  Faça o parse da string para um array de objetos: `JSON.parse()`.
    * **Boa Prática:** Sempre preveja o caso da chave não existir ou estar vazia (como na função `initLoginApp`), usando um valor padrão (ex: `JSON.parse(variavelJSON || "[]")`) para retornar um array vazio e evitar erros.
3.  **Filtre** o array com base no `usuarioCorrente.id` para obter apenas os dados relevantes.

**Exemplo (de `faturamento_produtos.js`):**

```javascript
// O objeto 'usuarioCorrente' deve estar disponível globalmente (definido no login)

// 1. Obter TODOS os clientes de TODOS os usuários
// Note: o `|| []` é uma boa prática caso o item não exista
let todosOsClientes = JSON.parse(localStorage.getItem('clientes_fornecedores')) || []; //

// 2. Filtrar APENAS os clientes do usuário logado
let meusClientes = todosOsClientes.filter(item => { //
    // Apenas clientes (tipo: "cliente") E que pertençam ao usuário logado
    return item.tipo === "cliente" && item.usuarioId === usuarioCorrente.id; //
});

// 3. Fazer o mesmo para produtos
let todosOsProdutos = JSON.parse(localStorage.getItem('produtos_servicos')) || []; //

let meusProdutos = todosOsProdutos.filter(item => { //
    return item.tipo === "produto" && item.usuarioId === usuarioCorrente.id; //
});

```

### 3.2. Escrita (Create, Update, Delete)

Para qualquer operação de escrita, você deve primeiro ler o array completo, modificá-lo e, em seguida, salvá-lo de volta, sobrescrevendo o valor anterior.

#### A. Criar (Create)

1.  Leia o array completo (`JSON.parse(...) || []`).
2.  Gere um novo ID para o item. (Veja o padrão em `login.js`: `addUser` encontra o `maxId` e soma 1).
3.  Adicione o `usuarioId` (vindo do `usuarioCorrente.id`) ao novo objeto.
4.  Adicione (`.push()`) o novo objeto ao array.
5.  Salve (`localStorage.setItem()`) o array modificado (e "stringificado" com `JSON.stringify()`).

**Exemplo (Adicionar um novo produto):**

```javascript
// 1. Ler
let produtos = JSON.parse(localStorage.getItem('produtos_servicos')) || [];

// 2. Gerar ID (exemplo simplificado, veja login.js para o padrão de maxId)
let novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;

// 3. Criar novo objeto
let novoProduto = {
    "id": novoId,
    "tipo": "produto",
    "descricao": "Novo Produto Teste",
    "preco_venda": 50.00,
    "preco_custo": 25.00,
    "estoque_atual": 100,
    "unidade": "un",
    "usuarioId": usuarioCorrente.id // Essencial!
};

// 4. Modificar (em memória)
produtos.push(novoProduto);

// 5. Escrever
localStorage.setItem('produtos_servicos', JSON.stringify(produtos));
```

#### B. Atualizar (Update)

1.  Leia o array completo.
2.  Encontre o item que deseja atualizar (ex: `array.find(item => item.id === idParaEditar)`).
3.  Modifique as propriedades do objeto encontrado.
4.  Salve o array completo de volta.

**Exemplo (Atualizar o preço de um produto):**

```javascript
let idParaEditar = 3; // ID do produto a ser editado
let novoPreco = 99.90;

// 1. Ler
let produtos = JSON.parse(localStorage.getItem('produtos_servicos')) || [];

// 2. Modificar (em memória)
let produtoParaEditar = produtos.find(p => p.id === idParaEditar && p.usuarioId === usuarioCorrente.id);

if (produtoParaEditar) {
    produtoParaEditar.preco_venda = novoPreco;
}

// 3. Escrever
localStorage.setItem('produtos_servicos', JSON.stringify(produtos));
```

#### C. Excluir (Delete)

1.  Leia o array completo.
2.  Use `.filter()` para criar um *novo* array contendo todos os itens, *exceto* aquele que você deseja excluir.
3.  Salve este *novo* array de volta no `localStorage`.

**Exemplo (Excluir um produto):**

```javascript
let idParaExcluir = 5; // ID do produto a ser excluído

// 1. Ler
let produtos = JSON.parse(localStorage.getItem('produtos_servicos')) || [];

// 2. Modificar (usando filter)
// Note: Não precisamos filtrar por usuarioId aqui, pois o ID deve ser único.
// Mas se a exclusão for feita por alguém que não seja o dono, o filtro por usuarioId é uma boa prática
// de segurança antes de executar a operação.
let produtosAtualizados = produtos.filter(p => p.id !== idParaExcluir);

// 3. Escrever
localStorage.setItem('produtos_servicos', JSON.stringify(produtosAtualizados));
```

## 4. Resumo das Regras de Ouro

1.  **Sempre `parse` na leitura:** `JSON.parse(localStorage.getItem(key)) || []`
2.  **Sempre `stringify` na escrita:** `localStorage.setItem(key, JSON.stringify(array))`
3.  **Sempre filtre por `usuarioId`:** Ao *ler* dados para exibição (`.filter(item => item.usuarioId === usuarioCorrente.id)`).
4.  **Sempre adicione `usuarioId`:** Ao *criar* novos itens (`novoItem.usuarioId = usuarioCorrente.id`).
5.  **Ciclo R-M-W:** Sempre leia o array inteiro, modifique-o em memória e salve-o de volta.