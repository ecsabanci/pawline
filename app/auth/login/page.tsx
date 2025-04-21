'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthError } from '@supabase/supabase-js';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const successMessage = searchParams.get('success');
    const errorMessage = searchParams.get('error');

    if (successMessage) {
      setToast({ message: decodeURIComponent(successMessage), type: 'success' });
    } else if (errorMessage) {
      setToast({ message: decodeURIComponent(errorMessage), type: 'error' });
    }

    if (user) {
      const redirectTo = searchParams.get('redirectTo');
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push('/');
      }
    }
  }, [user, router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof AuthError 
        ? error.message 
        : 'Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {toast && (
          <div
            className={`p-4 rounded-md flex items-center justify-center ${toast.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            role="alert"
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        )}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesabınıza giriş yapın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            veya{' '}
            <Link href="/auth/register" className="font-medium text-pink-600 hover:text-pink-500">
              yeni hesap oluşturun
            </Link>
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            <Input
              id="email"
              name="email"
              type="email"
              label="E-posta"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresi"
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Şifre"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre"
              autoComplete="current-password"
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>
            </div>

            <div className="text-sm text-center">
              <Link
                href="/auth/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Hesabınız yok mu? Kayıt Ol
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <LoginForm />
    </Suspense>
  );
} 