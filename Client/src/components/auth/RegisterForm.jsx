import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from "react-router-dom"
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { useRegisterMutation } from '../../store/api/authApi';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Upload, X } from 'lucide-react';
import { registerSchema } from '../../validation';

const RegisterForm = () => {
  const [registerUser, { isLoading }] = useRegisterMutation(); 
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append('firstName', values.firstName);
      formData.append('lastName', values.lastName);
      formData.append('email', values.email);
      formData.append('password', values.password);
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await registerUser(formData).unwrap();
      toast.success('Registration successful! Please check your email for verification.');
      navigate('/login')
      reset();
      removeImage();
    } catch (error) {
      toast.error(error.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary-500"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-black/60 border-4 border-dashed">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                )}
              </div>
              <label className="mt-2 cursor-pointer bg-primary-500 text-white bg-black px-4 py-2 rounded-md hover:bg-primary-600 transition-colors">
                Choose Profile Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <input
                  {...register('firstName')}
                  type="text"
                  placeholder="First Name"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-600 sm:text-sm"
                />
                {errors.firstName && (
                  <div className="mt-1 text-sm text-red-500">{errors.firstName.message}</div>
                )}
              </div>
              <div>
                <input
                  {...register('lastName')}
                  type="text"
                  placeholder="Last Name"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-600 sm:text-sm"
                />
                {errors.lastName && (
                  <div className="mt-1 text-sm text-red-500">{errors.lastName.message}</div>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Email address"
                className="appearance-none rounded-md relative block w-full px-4 py-2 text-sm text-gray-900 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-600 sm:text-sm"
              />
              {errors.email && (
                <div className="mt-1 text-sm text-red-500">{errors.email.message}</div>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="appearance-none rounded-md relative block w-full px-4 py-2 text-sm text-gray-600 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-600 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-2 z-10 cursor-pointer flex items-center"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <div className="mt-1 text-sm text-red-500">{errors.password.message}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                {...register('confirmPassword')}
                type="password"
                placeholder="Confirm Password"
                className="appearance-none rounded-md relative block w-full px-4 py-2 text-sm text-gray-600 border border-gray-200 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-600 sm:text-sm"
              />
              {errors.confirmPassword && (
                <div className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</div>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="group relative w-full flex bg-black hover:bg-black/70 cursor-pointer justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-black hover:text-black/70">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;