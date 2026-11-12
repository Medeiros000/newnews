import { Router, type Request, type Response } from 'express';

export class IndexRouter {
	public readonly router: Router;

	constructor() {
		this.router = Router();
		this.setupRoutes();
	}

	private setupRoutes(): void {
		this.router.get('/', this.getIndex);
	}

	private getIndex(_request: Request, response: Response): void {
		response.type('html').send(IndexRouter.htmlContent);
	}

	private static readonly htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
    <head>	
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New News API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 800px;
                margin: 50px auto;
                background: #fff;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #666;
            }
            ul {
                list-style-type: none;
                padding: 0;
            }
            li {
                color: #666;
                background: #eee;
                margin: 5px 0;
                padding: 10px;
                border-radius: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Bem-vindo à New News API</h1>
            <p>Esta é uma API simples para gerenciar:</p>
            <ul>
                <li>Usuários</li>
                <li>Autenticação</li>
                <li>Categorias</li>
                <li>Artigos de notícias</li>
            </ul>
        </div>
    </body>
</html>`;
}
