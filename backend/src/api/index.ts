import { App } from '../app.js';
import { prisma, cache } from '../container.js';

const app = new App(prisma, cache);

export default app.instance;