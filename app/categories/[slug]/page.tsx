import { createServerSupabaseClient } from '@/lib/supabase.server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerSupabaseClient();

  // Fetch category and its subcategories
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!category) {
    notFound();
  }

  const { data: subcategories } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', category.id);

  // Fetch products in this category and its subcategories
  const categoryIds = [category.id];
  if (subcategories) {
    categoryIds.push(...subcategories.map(sub => sub.id));
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 mb-8 text-gray-600 text-sm">
        <Link href="/" className="hover:text-primary">
          Ana Sayfa
        </Link>
        <ChevronRightIcon className="w-3 h-3" />
        <span className="text-primary">{category.name_tr}</span>
      </nav>

      <h1 className="text-2xl font-bold mb-8 bg-gray-100 p-4 rounded-lg">{category.name_tr}</h1>

      {/* Subcategories */}
      {subcategories && subcategories.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Alt Kategoriler</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/categories/${category.slug}/${subcategory.slug}`}
                className="p-4 border rounded-lg hover:border-pink-500 transition-colors"
              >
                <h3 className="font-medium text-gray-900">{subcategory.name_tr}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 