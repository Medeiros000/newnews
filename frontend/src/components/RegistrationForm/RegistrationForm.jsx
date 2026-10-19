import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { schemaRegistro } from '../Validation/'; // Schema do Zod
import {
  IconUser,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconArrowLeft,
} from '@tabler/icons-react';
import './RegistrationForm.css';

/**
 * Registration form component with built-in client-side validation using Zod.
 * Handles user input for full name, email, and password, displaying inline errors.
 *
 * @param {Object} props
 * @param {Function} props.onSubmit triggered when the form is successfully validated and submitted
 */
export function RegistrationForm({ onSubmit }) {
  // Form state management
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // React Hook Form integration with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schemaRegistro),
    mode: 'onChange', // Valida em tempo real para habilitar/desabilitar o botão
  });

  /**
   * Handles the form submission process, including validation and loading state
   */
  const handleFormSubmit = async (data) => {
    setSubmitting(true);

    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registration-container">
      {/* Decorative Globe Background Animations */}
      <div className="globo globo-one">
        <div className="globo-line line-one" />
        <div className="globo-line line-two" />
        <div className="globo-horizontal horizontal-one" />
        <div className="globo-horizontal horizontal-two" />
      </div>

      <div className="globo globo-two">
        <div className="globo-line line-one" />
        <div className="globo-horizontal horizontal-one" />
      </div>

      <div className="registration-content">
        {/* Brand Logo Section */}
        <div className="news-logo">
          <div className="logo-box">NN</div>

          <div>
            <h1>NEW NEWS</h1>
            <span>SEU PORTAL DE NOTÍCIAS</span>
          </div>
        </div>

        <form
          className="registration-form"
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <a href="/" className="registration-back-home">
            <IconArrowLeft size={20} />
            <span>Voltar para a home</span>
          </a>

          <h2>Criar conta</h2>

          <p className="form-description">
            Preencha os dados abaixo para começar
            <br />a usar o New News.
          </p>

          {/* Full Name Input Field */}
          <div className="form-group">
            <label htmlFor="fullName">
              <IconUser size={21} />
              Nome completo
            </label>

            <div className="input-container">
              <input
                type="text"
                id="fullName"
                placeholder="João Maria da Silva"
                {...register('nome')}
              />
            </div>

            {errors.nome && (
              <span className="error">{errors.nome.message}</span>
            )}
          </div>

          {/* Email Input Field */}
          <div className="form-group">
            <label htmlFor="email">
              <IconMail size={21} />
              E-mail
            </label>

            <div className="input-container">
              <input
                type="email"
                id="email"
                placeholder="joaomaria@exemplo.com"
                {...register('email')}
              />
            </div>

            {errors.email && (
              <span className="error">{errors.email.message}</span>
            )}
          </div>

          {/* Password Input Field with Visibility Toggle */}
          <div className="form-group">
            <label htmlFor="password">
              <IconLock size={21} />
              Senha
            </label>

            <div className="input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="xxxxxxxx"
                {...register('senha')}
              />

              <button
                type="button"
                className="password-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <IconEyeOff size={21} />
                ) : (
                  <IconEye size={21} />
                )}
              </button>
            </div>

            {errors.senha && (
              <span className="error">{errors.senha.message}</span>
            )}
          </div>

          {/* Submit Button (Desabilitado até o formulário ser válido ou durante envio) */}
          <button
            type="submit"
            className="register-button"
            disabled={!isValid || submitting}
          >
            <span>{submitting ? 'Criando...' : 'Criar conta'}</span>

            {!submitting && <IconArrowRight size={23} />}
          </button>

          {/* Alternative Actions (Login) */}
          <div className="divider">
            <span />
            <p>ou</p>
            <span />
          </div>

          <p className="login-link">
            Já tem uma conta? <a href="/login">Entrar</a>
          </p>
        </form>
      </div>
    </div>
  );
}
