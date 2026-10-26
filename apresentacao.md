# Padrões e princípios no New News

Este material usa o backend do projeto New News para explicar quatro ideias de orientação a objetos:

- Chain of Responsibility;
- Command;
- encapsulamento;
- segregação de interfaces.

A proposta não é decorar nomes de padrões. É observar como cada decisão diminui o acoplamento e deixa uma parte do sistema mais fácil de trocar, testar ou estender.

## Visão rápida do fluxo

Quando a aplicação inicia, o `App` agenda a ingestão de notícias. O fluxo passa por estas etapas:

```text
App
  -> IngestNewsCommand.execute()
      -> NewsIngestionPipeline.execute()
          -> CurrentsApiClient busca dados
          -> NewsNormalizer normaliza
          -> NewsValidator valida
          -> NewsDeduplicator remove duplicatas
          -> NewsRepository salva
          -> RedisService invalida o cache de listagem
```

A implementação está no backend:

- [App](backend/src/app.ts)
- [IngestNewsCommand](backend/src/commands/IngestNewsCommand.ts)
- [NewsIngestionPipeline](backend/src/services/newsIngestion/NewsIngestionPipeline.ts)
- [NewsValidator](backend/src/services/newsIngestion/NewsValidator.ts)
- [NewsDeduplicator](backend/src/services/newsIngestion/NewsDeduplicator.ts)
- [NewsRepository](backend/src/services/newsIngestion/NewsRepository.ts)

## 1. Encapsulamento

### Ideia

Encapsular é esconder os detalhes internos de uma classe e expor somente o que outras partes precisam usar. Assim, quem chama a classe depende do seu contrato público, e não de como ela implementa esse contrato.

### Exemplo no projeto

Em `NewsRepository`, o método público é `save`. A resolução da categoria fica escondida em métodos privados:

```ts
export class NewsRepository {
    private readonly prisma: PrismaService;
    private readonly redis: RedisService;

    public async save(newsItem: NormalizedNews) {
        const categoryId = await this.findCategoryId(newsItem.category);
        const saved = await this.prisma.news.create({
            data: {
                category_id: categoryId,
                title: newsItem.title,
                slug: newsItem.slug,
                content: newsItem.content,
                // demais campos...
            },
        });

        await this.redis.set(`news:${saved.id}`, saved, 300);
        return saved;
    }

    private async findCategoryId(categoryTexts?: string[]): Promise<number> {
        // busca a melhor categoria ou usa "general"
    }

    private normalizeCategoryText(value?: string): string {
        // remove acentos, normaliza caixa e espaços
    }
}
```

Quem usa o repositório não precisa saber como a categoria é encontrada, como o texto é normalizado ou como o cache é preenchido. Basta chamar:

```ts
await repository.save(newsItem);
```

Também há encapsulamento em `NewsIngestionPipeline`: suas dependências são `private readonly`, e o restante da aplicação conhece apenas o método público `execute`.

### Frase para a sala

> Encapsulamento é colocar a complexidade dentro da classe certa. O restante do sistema usa uma porta pequena e estável.

### Pergunta aos alunos

Se a regra de escolha de categoria mudar, quem deveria ser alterado: o controlador ou `NewsRepository`? A resposta esperada é o repositório, porque a regra está encapsulada nele.

## 2. Segregação de interfaces

### Ideia

O princípio da segregação de interfaces diz que uma classe não deve ser obrigada a depender de métodos que não usa. É melhor ter contratos pequenos e específicos do que uma interface enorme e genérica.

### Exemplo no projeto

O controlador depende de `INewsService`, e não da implementação concreta `NewsService`:

```ts
export interface INewsService {
    getNews(queryOptions: QueryOptions): Promise<News[]>;
    createNews(input: CreateNewsDto): Promise<News>;
    getNewsById(queryOptions: QueryOptions): Promise<News | null>;
    getRelatedNews(queryOptions: QueryOptions): Promise<News[] | null>;
    getNewsBySlug(queryOptions: QueryOptions): Promise<News | null>;
}

export class NewsController implements INewsController {
    public constructor(
        private readonly service: INewsService = new NewsService(),
    ) {}
}
```

O controlador recebe somente o contrato de que precisa. Em um teste, por exemplo, podemos fornecer um serviço falso com esses métodos, sem iniciar Prisma ou Redis:

```ts
const fakeNewsService: INewsService = {
    getNews: async () => [],
    createNews: async (input) => ({ ...input, id: 'teste' } as News),
    getNewsById: async () => null,
    getRelatedNews: async () => [],
    getNewsBySlug: async () => null,
};

const controller = new NewsController(fakeNewsService);
```

O mesmo raciocínio aparece nas interfaces `INewsController`, `ICategoryService` e `IUserService`: cada contrato representa uma responsabilidade específica.

### Frase para a sala

> Uma interface deve descrever o que o cliente precisa, não tudo o que o objeto sabe fazer.

### Pergunta aos alunos

Por que `NewsController` não deveria receber diretamente uma instância concreta de Prisma? Porque isso misturaria HTTP, regra de negócio e persistência, além de dificultar testes.

## 3. Command

### Ideia

O padrão Command transforma uma ação em um objeto. Em vez de o agendador conhecer todos os detalhes da ingestão, ele conhece um comando com uma operação simples: `execute()`.

### Implementação adicionada ao projeto

O contrato é pequeno:

```ts
export interface ICommand {
    execute(): Promise<void>;
}
```

O comando encapsula a ação de ingerir notícias e delega o trabalho ao pipeline:

```ts
export class IngestNewsCommand implements ICommand {
    public constructor(
        private readonly pipeline: NewsIngestionPipeline = new NewsIngestionPipeline(),
    ) {}

    public async execute(): Promise<void> {
        await this.pipeline.execute();
    }
}
```

O `App` agora agenda o comando:

```ts
private readonly ingestionCommand: IngestNewsCommand;

// no construtor
this.ingestionCommand = new IngestNewsCommand();

const run = async () => {
    try {
        await this.ingestionCommand.execute();
    } catch (error) {
        console.error('Erro no agendamento da ingestão:', error);
    }
};
```

O agendador não precisa saber se a execução usa API externa, validação, banco ou cache. Ele dispara uma ação. Amanhã poderíamos criar outros comandos, como `ClearNewsCacheCommand` ou `PublishNewsCommand`, mantendo o mesmo formato.

### Frase para a sala

> Command separa quem dispara uma ação de quem sabe executar essa ação.

### Benefícios

- facilita agendamento, fila e retry;
- permite registrar ou testar comandos isoladamente;
- reduz o conhecimento necessário no código que dispara a operação;
- cria um ponto natural para adicionar autorização, logs ou métricas.

## 4. Chain of Responsibility

### Ideia

Nesse padrão, uma solicitação percorre uma sequência de manipuladores. Cada manipulador decide se trata o pedido, se interrompe o fluxo ou se encaminha para o próximo.

A forma clássica pode ser representada assim:

```ts
interface NewsHandler {
    setNext(handler: NewsHandler): NewsHandler;
    handle(news: NormalizedNews): Promise<NormalizedNews | null>;
}

class ValidationHandler implements NewsHandler {
    private next?: NewsHandler;

    public setNext(handler: NewsHandler): NewsHandler {
        this.next = handler;
        return handler;
    }

    public async handle(news: NormalizedNews) {
        const valid = new NewsValidator().validate(news);
        if (!valid) return null; // interrompe a cadeia
        return this.next ? this.next.handle(valid) : valid;
    }
}

class DuplicateHandler implements NewsHandler {
    private next?: NewsHandler;

    public setNext(handler: NewsHandler): NewsHandler {
        this.next = handler;
        return handler;
    }

    public async handle(news: NormalizedNews) {
        const unique = await removeDuplicate(news);
        if (!unique) return null;
        return this.next ? this.next.handle(unique) : unique;
    }
}
```

No projeto atual, `NewsIngestionPipeline` já possui uma sequência de processamento muito próxima do raciocínio de uma cadeia:

```ts
const normalized = this.normalizer.normalize(raw);
const validated = this.validator.validate(normalized);

if (validated) {
    processedItems.push(validated);
}

const uniqueItems = await this.deduplicator.filterDuplicates(processedItems);
```

Essa sequência é uma **pipeline de processamento**, mas não é uma Chain of Responsibility clássica completa: os componentes não implementam um contrato comum `handle` nem possuem uma referência explícita ao próximo manipulador. A distinção é importante para não chamar qualquer sequência de métodos de Chain of Responsibility.

Para converter o fluxo para o padrão clássico, cada etapa poderia implementar `NewsHandler`, receber o próximo handler e encaminhar o item somente quando a regra permitisse. A validação poderia interromper um item inválido; a deduplicação poderia interromper um item repetido; e o último handler poderia persistir a notícia.

### Frase para a sala

> Na Chain of Responsibility, cada etapa recebe a chance de tratar a solicitação e decide se ela continua ou para.

### Comparação rápida

| Pipeline atual | Chain of Responsibility clássica |
| --- | --- |
| A pipeline coordena as etapas | Os próprios handlers conhecem o próximo |
| O fluxo é definido centralmente | Cada handler decide continuar ou interromper |
| Bom para processamento ordenado | Bom quando handlers podem variar ou ser combinados |
| `NewsValidator` retorna `null` ao falhar | Um handler pode encerrar a cadeia ao falhar |

## Como apresentar em sala

1. Comece pelo fluxo: uma notícia chega, é normalizada, validada, deduplicada e salva.
2. Mostre `NewsRepository.save` e pergunte quais detalhes um controlador realmente precisa conhecer. Use a resposta para introduzir encapsulamento.
3. Mostre `INewsService` no construtor de `NewsController`. Troque o serviço real por um fake e explique segregação de interfaces e testabilidade.
4. Mostre `ICommand` e `IngestNewsCommand`. Explique que o agendador dispara o comando sem conhecer a implementação da ingestão.
5. Volte ao pipeline e desenhe as etapas como uma cadeia. Depois explique a diferença entre pipeline e Chain of Responsibility clássica.
6. Feche pedindo aos alunos que criem um novo handler, por exemplo `ContentSafetyHandler` ou `SourceHandler`, e decidam em que ponto ele deve interromper o fluxo.

## Resumo final para os alunos

- **Encapsulamento:** esconde detalhes e protege regras dentro da classe responsável.
- **Segregação de interfaces:** mantém contratos pequenos, específicos e fáceis de substituir.
- **Command:** transforma uma ação em objeto e separa quem dispara de quem executa.
- **Chain of Responsibility:** distribui o tratamento entre handlers encadeados, permitindo continuar ou interromper o fluxo.

A arquitetura fica mais flexível quando cada classe tem uma responsabilidade clara e conversa com as outras por contratos pequenos.

## Validação

Para verificar a compilação do exemplo, execute na pasta `backend`:

```bash
npm install
npm run build
```
