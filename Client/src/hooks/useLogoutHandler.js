import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLogoutMutation } from '../store/api/authApi';
import { toast } from 'react-hot-toast';
import { logout } from '../store/slices/authSlice';

const useLogoutHandler = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutApi, { isLoading, error }] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            const response = await logoutApi().unwrap();
            dispatch(logout());
            toast.success(response?.message || 'Logged out successfully');
            navigate('/login');
        } catch (err) {
            // console.error('Logout failed:', err);
            toast.error(err?.data?.message || 'Logout failed');
        }
    };

    return { handleLogout, logoutLoading: isLoading, logoutError: error };
};

export default useLogoutHandler;
