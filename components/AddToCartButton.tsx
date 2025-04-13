'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/features/cartSlice';
import { Product } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      router.push(`/auth/login?redirectTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    try {
      dispatch(addToCart(product));
      setShowToast(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleAddToCart}
        variant="outline"
        fullWidth
        loading={loading}
        disabled={product.stock_quantity === 0}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
          </svg>
        }
      >
        {product.stock_quantity === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
      </Button>

      {showToast && (
        <Toast
          message={`${product.name_tr} sepete eklendi`}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
} 