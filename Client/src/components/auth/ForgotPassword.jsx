import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useForgotPasswordMutation } from '../../store/api/authApi';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordSchema } from '../../validation';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const [forgotPassword, { isLoading, isSuccess, isError, error }] = useForgotPasswordMutation();

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email).unwrap();
      toast.success('Password reset email sent! Check your inbox.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Forgot Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive a password reset link.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Email address"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border bg-black cursor-pointer border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
          {isSuccess && (
            <p className="text-green-600 text-center">Email sent! Redirecting to login...</p>
          )}
          {isError && (
            <p className="text-red-500 text-center">
              {error?.data?.message || 'Failed to send reset email'}
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

export default ForgotPassword;