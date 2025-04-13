'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from '@/components/ui/FavoriteButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface FavoriteListProps {
  userId: string;
}

export default function FavoriteList({ userId }: FavoriteListProps) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const fetchFavorites = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          product_id,
          products:product_id (
            id,
            name_tr,
            price,
            image_url,
            discount_rate
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      // Transform the data to get just the products
      const products = data
        .map(item => item.products)
        .filter((product): product is Product => product !== null);

      setFavorites(products);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-white rounded-lg p-6 pt-0">
      <h2 className="text-xl font-semibold mb-6">Favori Ürünlerim</h2>

      {favorites.length === 0 ? (
        <p className="text-gray-600 text-center py-8">
          Henüz favori ürününüz bulunmuyor.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((product) => {
            const discountRate = product.discount_rate ?? 0;
            const originalPrice = product.price;
            const discountedPrice = discountRate > 0
              ? (originalPrice - (originalPrice * discountRate / 100))
              : originalPrice;

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow"
              >
                <Link href={`/products/${product.id}`} className="block relative h-48">
                  <Image
                    src={product.image_url}
                    alt={product.name_tr}
                    fill
                    className="object-cover"
                  />
                </Link>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-pink-600"
                    >
                      {product.name_tr}
                    </Link>
                    <FavoriteButton
                      productId={product.id}
                      className="text-gray-400 hover:text-pink-500"
                    />
                  </div>

                  <div className="mt-2">
                    {discountRate > 0 ? (
                      <div className="space-y-1">
                        <span className="text-sm text-gray-500 line-through block">
                          {originalPrice}₺
                        </span>
                        <span className="text-lg font-semibold text-pink-600">
                          {discountedPrice.toFixed(2)}₺
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-semibold text-gray-900">
                        {originalPrice}₺
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 