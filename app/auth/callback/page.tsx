'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the session to check if the user is authenticated
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          // User is authenticated, redirect to home page
          router.push('/');
        } else {
          // If no session, check for error message in URL
          const errorMessage = searchParams.get('error_description');
          if (errorMessage) {
            console.error('Authentication error:', errorMessage);
            router.push('/auth/login?error=' + encodeURIComponent(errorMessage));
          } else {
            // No error but also no session, redirect to login
            router.push('/auth/login');
          }
        }
      } catch (error) {
        console.error('Error during email confirmation:', error);
        router.push('/auth/login?error=Email doğrulama işlemi başarısız oldu');
      }
    };

    handleEmailConfirmation();
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <LoadingSpinner size="lg" text="Email Doğrulanıyor" />
        <p className="mt-2 text-gray-600">
          Lütfen bekleyin, hesabınız doğrulanıyor...
        </p>
      </div>
    </div>
  );
} 