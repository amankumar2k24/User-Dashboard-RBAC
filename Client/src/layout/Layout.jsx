import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import useLogoutHandler from '../hooks/useLogoutHandler';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { handleLogout, logoutLoading } = useLogoutHandler();
    const { user } = useSelector((state) => state.auth);

    // console.log("user==>", user)

    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className="flex h-screen">
            {logoutLoading && (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>Loading...</Typography>
                </Box>
            )}
            {/* Hamburger Menu for Mobile */}
            <div className="fixed z-20 lg:hidden">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-gray-200 focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <div className={`fixed z-10 w-64 h-full bg-gray-800 text-white transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block`}>
                <Sidebar onLinkClick={handleLinkClick} />
            </div>

            {/* Header */}
            <div className="fixed z-20 w-full bg-gray-800 text-white p-4 flex justify-between items-center">
                <span className="text-lg font-semibold">MaxLence Workspace</span>
                <div className="flex items-center">
                    <span className="mr-4 text-sm hidden lg:inline">{user.firstName} {user.lastName}</span>
                    <LogoutIcon
                        onClick={handleLogout}
                        sx={{ color: 'white', cursor: 'pointer' }}
                    />
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="lg:hidden ml-2 text-gray-200 hover:text-white focus:outline-none cursor-pointer"
                    >
                        {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-0 mt-16 p-4 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default Layout;