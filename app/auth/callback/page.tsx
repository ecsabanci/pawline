'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user) {
          // Create profile after email verification
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: session.user.id,
              email: session.user.email,
              fullName: session.user.user_metadata.full_name,
            }),
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to create profile');
          }

          router.push('/');
          router.refresh();
        }
      } catch (error) {
        console.error('Error in email confirmation:', error);
        router.push('/auth/login?error=EmailConfirmationFailed');
      }
    };

    handleEmailConfirmation();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Email Doğrulanıyor
        </h2>
        <p className="mt-2 text-gray-600">
          Lütfen bekleyin, hesabınız doğrulanıyor...
        </p>
      </div>
    </div>
  );
} 