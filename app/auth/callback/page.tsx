'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const isVerification = searchParams.get('verification') === 'true';

      // If this is not a verification callback, redirect to home
      if (!token || !type || !isVerification) {
        router.replace('/');
        return;
      }

      try {
        // First, get the session to ensure the token is valid
        const { data, error: authError } = await supabase.auth.getSession();
        if (authError) throw authError;

        if (data?.session?.user) {
          // Create or update user profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.session.user.id,
              email: data.session.user.email,
              full_name: data.session.user.user_metadata.full_name,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            setError('Profil oluşturulurken bir hata oluştu.');
            return;
          }

          // Sign out after profile creation
          await supabase.auth.signOut();
          setIsConfirmed(true);
        }
      } catch (error) {
        console.error('Callback error:', error);
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  // Prevent any automatic redirects
  useEffect(() => {
    const preventRedirect = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', preventRedirect);
    return () => window.removeEventListener('beforeunload', preventRedirect);
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Hata Oluştu
          </h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-4">
            <Link
              href="/auth/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Giriş Sayfasına Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm text-center">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Email Doğrulandı!
          </h2>
          <p className="mt-2 text-gray-600">
            Email adresiniz başarıyla doğrulandı. Şimdi hesabınıza giriş yapabilirsiniz.
          </p>
          <div className="mt-4 space-y-3">
            <Link
              href="/auth/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Giriş Yap
            </Link>
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <LoadingSpinner fullScreen />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <CallbackContent />
    </Suspense>
  );
} 