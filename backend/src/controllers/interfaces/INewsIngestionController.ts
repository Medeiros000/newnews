import type { NextFunction, Request, Response } from 'express';

export interface INewsIngestionController {
	execute(request: Request, response: Response, next: NextFunction): Promise<void>;
}
