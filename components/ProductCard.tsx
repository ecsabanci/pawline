'use client';

import { Product } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';
import FavoriteButton from '@/components/ui/FavoriteButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discountRate = product.discount_rate ?? 0;
  const originalPrice = product.price;
  const discountedPrice = discountRate > 0
    ? (originalPrice - (originalPrice * discountRate / 100))
    : originalPrice;

  return (
    <div className="bg-white rounded-lg border-1 border-gray-200 p-2 overflow-hidden hover:shadow-sm transition-all duration-300">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <div className="relative h-48 w-full">
            <Image
              src={product.image_url}
              alt={product.name_tr}
              fill
              className="object-cover"
            />
          </div>
        </Link>
        <div className="absolute top-2 right-2">
          <FavoriteButton
            productId={product.id}
            className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white"
          />
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <Link
          href={`/products/${product.id}`}
          className="block text-sm mb-2 hover:text-pink-600 transition-colors"
        >
          {product.name_tr}
        </Link>
        
        <div className="flex flex-col gap-1 pt-2">
          {discountRate > 0 ? (
            <>
              <span className="text-sm text-gray-500 line-through">
                {originalPrice}₺
              </span>
              <span className="text-lg font-semibold text-green-800">
                {discountedPrice.toFixed(2)}₺
              </span>
            </>
          ) : (
            <span className="text-lg text-green-800 font-semibold">
              {originalPrice}₺
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 