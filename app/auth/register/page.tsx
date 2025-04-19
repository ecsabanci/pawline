'use client';

import { useState, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback/verify`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        setRegistered(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Kayıt olurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Email Doğrulaması Gerekli
          </h2>
          <p className="mt-2 text-gray-600">
            Kaydınızı tamamlamak için lütfen email adresinize gönderilen doğrulama linkine tıklayın.
            Email geldikten sonra linke tıklayarak hesabınızı aktifleştirebilirsiniz.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Email gelmediyse spam klasörünü kontrol etmeyi unutmayın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Yeni Hesap Oluşturun
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Veya{' '}
            <Link href="/auth/login" className="font-medium text-pink-600 hover:text-pink-500">
              mevcut hesabınıza giriş yapın
            </Link>
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <Input
              id="fullName"
              name="fullName"
              type="text"
              label="Ad Soyad"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ad Soyad"
            />
            
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
              autoComplete="new-password"
            />

            <div>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <RegisterForm />
    </Suspense>
  );
} 