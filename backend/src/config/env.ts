import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().min(1).max(65535),
  CURRENTS_API_BASE_URL: z.string(),
  REDIS_URL: z.string(),
  CURRENTS_API_KEY: z.string().optional(),
  DEVELOPMENT_MODE: z.coerce.boolean().optional().default(false),
});

export const env = envSchema.parse(process.env);
