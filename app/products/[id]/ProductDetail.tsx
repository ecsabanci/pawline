'use client';

import { Product } from '@/lib/supabase';
import Image from 'next/image';
import { useState } from 'react';
import AddToCartButton from '@/components/AddToCartButton';
import FavoriteButton from '@/components/ui/FavoriteButton';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.image_urls?.[0] || product.image_url || ''
  );

  const discountRate = product.discount_rate || 0;
  const originalPrice = product.price;
  const discountedPrice = originalPrice * (1 - discountRate / 100);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative aspect-square w-full">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          {product.image_urls && product.image_urls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.image_urls.map((imageUrl, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(imageUrl)}
                  className={`relative aspect-square w-full border-2 rounded-md overflow-hidden ${
                    selectedImage === imageUrl ? 'border-pink-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={imageUrl}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{product.name_tr}</h1>
            <FavoriteButton productId={product.id} />
          </div>
          <p className="text-gray-600">{product.description_tr}</p>
          <div className="space-y-2">
            {discountRate > 0 ? (
              <>
                <p className="text-2xl font-bold text-pink-600">
                  {discountedPrice.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </p>
                <p className="text-lg text-gray-500 line-through">
                  {originalPrice.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold">
                {originalPrice.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </p>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Stok Durumu:{' '}
              <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock_quantity > 0 ? 'Stokta' : 'Stokta Yok'}
              </span>
            </p>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
} 