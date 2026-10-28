# Sistema de Logs no New News (Backend)

Este documento descreve a arquitetura e o funcionamento do sistema centralizado de logs do backend, incluindo o envio e a persistência em tabela dedicada no banco de dados PostgreSQL.

---

## 📌 1. Visão Geral

O backend possui uma classe dedicada de log: [`Logger`](file:///c:/newnews/backend/src/utils/Logger.ts).

Além de formatar e exibir as mensagens no console do terminal com timestamps e identificadores de módulo, o `Logger` persiste automaticamente cada ocorrência diretamente na tabela **`logs`** do banco de dados (gerenciada via Prisma ORM).

### Características principais:
- **Exclusividade do Backend:** Apenas eventos ocorridos no backend (serviços, handlers, rotas, ciclo de vida da API) são direcionados para a tabela.
- **Não bloqueante:** A persistência no banco é assíncrona; falhas transitórias de conexão com o banco não travam as requisições HTTP nem interrompem o fluxo da aplicação.
- **Rastreabilidade completa:** Cada registro armazena carimbo de data/hora, nível de severidade, módulo/contexto de origem, mensagem e metadados/stack traces.

---

## 🗄️ 2. Estrutura da Tabela `logs`

A tabela foi adicionada ao [`schema.prisma`](file:///c:/newnews/backend/prisma/schema.prisma) e versionada via migration:

```prisma
model Log {
    id         String   @id @default(uuid())
    level      String
    context    String
    message    String
    metadata   String?
    created_at DateTime @default(now())

    @@index([level])
    @@index([context])
    @@index([created_at])
    @@map("logs")
}
```

### Colunas da tabela:
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `UUID / TEXT` | Identificador único do log (chave primária). |
| `level` | `TEXT` | Nível do log: `info`, `warn`, `error` ou `debug`. Indexado. |
| `context` | `TEXT` | Nome do componente emissor (ex: `FetchNewsHandler`, `App`, `RedisService`). Indexado. |
| `message` | `TEXT` | Descrição textual do evento ou operação. |
| `metadata` | `TEXT` (opcional) | JSON serializado com parâmetros extras, dados de requisição ou detalhes de stack trace (`Error`). |
| `created_at` | `TIMESTAMP` | Data e hora exata do registro (`default(now())`). Indexado. |

---

## 🚀 3. Migration e Geração do Prisma Client

1. **Arquivo da Migration:**  
   Localizado em [`prisma/migrations/20261028131759_create_logs_table/migration.sql`](file:///c:/newnews/backend/prisma/migrations/20261028131759_create_logs_table/migration.sql).
2. **Geração do Client:**  
   O Prisma Client foi atualizado (`npx prisma generate`), disponibilizando a tipagem e operações `prisma.log.*`.
3. **Execução no ambiente de banco ativo:**  
   Com os contêineres Docker do banco rodando (`docker compose up -d`), a migration é aplicada automaticamente ou via comando:
   ```bash
   npm run db:migrate
   # ou
   npx prisma migrate deploy
   ```

---

## 💻 4. Como os Logs são Gerados e Persistidos

Ao instanciar e invocar o `Logger`, o registro é formatado para o console e enviado para a tabela `logs`:

```typescript
import { Logger } from '../utils/Logger.js';

export class ExemploService {
    private readonly logger = new Logger('ExemploService');

    public processar(): void {
        // Envia log INFO com contexto 'ExemploService'
        this.logger.info('Iniciando processamento.');

        try {
            // ... lógica
        } catch (error) {
            // Envia log ERROR com a mensagem e o objeto de erro/stack serializado em 'metadata'
            this.logger.error('Falha no processamento:', error);
        }
    }
}
```

---

## 📍 5. Contextos Monitorados no Backend

Os seguintes módulos registram suas operações na tabela `logs`:

- **`App`**: Inicialização da API, middlewares e tratamento global de erros Express.
- **`Server`**: Abertura da porta HTTP e desligamento ordenado (`SIGINT` / `SIGTERM`).
- **`NewsIngestionPipeline`**: Início, término e métricas do pipeline de notícias.
- **`FetchNewsHandler`**: Chamadas à Currents API externa e volumes recebidos.
- **`NormalizationHandler`**: Sanitização e falhas de formatação de notícias.
- **`ValidationHandler`**: Validações de schema Zod.
- **`DeduplicationHandler`**: Notícias descartadas por duplicidade.
- **`NewsInsertionHandler`**: Confirmação de IDs inseridos no PostgreSQL.
- **`CacheEvictionHandler`**: Invalidação do cache Redis (`news:list:*`).
- **`CurrentsApiClient`**: Respostas de rede, erros 401/429 e timeouts.
- **`NewsRepository`**: Associação semântica de categorias.
- **`RedisService`**: Status de conexão e falhas de leitura/escrita no cache.
