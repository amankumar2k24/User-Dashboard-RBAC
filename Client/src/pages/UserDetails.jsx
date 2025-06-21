import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetUserByIdQuery } from '../store/api/userApi';
import { useSelector } from 'react-redux';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
import { hasPermission } from '../utils/permissions';
import moment from "moment"

const UserDetail = () => {
    const { id } = useParams();
    const { user: currentUser, accessToken } = useSelector((state) => state.auth);

    let { data: user, isLoading, error } = useGetUserByIdQuery(id, {
        skip: !accessToken || !hasPermission(currentUser, 'users', 'read'),
    });
    user = user?.user
    // console.log("user😍😍", user)

    const getErrorMessage = (error) => {
        switch (error?.status) {
            case 401: return 'Please log in again';
            case 403: return 'You do not have permission to view this user';
            case 404: return 'User not found';
            case 500: return 'Server error, please try again later';
            default: return 'Failed to load user details';
        }
    };

    if (!accessToken || !hasPermission(currentUser, 'users', 'read')) {
        return <Typography color="error">Unauthorized</Typography>;
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: '100vh', bgcolor: 'grey.100' }}>
            {isLoading && (
                <Box sx={{ textAlign: 'center', p: 3 }}>
                    <CircularProgress />
                    <Typography variant="body1" sx={{ mt: 2 }}>Loading user details...</Typography>
                </Box>
            )}
            {error && (
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#fef2f2', borderRadius: 1 }}>
                    <Typography variant="body1" color="error">
                        {getErrorMessage(error)}
                    </Typography>
                </Box>
            )}
            {user && !isLoading && !error && (
                <>
                    <Typography variant="h4" component="h2" align="center" sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary' }}>
                        User Details
                    </Typography>
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 2, p: 3, maxWidth: '600px', mx: 'auto' }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Avatar
                                alt={`${user.firstName} ${user.lastName}`}
                                src={
                                    user.profileImage
                                        ? `http://localhost:3333/uploads/profiles/${user.profileImage}`
                                        : 'https://via.placeholder.com/150'
                                }
                                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                            />
                            <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                                {user.firstName} {user.lastName}
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ color: 'text.primary', mb: 1 }}><strong>Email:</strong> {user.email}</Typography>
                        <Typography variant="body1" sx={{ color: 'text.primary', mb: 1 }}><strong>Role:</strong> <span className='capitalize'>{user.role?.name || 'N/A'}</span></Typography>
                        <Typography variant="body1" sx={{ color: 'text.primary', mb: 1 }}><strong>Status:</strong> {user.isActive ? 'Active' : 'Inactive'}</Typography>
                        <Typography variant="body1" sx={{ color: 'text.primary', mb: 1 }}><strong>Created At:</strong> {moment(user.createdAt).format('MMMM D, YYYY A')}</Typography>
                        <Typography variant="body1" sx={{ color: 'text.primary' }}><strong>Updated At:</strong>{moment(user.updatedAt).format('MMMM D, YYYY A')}</Typography>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default UserDetail;