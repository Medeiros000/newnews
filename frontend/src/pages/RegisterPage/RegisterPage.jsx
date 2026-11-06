import { useNavigate } from 'react-router-dom';
import { RegistrationForm } from '@/components/RegistrationForm';
import { userService } from '@/services';
import './RegisterPage.css';

/**
 * Full-screen registration page route component.
 * Manages the API submission logic and routing for the user registration flow.
 */
export const RegisterPage = () => {
  const navigate = useNavigate();

  /**
   * Submits user registration data to the backend API.
   * On success, redirects the user to the login page.
   *
   * @param {Object} formData - Validated user registration details
   */
  const handleRegister = async (formData) => {
    try {
      await userService.register(formData);
      navigate('/login');
    } catch (err) {
      throw new Error(
        err?.response?.data?.message || err.message || 'Erro ao criar conta.',
      );
    }
  };

  return (
    <div className="register-page">
      {/* Main Registration Form Component */}
      <RegistrationForm onSubmit={handleRegister} />
    </div>
  );
};
