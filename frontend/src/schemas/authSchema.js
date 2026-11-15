import { z } from 'zod';

/**
 * Zod validation schema for user login.
 */
export const schemaLogin = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Digite um e-mail válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

/**
 * Zod validation schema for user registration.
 */
export const schemaRegistro = z.object({
  name: z
    .string()
    .min(1, 'O nome é obrigatório')
    .min(3, 'O nome deve ter no mínimo 3 letras'),
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Digite um e-mail válido'),
  password: z
    .string()
    .min(1, 'A senha é obrigatória')
    .min(8, 'A senha deve ter no mínimo 8 caracteres'),
});
