import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	PORT: z.coerce.number().int().min(1).max(65535).default(3000),
	REDIS_URL: z.string().default("redis://localhost:6379"),
	CURRENTS_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
