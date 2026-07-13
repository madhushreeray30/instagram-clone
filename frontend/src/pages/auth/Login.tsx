import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { loginSuccess, loginFailure, setLoading } from '../../store/authSlice';
import { authApi } from '../../services/api';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [apiError, setApiError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    try {
      dispatch(setLoading(true));
      const response: any = await authApi.login(data);

      dispatch(loginSuccess({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }));

      navigate('/');
    } catch (error: any) {
      const message = error.error?.message || 'Login failed';
      dispatch(loginFailure(message));
      setApiError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-300 rounded-lg p-8 mb-4">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Instagram</h1>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email',
                  },
                })}
                type="email"
                placeholder="Email"
                className="input-field"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            <div className="mb-4">
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                placeholder="Password"
                className="input-field"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full mb-4">
              Log in
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
          <p className="text-sm">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-primary font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
