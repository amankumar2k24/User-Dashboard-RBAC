import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import './index.css';

const LoginForm = lazy(() => import('./components/auth/LoginForm'));
const RegisterForm = lazy(() => import('./components/auth/RegisterForm'));
const PrivateRoutes = lazy(() => import('./common/PrivateRoute'));
const VerifyEmail = lazy(() => import('./components/auth/VerifyEmail'));
const ResetPassword = lazy(() => import('./components/auth/ResetPassword')); 
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword')); 

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <Router>
          <div className="App">
            <Toaster position="top-right" />
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                  </div>
                </div>
              }
            >
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} /> {/* New route */}
                <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
                <Route path="/*" element={<PrivateRoutes />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </Provider>
    </ThemeProvider>

  );
}

export default App;
