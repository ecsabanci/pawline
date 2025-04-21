'use client';

import { Product } from '@/lib/supabase';
import { useState } from 'react';
import AddToCartButton from '@/components/AddToCartButton';
import FavoriteButton from '@/components/ui/FavoriteButton';
import ImageSlider from '@/components/ui/ImageSlider';

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const discountRate = product.discount_rate || 0;
  const originalPrice = product.price;
  const discountedPrice = originalPrice * (1 - discountRate / 100);

  // Tüm resimleri bir dizide topluyoruz
  const allImages = product.image_urls?.length 
    ? product.image_urls 
    : [product.image_url];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <ImageSlider 
            images={allImages} 
            aspectRatio="square"
            mainImageClassName="bg-white"
          />
        </div>
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold">{product.name_tr}</h1>
            <FavoriteButton productId={product.id} />
          </div>
          <p className="text-gray-600 text-sm">{product.description_tr}</p>
          <div className="space-y-2">
            {discountRate > 0 ? (
              <>
                <p className="text-lg text-gray-500 line-through">
                  {originalPrice.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {discountedPrice.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  })}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-green-600">
                {originalPrice.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                })}
              </p>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
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