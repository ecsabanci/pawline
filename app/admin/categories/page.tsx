'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/supabase';
import CategoryManagement from '@/components/admin/CategoryManagement';
import { Toast, ToastType } from '@/components/ui/Toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setToast({ message: 'Kategoriler yüklenirken bir hata oluştu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .insert([categoryData]);

      if (error) throw error;

      setToast({ message: 'Kategori başarıyla eklendi', type: 'success' });
      fetchCategories();
    } catch (error: any) {
      console.error('Error adding category:', error);
      let errorMessage = 'Kategori eklenirken bir hata oluştu';
      
      if (error.code === '42501') {
        errorMessage = 'Bu işlem için yetkiniz bulunmuyor. Lütfen admin hesabıyla giriş yaptığınızdan emin olun.';
      }
      
      setToast({ message: errorMessage, type: 'error' });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Önce bu kategoriye ait ürün var mı kontrol et
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', categoryId);

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        setToast({ 
          message: 'Bu kategoriye ait ürünler bulunmaktadır. Kategoriyi silmek için önce ürünleri silmeniz veya başka bir kategoriye taşımanız gerekmektedir.', 
          type: 'error' 
        });
        return;
      }

      // Alt kategori var mı kontrol et
      const { data: subCategories, error: subCategoriesError } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', categoryId);

      if (subCategoriesError) throw subCategoriesError;

      if (subCategories && subCategories.length > 0) {
        setToast({ 
          message: 'Bu kategorinin alt kategorileri bulunmaktadır. Kategoriyi silmek için önce alt kategorileri silmeniz gerekmektedir.', 
          type: 'error' 
        });
        return;
      }

      if (!window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      setToast({ message: 'Kategori başarıyla silindi', type: 'success' });
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      let errorMessage = 'Kategori silinirken bir hata oluştu';
      
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Kategori Yönetimi</h1>

        <CategoryManagement
          categories={categories}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
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