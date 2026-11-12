import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { NewsIngestionWorker } from '../../src/workers/NewsIngestionWorker.js';

describe('NewsIngestionWorker', () => {
	afterEach(() => {
		jest.useRealTimers();
	});

	it('executa imediatamente e ignora ciclos enquanto a ingestão está em andamento', async () => {
		jest.useFakeTimers();

		let resolveExecution!: () => void;
		const execute = jest.fn(
			() =>
				new Promise<void>((resolve) => {
					resolveExecution = resolve;
				}),
		);
		const worker = new NewsIngestionWorker({ execute }, 1_000);

		worker.start();
		expect(execute).toHaveBeenCalledTimes(1);

		jest.advanceTimersByTime(1_000);
		expect(execute).toHaveBeenCalledTimes(1);

		resolveExecution();
		await Promise.resolve();
		jest.advanceTimersByTime(1_000);
		expect(execute).toHaveBeenCalledTimes(2);

		worker.stop();
	});
});
