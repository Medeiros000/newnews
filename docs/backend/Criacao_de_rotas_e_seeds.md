# Guia de Criação de Rotas e Seeds (Backend POO)

Este guia orienta como criar, estruturar e registrar novas rotas na API do New News, além de documentar a execução e manutenção dos scripts de seed no banco de dados.

---

## 1. Arquitetura do Backend

O backend adota o paradigma de **Programação Orientada a Objetos (POO)** com camadas de responsabilidade bem definidas:

```text
src/
├── models/entities/    # Entidades de domínio (classes que representam os dados)
├── mappers/            # Conversores entre os tipos do Prisma e as entidades de domínio
├── services/           # Regra de negócio, cache e acesso a dados via PrismaService
│   └── interfaces/     # Contratos dos serviços (ex.: INewsService)
├── controllers/        # Orquestração da requisição, extração de parâmetros e respostas HTTP
│   └── interfaces/     # Contratos dos controllers (ex.: INewsController)
├── routes/             # Configuração e mapeamento dos endpoints no Express Router
├── app.ts              # Configuração global do Express e montagem dos routers
└── server.ts           # Inicialização e escuta da porta HTTP
```

---

## 2. Passo a Passo: Adicionando um Novo Recurso

Para exemplificar o fluxo, consideremos a adição de um novo recurso fictício `Tag`:

### Passo 2.1: Definir o Model no Prisma e Migrar
Adicione o model em `prisma/schema.prisma`:
```prisma
model Tag {
    id   String @id @default(uuid())
    name String @unique

    @@map("tags")
}
```
Gere o Prisma Client e crie a migration:
```bash
npm run db:migrate -- --name add_tags
npm run db:generate
```

---

### Passo 2.2: Criar a Entidade de Domínio e o Mapper
Crie `src/models/entities/Tag.ts`:
```ts
export class Tag {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}
```
Crie `src/mappers/TagMapper.ts`:
```ts
import { Tag } from '../models/entities/Tag.js';
import type { Tag as PrismaTag } from '../../generated/prisma/client.js';

export class TagMapper {
  static fromPrisma(prismaTag: PrismaTag): Tag {
    return new Tag(prismaTag.id, prismaTag.name);
  }
}
```

---

### Passo 2.3: Criar a Interface e o Service
Crie a interface `src/services/interfaces/ITagService.ts`:
```ts
import type { Tag } from '../../models/entities/Tag.js';

export interface ITagService {
  getAllTags(): Promise<Tag[]>;
}
```

Implemente o serviço em `src/services/TagService.ts`:
```ts
import { PrismaService } from './PrismaService.js';
import { TagMapper } from '../mappers/TagMapper.js';
import type { ITagService } from './interfaces/ITagService.js';
import type { Tag } from '../models/entities/Tag.js';

export class TagService implements ITagService {
  constructor(
    private readonly prisma: PrismaService = PrismaService.getInstance(),
  ) {}

  async getAllTags(): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
    return tags.map(TagMapper.fromPrisma);
  }
}
```

---

### Passo 2.4: Criar o Controller
Crie a interface `src/controllers/interfaces/ITagController.ts` e a classe `src/controllers/TagController.ts`:

```ts
import type { Request, Response, NextFunction } from 'express';
import { TagService } from '../services/TagService.js';
import type { ITagService } from '../services/interfaces/ITagService.js';

export class TagController {
  constructor(private readonly service: ITagService = new TagService()) {}

  async getAllTags(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const tags = await this.service.getAllTags();
      response.status(200).json({
        success: true,
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  }
}
```

---

### Passo 2.5: Criar a Rota e Registrar no `app.ts`
Crie `src/routes/TagRouter.ts`:
```ts
import { Router } from 'express';
import { TagController } from '../controllers/TagController.js';

export class TagRouter {
  public readonly router: Router;
  private readonly controller: TagController;

  constructor(controller: TagController = new TagController()) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.controller.getAllTags.bind(this.controller));
  }
}
```

No arquivo `src/app.ts`, instancie e registre o router:
```ts
import { TagRouter } from './routes/TagRouter.js';

// dentro do método setupRoutes():
const tagRouter = new TagRouter();
this.instance.use('/api/tags', tagRouter.router);
```

> **Atenção:** Como o backend utiliza ECMAScript Modules (`"type": "module"`), os imports locais TypeScript exigem a extensão `.js` (ex.: `./routes/TagRouter.js`).

---

## 3. Seeds do Banco de Dados

Os seeds servem para popular o banco de dados com dados essenciais ou de desenvolvimento de forma idempotente (podem rodar várias vezes sem duplicar registros).

### Como o Seed Está Configurado
No Prisma 7, o seed é definido em `prisma.config.ts`:
```ts
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
```

### Script de Seed Real (`backend/prisma/seed.ts`)
O seed oficial popula as categorias necessárias para o funcionamento da ingestão e dos filtros do frontend:

```ts
import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');

const adapter = new PrismaBetterSqlite3({ url: databaseUrl, timeout: 10_000 });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: 'general', label: 'Geral', icon: 'U+1F4F0' },
  { name: 'science_technology', label: 'Tecnologia', icon: 'U+1F4BB' },
  { name: 'sport', label: 'Esportes', icon: 'U+1F3C0' },
  // ...
];

try {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { label: category.label, icon: category.icon },
      create: category,
    });
  }
} finally {
  await prisma.$disconnect();
}
```

### Como Executar os Seeds
Após rodar as migrações:
```bash
npm run db:seed
```
Ou no fluxo completo inicial:
```bash
npm run db:migrate
npm run db:generate
npm run db:seed
```
