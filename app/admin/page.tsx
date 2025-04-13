'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/lib/supabase';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products
        const { data: products } = await supabase
          .from('products')
          .select('stock_quantity');

        // Fetch categories
        const { data: categories } = await supabase
          .from('categories')
          .select('id');

        setStats({
          totalProducts: products?.length || 0,
          totalCategories: categories?.length || 0,
          lowStockProducts: products?.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length || 0,
          outOfStockProducts: products?.filter(p => p.stock_quantity === 0).length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Paneli</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Toplam Ürün</h3>
          <p className="text-3xl font-bold text-pink-600 mt-2">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Toplam Kategori</h3>
          <p className="text-3xl font-bold text-pink-600 mt-2">{stats.totalCategories}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Az Stoklu Ürünler</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">{stats.lowStockProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Stokta Olmayan</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.outOfStockProducts}</p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/products"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ürün Yönetimi</h2>
          <p className="text-gray-600">Ürün ekle, düzenle veya sil</p>
        </Link>
        <Link
          href="/admin/categories"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Kategori Yönetimi</h2>
          <p className="text-gray-600">Kategori ekle, düzenle veya sil</p>
        </Link>
      </div>
    </div>
  );
} 