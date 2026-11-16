import { describe, it, expect } from 'vitest';
import { schemaLogin, schemaRegistro } from '@/components/Validation/Validation.jsx';

describe('Validation schemas', () => {
  describe('schemaLogin', () => {
    it('passes with valid email and non-empty password', () => {
      const result = schemaLogin.safeParse({
        email: 'usuario@example.com',
        password: 'minhasenhasecreta',
      });
      expect(result.success).toBe(true);
    });

    it('fails when email is empty', () => {
      const result = schemaLogin.safeParse({
        email: '',
        password: 'minhasenhasecreta',
      });
      expect(result.success).toBe(false);
      const errors = result.error.format();
      expect(errors.email?._errors).toContain('O e-mail é obrigatório');
    });

    it('fails when email is invalid format', () => {
      const result = schemaLogin.safeParse({
        email: 'email-invalido',
        password: 'minhasenhasecreta',
      });
      expect(result.success).toBe(false);
      const errors = result.error.format();
      expect(errors.email?._errors).toContain('Digite um e-mail válido');
    });

    it('fails when password is empty', () => {
      const result = schemaLogin.safeParse({
        email: 'usuario@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      const errors = result.error.format();
      expect(errors.password?._errors).toContain('A senha é obrigatória');
    });
  });

  describe('schemaRegistro', () => {
    it('passes with valid name, email, and password meeting criteria', () => {
      const result = schemaRegistro.safeParse({
        name: 'Ana Silva',
        email: 'ana@example.com',
        password: 'senhaSegura123',
      });
      expect(result.success).toBe(true);
    });

    it('fails when name is shorter than 3 characters', () => {
      const result = schemaRegistro.safeParse({
        name: 'Zé',
        email: 'ze@example.com',
        password: 'senhaSegura123',
      });
      expect(result.success).toBe(false);
      const errors = result.error.format();
      expect(errors.name?._errors).toContain('O nome deve ter no mínimo 3 letras');
    });

    it('fails when name is empty', () => {
      const result = schemaRegistro.safeParse({
        name: '',
        email: 'ze@example.com',
        password: 'senhaSegura123',
      });
      expect(result.success).toBe(false);
      const errors = result.error.format();
      expect(errors.name?._errors).toContain('O nome é obrigatório');
    });

    it('fails when email is invalid format', () => {
      const result = schemaRegistro.safeParse({
        name: 'Carlos Santos',
        email: 'carlos-sem-arroba',
        password: 'senhaSegura123',
      });
      expect(result.success).toBe(false);
      const errors = result.error.format();
      expect(errors.email?._errors).toContain('Digite um e-mail válido');
    });

    it('fails when password is shorter than 8 characters', () => {
      const result = schemaRegistro.safeParse({
        name: 'Carlos Santos',
        email: 'carlos@example.com',
        password: '1234567',
      });
      expect(result.success).toBe(false);
      const errors = result.error.format();
      expect(errors.password?._errors).toContain('A senha deve ter no mínimo 8 caracteres');
    });
  });
});
