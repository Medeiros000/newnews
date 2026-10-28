# Chain of Responsibility no New News

Este documento detalha o funcionamento, a arquitetura e os benefícios do padrão de projeto comportamental **Chain of Responsibility (Cadeia de Responsabilidades)** aplicado ao fluxo de ingestão e processamento de notícias no backend do projeto New News.

---

## 📌 1. Visão Geral do Padrão

O **Chain of Responsibility** permite que uma solicitação ou dado percorra uma sequência encadeada de manipuladores (*handlers*). 
Cada handler possui uma responsabilidade única e bem definida e tem autonomia para:
1. **Processar ou enriquecer** o dado recebido;
2. **Encaminhar** o dado para o próximo handler na cadeia (`passToNext`);
3. **Interromper a cadeia** retornando `null` caso ocorra uma falha de validação, duplicidade ou erro na persistência, evitando que etapas posteriores sejam executadas desnecessariamente.

---

## 🔄 2. Fluxo da Cadeia de Ingestão de Notícias

O pipeline de ingestão orquestra a execução da seguinte cadeia:

```text
               ┌────────────────────────┐
               │    FetchNewsHandler    │  (Busca dados brutos na Currents API)
               └───────────┬────────────┘
                           │ Retorna CurrentsArticle[]
                           ▼
              ┌───────────────────────────┐
              │   NormalizationHandler    │  (Converte HTML/datas e gera slugs)
              └────────────┬──────────────┘
                           │ Retorna NormalizedNews
                           ▼
              ┌───────────────────────────┐
              │     ValidationHandler     │  (Valida schema Zod da notícia)
              └────────────┬──────────────┘
                           │ Se inválido: interrompe (retorna null)
                           ▼
              ┌───────────────────────────┐
              │   DeduplicationHandler    │  (Verifica duplicatas no BD e lote)
              └────────────┬──────────────┘
                           │ Se duplicado: interrompe (retorna null)
                           ▼
              ┌───────────────────────────┐
              │    NewsInsertionHandler   │  (Insere no PostgreSQL via Prisma)
              └────────────┬──────────────┘
                           │ Notícias salvas > 0
                           ▼
              ┌───────────────────────────┐
              │   CacheEvictionHandler    │  (Invalida cache Redis 'news:list:*')
              └───────────────────────────┘
```

---

## 🧩 3. Handlers e Suas Responsabilidades

Todos os handlers estendem a classe abstrata base [`AbstractNewsHandler<TIn, TOut>`](file:///c:/newnews/backend/src/services/newsIngestion/handlers/INewsHandler.ts).

### 1. [`FetchNewsHandler`](file:///c:/newnews/backend/src/services/newsIngestion/handlers/FetchNewsHandler.ts)
* **Entrada:** `void` | **Saída:** `CurrentsArticle[] | null`
* **Função:** Encapsula a chamada à API externa (`CurrentsApiClient`).
* **Regra de Interrupção:** Se a requisição falhar ou não retornar nenhum artigo, interrompe o fluxo imediatamente, evitando processamentos posteriores.

### 2. [`NormalizationHandler`](file:///c:/newnews/backend/src/services/newsIngestion/handlers/NormalizationHandler.ts)
* **Entrada:** `CurrentsArticle` | **Saída:** `NormalizedNews | null`
* **Função:** Remove tags HTML do texto, extrai domínios da URL de origem, formata datas com fallback e gera o slug do título.
* **Regra de Interrupção:** Se o parsing e normalização de campos obrigatórios falhar, o artigo é descartado.

### 3. [`ValidationHandler`](file:///c:/newnews/backend/src/services/newsIngestion/handlers/ValidationHandler.ts)
* **Entrada:** `NormalizedNews` | **Saída:** `NormalizedNews | null`
* **Função:** Aplica a validação de schema estrito com a biblioteca Zod (`newsValidationSchema`), verificando URLs válidas, tamanhos mínimos de título e conteúdo.
* **Regra de Interrupção:** Artigos que não cumpram o contrato são descartados registrando o log de erro.

### 4. [`DeduplicationHandler`](file:///c:/newnews/backend/src/services/newsIngestion/handlers/DeduplicationHandler.ts)
* **Entrada:** `NormalizedNews` | **Saída:** `NormalizedNews | null`
* **Função:** Evita inserções repetidas conferindo `title` e `slug`.
* **Regra de Interrupção:** Interrompe a cadeia caso o artigo já exista no banco de dados ou já tenha aparecido dentro do lote da execução atual.

### 5. [`NewsInsertionHandler`](file:///c:/newnews/backend/src/services/newsIngestion/handlers/NewsInsertionHandler.ts)
* **Entrada:** `NormalizedNews` | **Saída:** `NormalizedNews | null`
* **Função:** Responsável pela inserção / persistência final da notícia no banco de dados através do `NewsRepository`, associando categorias.
* **Regra de Interrupção:** Se a gravação falhar, registra o erro individualmente sem interromper a execução dos demais artigos do lote. Mantém a contagem de sucessos via `getInsertedCount()`.

### 6. [`CacheEvictionHandler`](file:///c:/newnews/backend/src/services/newsIngestion/handlers/CacheEvictionHandler.ts)
* **Entrada:** `NormalizedNews` | **Saída:** `NormalizedNews | null`
* **Função:** Responsável por invalidar e excluir chaves de cache no Redis por padrão (`news:list:*`).
* **Comportamento:** Pode ser acionado no pipeline ao término da ingestão para expurgar a listagem desatualizada ou encadeado após cada inserção com tolerância a falhas (não aborta o fluxo caso o Redis esteja indisponível).

---

## 💻 4. Configuração e Execução no Pipeline

No arquivo [`NewsIngestionPipeline.ts`](file:///c:/newnews/backend/src/services/newsIngestion/NewsIngestionPipeline.ts), a montagem da cadeia e a execução tornaram-se totalmente declarativas:

```typescript
// Configuração da cadeia (Setup)
this.normalizerHandler
    .setNext(this.validatorHandler)
    .setNext(this.deduplicatorHandler)
    .setNext(this.insertionHandler);

// 1. Busca externa
const rawArticles = await this.fetchHandler.handle();
if (!rawArticles || rawArticles.length === 0) return;

// 2. Processamento individual na cadeia
for (const raw of rawArticles) {
    await this.normalizerHandler.handle(raw);
}

// 3. Exclusão e invalidação do cache caso novas notícias tenham sido inseridas
const savedCount = this.insertionHandler.getInsertedCount();
if (savedCount > 0) {
    await this.cacheEvictionHandler.invalidateCache();
}
```

---

## ⚖️ 5. Vantagens e Trade-offs

### ✅ Vantagens
* **Princípio da Responsabilidade Única (SRP):** Cada handler cuida apenas de sua atribuição (busca, normalização, validação, deduplicação, persistência e invalidação de cache).
* **Open/Closed Principle (OCP):** Novos passos (como moderação de conteúdo, análise de sentimento ou tradução) podem ser adicionados criando um novo handler e encadeando-o via `setNext()`, sem alterar as classes existentes.
* **Tolerância a Falhas Individuais:** Um erro em uma notícia específica é isolado em seu próprio ciclo na cadeia, sem abortar o processamento dos demais itens do lote.
* **Código Limpo e Testável:** Cada handler pode ser instanciado e testado isoladamente com mocks de suas dependências.

### ⚠️ Trade-offs
* **Encadeamento Manual:** A ordem de chamada dos handlers precisa ser mantida coerente (ex: validar antes de checar duplicatas e persistir).
* **Rastreabilidade de Descarte:** Quando um handler retorna `null`, o fluxo é finalizado silenciosamente para aquele item a menos que logs descritivos sejam mantidos (como implementado nos handlers com emojis descritivos).
