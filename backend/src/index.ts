import { App } from './app.js';
import { prisma, cache } from './container.js';
import type { Request, Response } from 'express';

const app = new App(prisma, cache);

export default function handler(request: Request, response: Response): void {
	app.instance(request, response);
}