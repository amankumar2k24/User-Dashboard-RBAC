import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVerifyEmailMutation } from '../../store/api/authApi';
import { toast } from 'react-hot-toast';
import { Box, Typography, CircularProgress } from '@mui/material';

const VerifyEmail = () => {
  const { token } = useParams();
  // console.log("token==>", token);
  const navigate = useNavigate();
  const [verifyEmail, { isLoading, isSuccess, isError, error }] = useVerifyEmailMutation();

  useEffect(() => {
    const verify = async () => {
      if (!token) return;

      try {
        const response = await verifyEmail(token).unwrap();
        toast.success(response.message);
      } catch (err) {
        toast.error(err?.data?.message || 'Email verification failed');
      } finally {
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'grey.100' }}>
      <Box sx={{ textAlign: 'center' }}>
        {isLoading && <><CircularProgress /><Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>Verifying email...</Typography></>}
        {isSuccess && <Typography variant="h6" color="success.main">Email verified! Redirecting...</Typography>}
        {isError && <Typography variant="h6" color="error">
          {('data' in error && (error as any).data?.message) || 'Verification failed'}
        </Typography>}
      </Box>
    </Box>
  );
};

export default VerifyEmail;