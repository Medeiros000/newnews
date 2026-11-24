# Pipeline de Ingestão e Atualização de Notícias

Este documento descreve a arquitetura e o funcionamento do pipeline de coleta automática de notícias do New News a partir da [Currents API](https://currentsapi.services/).

---

## 1. Visão Geral da Arquitetura

O processo de ingestão é executado por um serviço worker autônomo (`backend/src/worker.ts`), desacoplado do servidor HTTP da API.

- **Ciclo de Execução:** Disparado imediatamente na inicialização do worker e repetido periodicamente a cada 1 hora (`setInterval`).
- **Controle de Concorrência:** Possui lock de execução para evitar que um novo ciclo se inicie caso o anterior ainda esteja em andamento.
- **Tolerância a Falhas:** Falhas em notícias individuais são filtradas nas etapas de normalização e validação sem abortar o lote completo.

---

## 2. Etapas do Pipeline de Processamento

```text
Currents API
     ↓
CurrentsApiClient (Requisição HTTP com CURRENTS_API_KEY)
     ↓
NewsNormalizer (Mapeamento de campos e resolução de Category)
     ↓
NewsValidator (Validação de campos obrigatórios e URLs)
     ↓
NewsRepository (Deduplicação em lote por URL + persistência com createMany)
     ↓
Cache Invalidation (Limpeza das chaves 'news:list:*' no Redis)
```

| Componente | Responsabilidade Técnica |
| :--- | :--- |
| **`CurrentsApiClient`** | Autentica via token `CURRENTS_API_KEY`, consome o endpoint `v1/latest-news` e retorna o array de artigos brutos. |
| **`NewsNormalizer`** | Transforma o payload da Currents API no formato interno `NormalizedNews`. Resolve o nome da categoria comparando termos da API com os nomes de categorias cadastradas (ou atribui `general` por padrão). |
| **`NewsValidator`** | Descarta artigos que não possuam URL válida, título ou descrição, garantindo a integridade dos dados antes da gravação. |
| **`NewsRepository`** | Consulta no banco as URLs já existentes em uma única query em lote (`url in [...]`), filtra duplicatas na memória e insere apenas novos artigos com `prisma.news.createMany`. |
| **`Cache Invalidation`** | Quando novos artigos são inseridos (`savedCount > 0`), aciona o `CacheProvider` para deletar padrões de chave `news:list:*` no Redis, garantindo que o feed web exiba as novidades de imediato. |

---

## 3. Fluxograma do Processo

<img src="diagrams/news-collection-diagram.svg" height="700">
