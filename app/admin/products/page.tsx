'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/lib/supabase';
import ProductManagement from '@/components/admin/ProductManagement';
import { Toast, ToastType } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name')
      ]);

      if (productsResponse.error) throw productsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;

      setProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setToast({ message: 'Veriler yüklenirken bir hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;

      setToast({ message: 'Ürün başarıyla eklendi', type: 'success' });
      fetchData();
    } catch (error: any) {
      console.error('Error adding product:', error);
      let errorMessage = 'Ürün eklenirken bir hata oluştu';
      
      if (error.code === '42501') {
        errorMessage = 'Bu işlem için yetkiniz bulunmuyor. Lütfen admin hesabıyla giriş yaptığınızdan emin olun.';
      }
      
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleUpdateProduct = async (productId: string, productData: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId);

      if (error) throw error;

      setToast({ message: 'Ürün başarıyla güncellendi', type: 'success' });
      fetchData();
    } catch (error: any) {
      console.error('Error updating product:', error);
      let errorMessage = 'Ürün güncellenirken bir hata oluştu';
      
      if (error.code === '42501') {
        errorMessage = 'Bu işlem için yetkiniz bulunmuyor. Lütfen admin hesabıyla giriş yaptığınızdan emin olun.';
      }
      
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setToast({ message: 'Ürün başarıyla silindi', type: 'success' });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      let errorMessage = 'Ürün silinirken bir hata oluştu';
      
      if (error.code === '42501') {
        errorMessage = 'Bu işlem için yetkiniz bulunmuyor. Lütfen admin hesabıyla giriş yaptığınızdan emin olun.';
      }
      
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Ürün Yönetimi</h1>

        <ProductManagement
          products={products}
          categories={categories}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
} 