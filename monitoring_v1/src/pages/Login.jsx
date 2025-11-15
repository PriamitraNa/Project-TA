import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import Button from '../components/ui/Button';
import IconInputField from '../components/ui/IconInputField';
import { FaUser, FaLock } from 'react-icons/fa6';
import { AuthService } from '../services/Login/authService';
import toast from 'react-hot-toast';

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Username atau password salah',
  BAD_REQUEST: 'Data yang dikirim tidak valid',
  NOT_FOUND: 'Endpoint tidak ditemukan',
  SERVER_ERROR: 'Terjadi kesalahan pada server',
  NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak terduga',
};

const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const getErrorMessage = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    let errorMessage = data?.message || ERROR_MESSAGES.SERVER_ERROR;
    
    if (data?.status === 'error' && data?.message) {
      errorMessage = data.message;
    }
    
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return errorMessage || ERROR_MESSAGES.UNAUTHORIZED;
      case HTTP_STATUS.BAD_REQUEST:
        return errorMessage || ERROR_MESSAGES.BAD_REQUEST;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_MESSAGES.NOT_FOUND;
      case HTTP_STATUS.SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return errorMessage;
    }
  }
  
  if (error.request) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
};

const LoginHeader = () => (
  <div className="text-center">
    <img src={assets.logo} alt="Logo Sekolah" className="w-24 h-24 mx-auto mb-4" />
    <h1 className="text-3xl font-bold text-slate-800">Selamat Datang!</h1>
    <p className="text-slate-500 mt-2">Silakan masuk ke akun Anda</p>
  </div>
);

const LoginFooter = () => (
  <p className="text-xs text-slate-500 text-center">
    © 2025 Sistem Monitoring Nilai Siswa - SDN 1 Langensari
  </p>
);

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    
    try {
      const response = await AuthService.login(username, password);
      
      if (response.status === 'success') {
        const userRole = response.data.user.role;
        const redirectUrl = AuthService.getRedirectUrl(userRole);
        navigate(redirectUrl);
      } else {
        toast.error(response.message || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${assets.bgschool})` }}
    >
      <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl">
        <LoginHeader />

        <form onSubmit={handleLogin} className="space-y-6">
          <IconInputField
            icon={<FaUser className="text-slate-400" />}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />

          <IconInputField
            icon={<FaLock className="text-slate-400" />}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          <Button 
            type="submit" 
            fullWidth 
            size="lg" 
            className="!text-base"
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : 'Login'}
          </Button>
        </form>
            
        <LoginFooter />
      </div>
    </div>
  );
}