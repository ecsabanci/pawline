import { createServerSupabaseClient } from '@/lib/supabase.server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="text-gray-700 hover:text-pink-700">
              Ana Sayfa
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-500 ml-1 md:ml-2 font-medium">
                {category.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>

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
                <h3 className="font-medium text-gray-900">{subcategory.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 