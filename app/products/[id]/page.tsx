'use client';

import { createServerSupabaseClient } from '@/lib/supabase.server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { Product } from '@/lib/supabase';

export const revalidate = 3600;

const supabase = createServerSupabaseClient();

async function getProduct(id: string) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    return null;
  }

  return product;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const discountRate = product.discount_rate ?? 0;
  const originalPrice = product.price;
  const discountedPrice = discountRate > 0
    ? (originalPrice - (originalPrice * discountRate / 100))
    : originalPrice;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-96 w-full">
          <Image
            src={product.image_url}
            alt={product.name_tr}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div>
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{product.name_tr}</h1>
            <FavoriteButton productId={product.id} className="text-gray-400 hover:text-pink-500" />
          </div>
          <p className="text-gray-600 mb-6">{product.description_tr}</p>
          <div className="flex items-center justify-between mb-6">
            {discountRate > 0 ? (
              <div className="space-y-1">
                <span className="text-sm text-gray-500 line-through block">
                  {originalPrice}₺
                </span>
                <span className="text-2xl font-bold text-pink-600">
                  {discountedPrice.toFixed(2)}₺
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold">₺{originalPrice}</span>
            )}
            <span className={`text-white p-2 rounded-md ${product.stock_quantity < 10 ? 'bg-pink-700' : 'bg-emerald-600'}`}>
              Stok: {product.stock_quantity}
            </span>
          </div>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
} 