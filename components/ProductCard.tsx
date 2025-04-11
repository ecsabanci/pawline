'use client';

import { Product } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

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
      
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm mb-2">{product.name_tr}</h3>
        
        <div className="flex flex-col gap-1 pt-2">
          {discountRate > 0 ? (
            <>
              <span className="text-sm text-gray-500 line-through">
                {originalPrice}₺
              </span>
              <span className="text-lg font-semibold text-rose">
                {discountedPrice.toFixed(2)}₺
              </span>
            </>
          ) : (
            <span className="text-lg font-semibold">
              {originalPrice}₺
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 