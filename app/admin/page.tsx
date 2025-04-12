'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, Product } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Toast, ToastType } from '@/components/ui/Toast';
import Image from 'next/image';

type SortField = 'name_tr' | 'price' | 'stock_quantity' | 'discount_rate' | 'created_at';
type SortOrder = 'asc' | 'desc';
type StockFilterType = '' | 'in_stock' | 'out_of_stock';
type DiscountFilterType = '' | 'discounted' | 'not_discounted';

interface CategoryForm {
  name: string;
  name_tr: string;
  parent_id: string | null;
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: '',
    name_tr: '',
    parent_id: null
  });
  const [productForm, setProductForm] = useState({
    name: '',
    name_tr: '',
    description: '',
    description_tr: '',
    price: '',
    image_url: '',
    stock_quantity: '',
    category_id: '',
    discount_rate: '',
  });

  // Filtreleme ve sıralama state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<StockFilterType>('');
  const [discountFilter, setDiscountFilter] = useState<DiscountFilterType>('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, stockFilter, discountFilter, sortField, sortOrder]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    
    setCategories(data);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          id,
          name_tr
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    setProducts(data);
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Arama filtresi
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name_tr.toLowerCase().includes(searchLower) ||
        product.name.toLowerCase().includes(searchLower) ||
        product.description_tr.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }

    // Kategori filtresi
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    // Stok filtresi
    switch (stockFilter) {
      case 'in_stock':
        filtered = filtered.filter(product => product.stock_quantity > 10);
        break;
      case 'out_of_stock':
        filtered = filtered.filter(product => product.stock_quantity === 0);
        break;
    }

    // İndirim filtresi
    switch (discountFilter) {
      case 'discounted':
        filtered = filtered.filter(product => product.discount_rate && product.discount_rate > 0);
        break;
      case 'not_discounted':
        filtered = filtered.filter(product => !product.discount_rate || product.discount_rate === 0);
        break;
    }

    // Sıralama
    filtered.sort((a, b) => {
      if (sortField === 'price' || sortField === 'stock_quantity' || sortField === 'discount_rate') {
        const aValue = a[sortField] || 0;
        const bValue = b[sortField] || 0;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else {
        const aValue = a[sortField].toString().toLowerCase();
        const bValue = b[sortField].toString().toLowerCase();
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });

    setFilteredProducts(filtered);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = categoryForm.name_tr
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      const { error } = await supabase
        .from('categories')
        .insert([
          {
            name: categoryForm.name,
            name_tr: categoryForm.name_tr,
            slug,
            parent_id: categoryForm.parent_id || null,
          },
        ]);

      if (error) throw error;

      setToast({ message: 'Kategori başarıyla eklendi', type: 'success' });
      setCategoryForm({ name: '', name_tr: '', parent_id: null });
      setShowAddCategory(false);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      setToast({ message: 'Kategori eklenirken bir hata oluştu', type: 'error' });
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: productForm.name,
            name_tr: productForm.name_tr,
            description: productForm.description,
            description_tr: productForm.description_tr,
            price: parseFloat(productForm.price),
            image_url: productForm.image_url,
            stock_quantity: parseInt(productForm.stock_quantity),
            category_id: productForm.category_id,
            discount_rate: productForm.discount_rate ? parseFloat(productForm.discount_rate) : null,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        setToast({ message: 'Ürün başarıyla güncellendi', type: 'success' });
      } else {
        // Add new product
        const { error } = await supabase
          .from('products')
          .insert([
            {
              name: productForm.name,
              name_tr: productForm.name_tr,
              description: productForm.description,
              description_tr: productForm.description_tr,
              price: parseFloat(productForm.price),
              image_url: productForm.image_url,
              stock_quantity: parseInt(productForm.stock_quantity),
              category_id: productForm.category_id,
              discount_rate: productForm.discount_rate ? parseFloat(productForm.discount_rate) : null,
            },
          ]);

        if (error) throw error;
        setToast({ message: 'Ürün başarıyla eklendi', type: 'success' });
      }

      setProductForm({
        name: '',
        name_tr: '',
        description: '',
        description_tr: '',
        price: '',
        image_url: '',
        stock_quantity: '',
        category_id: '',
        discount_rate: '',
      });
      setShowAddProduct(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error with product:', error);
      setToast({ message: `Ürün ${editingProduct ? 'güncellenirken' : 'eklenirken'} bir hata oluştu`, type: 'error' });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      name_tr: product.name_tr,
      description: product.description,
      description_tr: product.description_tr,
      price: product.price.toString(),
      image_url: product.image_url,
      stock_quantity: product.stock_quantity.toString(),
      category_id: product.category_id,
      discount_rate: product.discount_rate?.toString() || '',
    });
    setShowAddProduct(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setToast({ message: 'Ürün başarıyla silindi', type: 'success' });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setToast({ message: 'Ürün silinirken bir hata oluştu', type: 'error' });
    }
  };

  const mainCategories = categories.filter(cat => !cat.parent_id);
  const subCategories = categories.filter(cat => cat.parent_id);

  const mainCategoryOptions: SelectOption[] = mainCategories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const categoryOptions: SelectOption[] = subCategories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const filterCategoryOptions: SelectOption[] = [
    { value: '', label: 'Tüm Kategoriler' },
    ...categories.map(cat => ({
      value: cat.id,
      label: cat.name_tr
    }))
  ];

  const stockOptions: SelectOption[] = [
    { value: '', label: 'Stok Durumu' },
    { value: 'in_stock', label: 'Stokta Var' },
    { value: 'out_of_stock', label: 'Stokta Yok' }
  ];

  const discountOptions: SelectOption[] = [
    { value: '', label: 'İndirim Durumu' },
    { value: 'discounted', label: 'İndirimli' },
    { value: 'not_discounted', label: 'İndirimsiz' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Paneli</h1>

        {/* Kategori Yönetimi */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Kategori Yönetimi</h2>
            <Button
              onClick={() => setShowAddCategory(!showAddCategory)}
              variant={showAddCategory ? 'outline' : 'primary'}
            >
              {showAddCategory ? 'İptal' : 'Yeni Kategori Ekle'}
            </Button>
          </div>

          {showAddCategory && (
            <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
              <Input
                label="Kategori Adı (İngilizce)"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
              />
              <Input
                label="Kategori Adı (Türkçe)"
                value={categoryForm.name_tr}
                onChange={(e) => setCategoryForm({ ...categoryForm, name_tr: e.target.value })}
                required
              />
              <Select
                label="Üst Kategori (Opsiyonel)"
                options={mainCategoryOptions}
                onChange={(value) => setCategoryForm({ ...categoryForm, parent_id: value || null })}
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary">
                  Kategori Ekle
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Ürün Yönetimi */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Ürün Yönetimi</h2>
            <Button
              onClick={() => {
                setShowAddProduct(!showAddProduct);
                if (!showAddProduct) {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    name_tr: '',
                    description: '',
                    description_tr: '',
                    price: '',
                    image_url: '',
                    stock_quantity: '',
                    category_id: '',
                    discount_rate: '',
                  });
                }
              }}
              variant={showAddProduct ? 'outline' : 'primary'}
            >
              {showAddProduct ? 'İptal' : 'Yeni Ürün Ekle'}
            </Button>
          </div>

          {showAddProduct && (
            <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
              <Input
                label="Ürün Adı (İngilizce)"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
              <Input
                label="Ürün Adı (Türkçe)"
                value={productForm.name_tr}
                onChange={(e) => setProductForm({ ...productForm, name_tr: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama (İngilizce)
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama (Türkçe)
                </label>
                <textarea
                  value={productForm.description_tr}
                  onChange={(e) => setProductForm({ ...productForm, description_tr: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  rows={3}
                  required
                />
              </div>
              <Input
                label="Fiyat (₺)"
                type="number"
                step="0.01"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
              <Input
                label="Görsel URL"
                type="url"
                value={productForm.image_url}
                onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                required
              />
              <Input
                label="Stok Miktarı"
                type="number"
                value={productForm.stock_quantity}
                onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                required
              />
              <Input
                label="İndirim Oranı (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={productForm.discount_rate}
                onChange={(e) => setProductForm({ ...productForm, discount_rate: e.target.value })}
              />
              <Select
                label="Kategori"
                options={categoryOptions}
                onChange={(value) => setProductForm({ ...productForm, category_id: value })}
                required
              />
              <div className="flex justify-end">
                <Button type="submit" variant="primary">
                  {editingProduct ? 'Ürünü Güncelle' : 'Ürün Ekle'}
                </Button>
              </div>
            </form>
          )}

          {/* Ürün Listesi */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Filtreleme Arayüzü */}
            <div className="p-4 border-b border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <Select
                  options={filterCategoryOptions}
                  onChange={(value) => setSelectedCategory(value)}
                  className="w-48"
                />

                <Select
                  options={stockOptions}
                  onChange={(value) => setStockFilter(value as StockFilterType)}
                  className="w-48"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  options={discountOptions}
                  onChange={(value) => setDiscountFilter(value as DiscountFilterType)}
                  className="w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Görsel
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name_tr')}
                    >
                      <div className="flex items-center gap-1">
                        Ürün Adı
                        <span className={`transition-colors ${sortField === 'name_tr' ? 'text-pink-600' : 'text-gray-400'}`}>
                          {sortField === 'name_tr' 
                            ? (sortOrder === 'asc' ? '↑' : '↓')
                            : '↓'}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center gap-1">
                        Fiyat
                        <span className={`transition-colors ${sortField === 'price' ? 'text-pink-600' : 'text-gray-400'}`}>
                          {sortField === 'price' 
                            ? (sortOrder === 'asc' ? '↑' : '↓')
                            : '↓'}
                        </span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('stock_quantity')}
                    >
                      <div className="flex items-center gap-1">
                        Stok
                        <span className={`transition-colors ${sortField === 'stock_quantity' ? 'text-pink-600' : 'text-gray-400'}`}>
                          {sortField === 'stock_quantity' 
                            ? (sortOrder === 'asc' ? '↑' : '↓')
                            : '↓'}
                        </span>
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('discount_rate')}
                    >
                      <div className="flex items-center gap-1">
                        İndirim
                        <span className={`transition-colors ${sortField === 'discount_rate' ? 'text-pink-600' : 'text-gray-400'}`}>
                          {sortField === 'discount_rate' 
                            ? (sortOrder === 'asc' ? '↑' : '↓')
                            : '↓'}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative h-16 w-16">
                          <Image
                            src={product.image_url}
                            alt={product.name_tr}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name_tr}</div>
                        <div className="text-sm text-gray-500">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(product.categories as any)?.name_tr}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₺{product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock_quantity > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stock_quantity > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.discount_rate ? `%${product.discount_rate}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          onClick={() => handleEditProduct(product)}
                          variant="outline"
                          size="sm"
                        >
                          Düzenle
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product.id)}
                          variant="danger"
                          size="sm"
                        >
                          Sil
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 