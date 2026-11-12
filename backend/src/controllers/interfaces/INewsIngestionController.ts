import type { Request, Response, NextFunction } from 'express';

export interface INewsIngestionController {
	triggerIngestion(request: Request, response: Response, next: NextFunction): Promise<void>;
}
