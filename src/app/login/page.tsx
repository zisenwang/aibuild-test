'use client';

import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layouts/AuthLayout';
import AuthForm, {AuthField} from '@/components/forms/AuthForm';
import { loginUser } from './actions';

const LOGIN_FIELDS = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    required: true,
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
  },
] as AuthField[];

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async (formData: Record<string, string>) => {
    const result = await loginUser(formData.username, formData.password);
    
    if (result.success) {
      router.push('/');
    }
    
    return result;
  };

  return (
    <AuthLayout>
      <AuthForm
        title="AIBUILD"
        fields={LOGIN_FIELDS}
        submitButtonText="Access Dashboard"
        loadingButtonText="Authenticating..."
        footerText="Default: admin / admin123"
        onSubmit={handleLogin}
      />
    </AuthLayout>
  );
}