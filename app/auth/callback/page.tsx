'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const isVerification = searchParams.get('verification') === 'true';

      if (!isVerification) {
        setError('Email doğrulama işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        setLoading(false);
        return;
      }

      try {
        // Check initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          // Create or update user profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata.full_name,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            setError('Profil oluşturulurken bir hata oluştu.');
            setLoading(false);
            return;
          }

          // Sign out after profile creation
          await supabase.auth.signOut();
          setIsConfirmed(true);
          setLoading(false);
          return;
        }

        // If no session, listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            // Create or update user profile
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata.full_name,
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
          } else if (event === 'SIGNED_OUT') {
            setIsConfirmed(true);
          }
          setLoading(false);
        });

        // Set a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
          if (loading) {
            setError('Doğrulama işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.');
            setLoading(false);
            subscription.unsubscribe();
          }
        }, 10000); // 10 seconds timeout

        // Cleanup subscription and timeout
        return () => {
          subscription.unsubscribe();
          clearTimeout(timeout);
        };
      } catch (error) {
        console.error('Callback error:', error);
        setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, loading]);

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