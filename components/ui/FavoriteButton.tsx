'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
}

export default function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user?.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favorite status:', error);
      }

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [user?.id, productId]);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, checkFavoriteStatus]);

  const toggleFavorite = async () => {
    if (!user) {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      window.location.href = '/auth/login';
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              product_id: productId,
            },
          ]);

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`transition-color cursor-pointer duration-200 disabled:opacity-50 hover:text-pink-700 hover:scale-105 ${className}`}
      aria-label={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
    >
      {isFavorite ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-pink-700">
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )}
    </button>
  );
} 