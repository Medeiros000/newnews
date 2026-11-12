import { describe, expect, it, jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { NewsIngestionController } from '../../src/controllers/NewsIngestionController.js';
import { NewsIngestionWorker } from '../../src/workers/NewsIngestionWorker.js';

describe('NewsIngestionController', () => {
	it('deve chamar runOnce no worker e responder 200', async () => {
		const mockWorker = {
			runOnce: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
		} as unknown as NewsIngestionWorker;

		const controller = new NewsIngestionController(mockWorker);
		const req = {} as Request;
		const jsonMock = jest.fn();
		const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
		const res = { status: statusMock } as unknown as Response;
		const next = jest.fn() as NextFunction;

		await controller.triggerIngestion(req, res, next);

		expect(mockWorker.runOnce).toHaveBeenCalledTimes(1);
		expect(statusMock).toHaveBeenCalledWith(200);
		expect(jsonMock).toHaveBeenCalledWith(
			expect.objectContaining({
				success: true,
				message: 'Ingestão de notícias executada com sucesso.',
			}),
		);
		expect(next).not.toHaveBeenCalled();
	});

	it('deve encaminhar erro para next caso runOnce falhe', async () => {
		const error = new Error('Falha na API externa');
		const mockWorker = {
			runOnce: jest.fn<() => Promise<void>>().mockRejectedValue(error),
		} as unknown as NewsIngestionWorker;

		const controller = new NewsIngestionController(mockWorker);
		const req = {} as Request;
		const res = {} as Response;
		const next = jest.fn() as NextFunction;

		await controller.triggerIngestion(req, res, next);

		expect(next).toHaveBeenCalledWith(error);
	});
});
