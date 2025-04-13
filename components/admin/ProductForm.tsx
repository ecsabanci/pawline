import { useState, useEffect } from 'react';
import { Category, Product } from '@/lib/supabase';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface ProductFormProps {
  categories: Category[];
  editingProduct: Product | null;
  onSubmit: (formData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export default function ProductForm({ categories, editingProduct, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    name_tr: '',
    description: '',
    description_tr: '',
    price: '',
    image_url: '',
    image_urls: [] as string[],
    stock_quantity: '',
    category_id: '',
    discount_rate: '',
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        name_tr: editingProduct.name_tr,
        description: editingProduct.description,
        description_tr: editingProduct.description_tr,
        price: editingProduct.price.toString(),
        image_url: editingProduct.image_url,
        image_urls: editingProduct.image_urls || [editingProduct.image_url],
        stock_quantity: editingProduct.stock_quantity.toString(),
        category_id: editingProduct.category_id,
        discount_rate: editingProduct.discount_rate?.toString() || '',
      });
    }
  }, [editingProduct]);

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.parent_id 
      ? `${cat.name_tr} (${categories.find(c => c.id === cat.parent_id)?.name_tr} alt kategorisi)`
      : `${cat.name_tr} (Ana kategori)`
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onSubmit({
      name: formData.name,
      name_tr: formData.name_tr,
      description: formData.description,
      description_tr: formData.description_tr,
      price: parseFloat(formData.price),
      image_url: formData.image_urls[0] || '', // Set first image as main image
      image_urls: formData.image_urls,
      stock_quantity: parseInt(formData.stock_quantity),
      category_id: formData.category_id,
      discount_rate: formData.discount_rate ? parseFloat(formData.discount_rate) : null,
    } as Omit<Product, 'id' | 'created_at' | 'updated_at'>);

    setFormData({
      name: '',
      name_tr: '',
      description: '',
      description_tr: '',
      price: '',
      image_url: '',
      image_urls: [],
      stock_quantity: '',
      category_id: '',
      discount_rate: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
      <Input
        label="Ürün Adı (İngilizce)"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        label="Ürün Adı (Türkçe)"
        value={formData.name_tr}
        onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
        required
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Açıklama (İngilizce)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
          value={formData.description_tr}
          onChange={(e) => setFormData({ ...formData, description_tr: e.target.value })}
          className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
          rows={3}
          required
        />
      </div>
      <Input
        label="Fiyat (₺)"
        type="number"
        step="0.01"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        required
      />
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Görseller
        </label>
        <div className="space-y-2">
          {formData.image_urls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => {
                  const newUrls = [...formData.image_urls];
                  newUrls[index] = e.target.value;
                  setFormData({ ...formData, image_urls: newUrls });
                }}
                type="url"
                placeholder={`Görsel URL ${index + 1}`}
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  const newUrls = formData.image_urls.filter((_, i) => i !== index);
                  setFormData({ ...formData, image_urls: newUrls });
                }}
              >
                Sil
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData({
                ...formData,
                image_urls: [...formData.image_urls, '']
              });
            }}
          >
            Yeni Görsel URL Ekle
          </Button>
        </div>
      </div>
      <Input
        label="Stok Miktarı"
        type="number"
        value={formData.stock_quantity}
        onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
        required
      />
      <Input
        label="İndirim Oranı (%)"
        type="number"
        step="0.01"
        min="0"
        max="100"
        value={formData.discount_rate}
        onChange={(e) => setFormData({ ...formData, discount_rate: e.target.value })}
      />
      <Select
        label="Kategori"
        options={categoryOptions}
        onChange={(value) => setFormData({ ...formData, category_id: value })}
        required
      />
      <div className="flex justify-end">
        <Button type="submit" variant="primary">
          {editingProduct ? "Ürünü Güncelle" : "Ürün Ekle"}
        </Button>
      </div>
    </form>
  );
} 