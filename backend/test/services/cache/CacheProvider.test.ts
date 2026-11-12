import { createCacheProvider } from '../../../src/services/cache/createCacheProvider.js';
import { NullCacheProvider } from '../../../src/services/cache/NullCacheProvider.js';

describe('createCacheProvider', () => {
	it('seleciona NullCacheProvider sem instanciar Redis quando desabilitado', async () => {
		const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
		try {
			const provider = createCacheProvider({
				USE_REDIS: false,
				REDIS_URL: 'redis://invalid-host:6379',
			});

			expect(provider).toBeInstanceOf(NullCacheProvider);
			await expect(provider.get('key')).resolves.toBeNull();
			await expect(provider.set('key', { value: true })).resolves.toBeUndefined();
			await expect(provider.del('key')).resolves.toBeUndefined();
			await expect(provider.delByPattern('key:*')).resolves.toBeUndefined();
		} finally {
			consoleWarn.mockRestore();
		}
	});
});
