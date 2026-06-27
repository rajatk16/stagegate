import { Button } from '@/components/ui';

import { loginWIthGoogle } from '../service';

export const LoginPage = () => {
  const handleLogin = async () => {
    await loginWIthGoogle();
  };
  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-8">
      <h1 className="mb-2 text-2xl font-bold">Welcome to StageGate</h1>

      <p className="mb-6 text-muted-foreground">Sign in to continue.</p>

      <Button className="w-full" onClick={handleLogin}>
        Continue with Google
      </Button>
    </div>
  );
};
