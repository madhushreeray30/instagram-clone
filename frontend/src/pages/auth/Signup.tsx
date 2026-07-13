import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { loginSuccess, setLoading } from '../../store/authSlice';
import { authApi } from '../../services/api';

interface SignupFormData {
  username: string;
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormData>();
  const [apiError, setApiError] = useState<string | null>(null);
  const password = watch('password');

  const onSubmit = async (data: SignupFormData) => {
    try {
      dispatch(setLoading(true));
      const { confirmPassword, ...registrationData } = data;
      const response: any = await authApi.register(registrationData);

      dispatch(loginSuccess({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      }));

      navigate('/auth/verify-email');
    } catch (error: any) {
      const message = error.error?.message || 'Signup failed';
      setApiError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-300 rounded-lg p-8 mb-4">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Instagram</h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Sign up to see photos and videos from your friends.
          </p>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
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

            <div className="mb-3">
              <input
                {...register('fullName', { required: 'Full name is required' })}
                type="text"
                placeholder="Full Name"
                className="input-field"
              />
              {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
            </div>

            <div className="mb-3">
              <input
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                  maxLength: { value: 30, message: 'Maximum 30 characters' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only alphanumeric and underscore' },
                })}
                type="text"
                placeholder="Username"
                className="input-field"
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
            </div>

            <div className="mb-3">
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
                type="password"
                placeholder="Password"
                className="input-field"
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="mb-4">
              <input
                {...register('confirmPassword', {
                  required: 'Confirm password is required',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                type="password"
                placeholder="Confirm Password"
                className="input-field"
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full mb-4">
              Sign up
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-4 text-center">
          <p className="text-sm">
            Have an account?{' '}
            <Link to="/auth/login" className="text-primary font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
