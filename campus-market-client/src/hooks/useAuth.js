import useAuthStore from '../store/authStore';
import { login as loginApi, signup as signupApi } from '../api/authApi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, token, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const login = async (credentials) => {
    try {
      const res = await loginApi(credentials);
      setAuth(res.data.user, res.data.token);
      navigate('/home');
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = () => {
    storeLogout();
    navigate('/');
    toast('Logged out.', { icon: '👋' });
  };

  return { user, token, isLoggedIn: !!user, login, logout };
}
