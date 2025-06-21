import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useResetPasswordMutation } from '../../store/api/authApi';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { resetPasswordSchema } from '../../validation';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const [resetPassword, { isLoading, isSuccess, isError, error }] = useResetPasswordMutation();

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      toast.error('Invalid reset token');
      navigate('/login');
    }
  }, [token, navigate]);

  const onSubmit = async (data) => {
    try {
      await resetPassword({ token, password: data.password }).unwrap();
      toast.success('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.data?.message || 'Password reset failed');
    }
  };

  if (!isTokenValid) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword.password ? 'text' : 'password'}
                placeholder="New Password"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, password: !prev.password }))
                }
                className="absolute inset-y-0 z-10 cursor-pointer right-0 px-2 flex items-center"
              >
                {showPassword.password ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showPassword.confirmPassword ? 'text' : 'password'}
                placeholder="Confirm New Password"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))
                }
                className="absolute inset-y-0 z-10 cursor-pointer right-0 px-2 flex items-center"
              >
                {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center bg-black cursor-pointer py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
          {isSuccess && <p className="text-green-600 text-center">Password reset! Redirecting...</p>}
          {isError && (
            <p className="text-red-500 text-center">
              {(() => {
                if (
                  error &&
                  typeof error === 'object' &&
                  'data' in error &&
                  (error as any).data &&
                  typeof (error as any).data === 'object' &&
                  'message' in (error as any).data
                ) {
                  return (error as any).data.message;
                }
                return 'Reset failed';
              })()}
            </p>
          )}
        </form>
        <div className="text-center">
          <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;