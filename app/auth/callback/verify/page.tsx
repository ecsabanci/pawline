'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function VerifyPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleVerification = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          throw new Error('No user found');
        }

        // Create or update user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          throw profileError;
        }

        // Sign out the user
        await supabase.auth.signOut();

        // Redirect to login page with success message
        router.push('/auth/login?success=' + encodeURIComponent('Email adresiniz başarıyla doğrulandı. Lütfen giriş yapın.'));
      } catch (error: any) {
        console.error('Verification error:', error);
        router.push('/auth/login?error=' + encodeURIComponent(error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'));
      }
    };

    // Set a timeout to redirect if verification takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        router.push('/auth/login?error=' + encodeURIComponent('Doğrulama süresi doldu. Lütfen tekrar deneyin.'));
      }
    }, 10000);

    handleVerification();

    return () => clearTimeout(timeoutId);
  }, [supabase, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <h2 className="mt-6 text-center text-xl font-semibold text-gray-900">
            Email adresinizi doğruluyoruz...
          </h2>
        </div>
      </div>
    </div>
  );
} 