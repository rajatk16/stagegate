import { useIsAuthenticated } from '@/auth/authSelectors';
import { loginWIthGoogle } from '@/auth/authService';
import { Button } from '@/components/ui';
import { Navigate } from 'react-router-dom';

const LoginPage = () => {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }
  const handleLogin = async () => {
    await loginWIthGoogle();
  };
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-xl border p-8">
        <h1 className="mb-6 text-2xl font-bold">Login</h1>

        <Button className="w-full" onClick={handleLogin}>
          Login With Google
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
