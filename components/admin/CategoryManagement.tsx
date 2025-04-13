import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Category } from '@/lib/supabase';
import Select from '../ui/Select';

interface CategoryManagementProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => void;
  onDeleteCategory: (id: string) => void;
}

export default function CategoryManagement({
  categories,
  onAddCategory,
  onDeleteCategory
}: CategoryManagementProps) {
  const [categoryForm, setCategoryForm] = useState<Omit<Category, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    name_tr: '',
    slug: '',
    parent_id: null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCategory(categoryForm);
    setCategoryForm({
      name: '',
      name_tr: '',
      slug: '',
      parent_id: null
    });
  };

  // Ana kategorileri filtrele
  const mainCategories = categories.filter(cat => !cat.parent_id);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              İsim (English)
            </label>
            <Input
              id="name"
              name="name"
              value={categoryForm.name}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>
          <div>
            <label htmlFor="name_tr" className="block text-sm font-medium text-gray-700">
              İsim (Turkish)
            </label>
            <Input
              id="name_tr"
              name="name_tr"
              value={categoryForm.name_tr}
              onChange={handleInputChange}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <Input
            id="slug"
            name="slug"
            value={categoryForm.slug}
            onChange={handleInputChange}
            required
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700">
            Üst Kategori (Ana kategori için boş bırakın)
          </label>
          <Select
            id="parent_id"
            name="parent_id"
            value={categoryForm.parent_id || ''}
            onChange={(value) => setCategoryForm(prev => ({ ...prev, parent_id: value || null }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
            options={[
              { label: 'Ana Kategori (Üst kategori yok)', value: '' },
              ...mainCategories.map(category => ({
                label: category.name_tr,
                value: category.id
              }))
            ]}
          />
        </div>

        <Button type="submit" variant="primary" className="w-full">
          {categoryForm.parent_id ? 'Alt Kategori Ekle' : 'Ana Kategori Ekle'}
        </Button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İsim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Türkçe İsim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori Tipi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {category.name_tr}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {category.slug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {category.parent_id ? (
                    <span className="text-blue-600">
                      {categories.find(c => c.id === category.parent_id)?.name_tr} alt kategorisi
                    </span>
                  ) : (
                    <span className="text-green-600">Ana Kategori</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <Button
                    onClick={() => onDeleteCategory(category.id)}
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
  );
} 