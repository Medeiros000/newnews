import { z } from 'zod';

// Validação de Login
export const schemaLogin = z.object({
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Digite um e-mail válido'),
  senha: z.string().min(1, 'A senha é obrigatória'),
});

// Validação de Registro
export const schemaRegistro = z.object({
  nome: z
    .string()
    .min(1, 'O nome é obrigatório')
    .min(3, 'O nome deve ter no mínimo 3 letras'),
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório')
    .email('Digite um e-mail válido'),
  senha: z
    .string()
    .min(1, 'A senha é obrigatória')
    .min(8, 'A senha deve ter no mínimo 8 caracteres'),
});
