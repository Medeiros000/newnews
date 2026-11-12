import { App } from '../src/app.js';
import { prisma, cache } from '../src/container.js';

const app = new App(prisma, cache);

export default app.instance;