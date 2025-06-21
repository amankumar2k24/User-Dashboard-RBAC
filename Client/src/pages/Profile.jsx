import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation } from '../store/api/userApi';
import { useGetRolesQuery } from '../store/api/authApi';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Box, Typography, Avatar, TextField, Button, IconButton, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { hasPermission } from '../utils/permissions';

const Profile = () => {
  const { user, accessToken } = useSelector((state) => state.auth);
  const isAdmin = user?.role?.name === 'admin';
  const { data: profile, isLoading: profileLoading, error: profileError, isError } = useGetProfileQuery(undefined, {
    skip: !accessToken,
  });

  // console.log("profile==>", profile)
  const [updateProfile, { isLoading: updateLoading }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: passwordLoading }] = useChangePasswordMutation();
  const { data: rolesResponse, isLoading: rolesLoading, error: rolesError } = useGetRolesQuery(undefined, {
    skip: !accessToken || !['admin', 'user'].includes(user?.role?.name),
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
  });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    setValue,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      profileImage: null,
    },
  });

  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  useEffect(() => {
    if (profile) {
      setValue('firstName', profile.user?.firstName || '');
      setValue('lastName', profile.user?.lastName || '');
      setPreviewImage(profile.profileImage || profile.user?.profileImage || null);
    }
  }, [profile, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setValue('profileImage', file);
    }
  };

  const onProfileSubmit = async (data) => {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    if (data.profileImage) {
      formData.append('profileImage', data.profileImage);
    }

    try {
      await updateProfile(formData).unwrap();
      toast.success('Profile updated successfully!');
      resetProfileForm({ firstName: data.firstName, lastName: data.lastName });
    } catch (error) {
      toast.error(error.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword(data).unwrap();
      toast.success('Password changed successfully!');
      resetPasswordForm();
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to change password');
    }
  };

  const getErrorMessage = (error) => {
    if (isError && profileError) {
      switch (profileError.status) {
        case 401:
          return 'Please log in again';
        case 403:
          return 'You do not have permission to view this resource';
        case 404:
          return 'Resource not found. Please check the server configuration.';
        case 500:
          return 'Server error, please try again later';
        case 'FETCH_ERROR':
          return 'Network error: Unable to resolve the server. Check your internet connection or API endpoint.';
        default:
          return 'An error occurred';
      }
    }
    return '';
  };

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4, px: { xs: 2, sm: 3, md: 4 } }} className="w-full">
      {profileLoading && (
        <Box sx={{ textAlign: 'center', bgcolor: 'white', p: 3, borderRadius: 2, boxShadow: 1 }}>
          <CircularProgress />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Loading profile...
          </Typography>
        </Box>
      )}
      {isError && profileError && (
        <Box sx={{ textAlign: 'center', bgcolor: '#fef2f2', p: 3, borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="body1" color="error">
            {getErrorMessage(profileError)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please check your network or contact support if the issue persists.
          </Typography>
          <Link to="/login" style={{ display: 'inline-block', mt: 2, color: '#1976d2', textDecoration: 'underline' }}>
            Go to Login
          </Link>
        </Box>
      )}
      {profile && !profileLoading && !isError && (
        <>
          <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Profile
          </Typography>

          {/* Profile Display */}
          <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 2, p: 3, mb: 4, maxWidth: '900px', mx: 'auto' }}>
            <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary', borderBottom: 1, borderColor: 'grey.300', pb: 2 }}>
              Your Profile
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  alt="Profile"
                  src={profile?.user?.profileImage
                    ? `http://localhost:3333/uploads/profiles/${profile.user.profileImage}`
                    : 'https://via.placeholder.com/150'
                  }
                  sx={{ width: 128, height: 128, border: '4px solid #e0f7fa' }}
                />
                <Box sx={{ position: 'absolute', bottom: -8, right: -8, bgcolor: '#1976d2', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" color="white">✓</Typography>
                </Box>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body1" sx={{ color: 'text.primary' }}><strong>Name:</strong> {profile.user?.firstName} {profile.user?.lastName}</Typography>
                <Typography variant="body1" sx={{ color: 'text.primary' }}><strong>Email:</strong> {profile.user?.email}</Typography>
                <Typography variant="body1" sx={{ color: 'text.primary' }}><strong>Role:</strong> <span className='capitalize'>{profile.user?.role?.name || 'N/A'}</span></Typography>
              </Box>
            </Box>
          </Box>

          {/* Profile Edit Form */}
          {hasPermission(user, 'profile', 'update') && (
            <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 2, p: 3, mb: 4, maxWidth: '900px', mx: 'auto' }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary', borderBottom: 1, borderColor: 'grey.300', pb: 2 }}>
                Edit Profile
              </Typography>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TextField
                  label="First Name"
                  {...profileRegister('firstName', {
                    required: 'First name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                  })}
                  error={!!profileErrors.firstName}
                  helperText={profileErrors.firstName?.message}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  label="Last Name"
                  {...profileRegister('lastName', {
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                  })}
                  error={!!profileErrors.lastName}
                  helperText={profileErrors.lastName?.message}
                  variant="outlined"
                  fullWidth
                />
                <Box>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ mb: 2, bgcolor: '#1e2939', '&:hover': { bgcolor: '#1e2919' } }}
                  >
                    Upload Profile Image
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      {...profileRegister('profileImage')}
                      onChange={handleImageChange}
                    />
                  </Button>
                  {previewImage && (
                    <Avatar
                      alt="Preview"
                      src={previewImage}
                      sx={{ width: 128, height: 128, mt: 2 }}
                    />
                  )}
                </Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updateLoading}
                  sx={{ mt: 2, bgcolor: '#1e2939', '&:hover': { bgcolor: '#1e2919' } }}
                >
                  {updateLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </Box>
          )}

          {/* Password Change Form */}
          {hasPermission(user, 'password', 'update') && (
            <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 2, p: 3, mb: 4, maxWidth: '900px', mx: 'auto' }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary', borderBottom: 1, borderColor: 'grey.300', pb: 2 }}>
                Change Password
              </Typography>
              <Box>
                Click here for:-
                <Button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  sx={{ color: '#1976d2', '&:hover': { color: '#1565c0' } }}
                >
                  {showPasswordForm ? 'Hide Password Form' : 'Change Password'}
                </Button>
              </Box>
              {showPasswordForm && (
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16, mt: 2 }}>
                  <TextField
                    label="Current Password"
                    type={showPassword.currentPassword ? 'text' : 'password'}
                    {...passwordRegister('currentPassword', { required: 'Current password is required' })}
                    error={!!passwordErrors.currentPassword}
                    helperText={passwordErrors.currentPassword?.message}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword((prev) => ({ ...prev, currentPassword: !prev.currentPassword }))}
                          edge="end"
                        >
                          {showPassword.currentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />
                  <TextField
                    label="New Password"
                    type={showPassword.newPassword ? 'text' : 'password'}
                    {...passwordRegister('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 8, message: 'Minimum 8 characters' },
                      pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase, and number' },
                    })}
                    error={!!passwordErrors.newPassword}
                    helperText={passwordErrors.newPassword?.message}
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
                          edge="end"
                        >
                          {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={passwordLoading}
                    sx={{ mt: 2, bgcolor: '#1e2939', '&:hover': { bgcolor: '#1e2919' } }}
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </form>
              )}
            </Box>
          )}

          {/* Admin User Management Link */}
          {isAdmin && hasPermission(user, 'users', 'read') && (
            <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 2, p: 3, maxWidth: '900px', mx: 'auto' }}>
              <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'medium', color: 'text.primary', borderBottom: 1, borderColor: 'grey.300', pb: 2 }}>
                Admin: User Management
              </Typography>
              <Link to="/users" style={{ textDecoration: 'none' }}>
                <Button variant="contained" sx={{ bgcolor: '#1e2939', '&:hover': { bgcolor: '#1e2919' } }}>
                  Manage Users
                </Button>
              </Link>
            </Box>
          )}
        </>
      )
      }
      {
        (rolesLoading || rolesError) && (
          <Box sx={{ textAlign: 'center', color: '#f59e0b', p: 2 }}>
            {rolesLoading && <Typography variant="body2">Loading roles...</Typography>}
            {rolesError && <Typography variant="body2">Error loading roles: {getErrorMessage(rolesError)}</Typography>}
          </Box>
        )
      }
    </Box >
  );
};

export default Profile;