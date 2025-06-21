import React, { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import Layout from '../layout/Layout';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const UsersList = lazy(() => import('../pages/UserList'));
const UserDetails = lazy(() => import('../pages/UserDetails'));

const PrivateRoutes = () => {
  const { accessToken, user } = useSelector((state) => state.auth)

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = user?.role?.name === 'admin';

  return (
    <Layout>
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        }
      >
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/users"
            element={isAdmin ? <UsersList /> : <Navigate to="/unauthorized" replace />}
          />
          <Route
            path="/users/:id"
            element={isAdmin ? <UserDetails /> : <Navigate to="/unauthorized" replace />}
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default PrivateRoutes;