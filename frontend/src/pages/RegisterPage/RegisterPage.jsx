import { useNavigate } from 'react-router-dom';
import { RegistrationForm } from '@/components/RegistrationForm';
import { userService } from '@/services';
import { useUserStore, useToastStore } from '@/stores';
import './RegisterPage.css';

/**
 * Full-screen registration page route component.
 * Manages the API submission logic and routing for the user registration flow.
 */
export const RegisterPage = () => {
  const navigate = useNavigate();
  const login = useUserStore((state) => state.login);
  const showToast = useToastStore((state) => state.showToastNotification);

  const handleRegister = async (formData) => {
    try {
      const res = await userService.register(formData);
      if (res?.data) {
        login(res.data);
        showToast('Conta criada com sucesso! Bem-vindo ao NewsHub.', 'success');
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Erro ao criar conta.';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  return (
    <div className="register-page">
      {/* Main Registration Form Component */}
      <RegistrationForm onSubmit={handleRegister} />
    </div>
  );
};
