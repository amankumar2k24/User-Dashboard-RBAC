import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetRolesQuery } from '../store/api/authApi';
import { useDispatch, useSelector } from 'react-redux';
import { hasPermission } from '../utils/permissions';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import useLogoutHandler from '../hooks/useLogoutHandler';

const Sidebar = ({ onLinkClick }) => {
    const { user, accessToken } = useSelector((state) => state.auth);
    const { handleLogout, logoutLoading } = useLogoutHandler();

    const { data: rolesResponse, isLoading: rolesLoading, error: rolesError } = useGetRolesQuery(undefined, {
        skip: !accessToken || !['admin', 'user'].includes(user?.role?.name),
    });

    const isAdmin = user?.role?.name === 'admin';

    return (
        <div className="w-64 h-lvh bg-gray-100 p-4 flex flex-col justify-between">
            {
                logoutLoading && (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                        <CircularProgress />
                        <Typography variant="body1" sx={{ mt: 2 }}>Logging out...</Typography>
                    </Box>
                )
            }
            <div>
                <div className="text-xl font-bold text-gray-800 mb-6">EnvisionPro</div>
                <div className="mb-4">
                    {/* <span className="text-sm font-semibold text-gray-600">AMAN TEAM</span> */}
                    <span className="text-xs text-gray-500 ml-4"> Internal Use Only</span>
                </div>
                <nav className="space-y-2">
                    <Link to="/dashboard" className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
                        onClick={() => {
                            if (onLinkClick) onLinkClick();
                        }}
                    >
                        <span className="mr-2">🏠</span> Dashboard
                    </Link>
                    {isAdmin && hasPermission(user, 'users', 'read') && (
                        <Link to="/users" className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
                            onClick={() => {
                                if (onLinkClick) onLinkClick();
                            }}
                        >
                            <span className="mr-2">👤</span> Manage Users
                        </Link>
                    )}
                    <Link to="/profile" className="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
                        onClick={() => {
                            if (onLinkClick) onLinkClick();
                        }}
                    >
                        <span className="mr-2">🧑</span> Profile
                    </Link>
                </nav>
            </div>
            <Button
                variant="contained"
                onClick={handleLogout}
                sx={{ bgcolor: '#1e2939', '&:hover': { bgcolor: '##1e2919' }, py: 0.5 }}
            >
                Logout
            </Button>
        </div >
    );
};

export default Sidebar;