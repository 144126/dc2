import type { SecretVal } from '$lib/server/qdrant';

declare global {
	namespace App {
		interface Platform {
			env: {
				QDRANT_URL: SecretVal;
				QDRANT_KEY: SecretVal;
				GOOGLE_ID: SecretVal;
				GOOGLE_SECRET: SecretVal;
				SECRET: SecretVal;
			};
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}
		interface Locals {
			user: { e: string } | null;
		}
	}
}

export {};
