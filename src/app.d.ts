import type { SecretVal } from '$lib/server/qdrant';

declare global {
	namespace App {
		interface Platform {
			env: { QDRANT_URL: SecretVal; QDRANT_KEY: SecretVal };
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}
	}
}

export {};
