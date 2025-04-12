'use client';

import { Product } from '@/lib/supabase';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/features/cartSlice';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const dispatch = useDispatch();

  return (
    <button
      onClick={() => dispatch(addToCart(product))}
      className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
    >
      Sepete Ekle
    </button>
  );
} 