import { useState } from 'react';
import { Category } from '@/lib/supabase';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface CategoryFormProps {
  categories: Category[];
  categoryType: 'main' | 'sub' | null;
  onSubmit: (formData: {
    name: string;
    name_tr: string;
    slug: string;
    parent_id: string | null;
  }) => Promise<void>;
}

export default function CategoryForm({ categories, categoryType, onSubmit }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    name_tr: '',
    parent_id: null as string | null
  });

  const mainCategories = categories.filter(cat => !cat.parent_id);
  const mainCategoryOptions = mainCategories.map(cat => ({
    value: cat.id,
    label: cat.name_tr
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const slug = formData.name_tr
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

    await onSubmit({
      ...formData,
      slug
    });

    setFormData({
      name: '',
      name_tr: '',
      parent_id: null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-6 space-y-4">
      <Input
        label="Kategori Adı (İngilizce)"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        label="Kategori Adı (Türkçe)"
        value={formData.name_tr}
        onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
        required
      />
      {categoryType === 'sub' && (
        <Select
          label="Üst Kategori"
          options={mainCategoryOptions}
          onChange={(value) => setFormData({ ...formData, parent_id: value })}
          required
        />
      )}
      <div className="flex justify-end">
        <Button type="submit" variant="primary">
          {categoryType === 'main' ? 'Ana Kategori Ekle' : 'Alt Kategori Ekle'}
        </Button>
      </div>
    </form>
  );
} 