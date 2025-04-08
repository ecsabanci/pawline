import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path: string }) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // This will throw in middleware, but we can ignore it for now
          }
        },
        remove(name: string, options: { path: string }) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // This will throw in middleware, but we can ignore it for now
          }
        },
      },
    }
  );
} 