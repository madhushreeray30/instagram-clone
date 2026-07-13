import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { authApi } from '../../services/api';
export function VerifyEmailPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [apiError, setApiError] = useState(null);
    const [success, setSuccess] = useState(false);
    if (!user) {
        navigate('/auth/signup');
        return null;
    }
    const onSubmit = async (data) => {
        try {
            await authApi.verifyEmail({ email: user.email, otp: data.otp });
            setSuccess(true);
            setTimeout(() => navigate('/'), 2000);
        }
        catch (error) {
            const message = error.error?.message || 'Verification failed';
            setApiError(message);
        }
    };
    return (<div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-300 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Verify Email</h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            We sent a verification code to {user.email}
          </p>

          {success && (<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              Email verified! Redirecting...
            </div>)}

          {apiError && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {apiError}
            </div>)}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <input {...register('otp', {
        required: 'OTP is required',
        minLength: { value: 6, message: '6 digit code required' },
        maxLength: { value: 6, message: '6 digit code required' },
    })} type="text" placeholder="000000" maxLength={6} className="input-field text-center text-2xl tracking-widest"/>
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full">
              Verify Email
            </button>
          </form>
        </div>
      </div>
    </div>);
}
