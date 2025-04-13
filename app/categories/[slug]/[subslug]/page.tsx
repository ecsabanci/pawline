import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase.server';
import ProductGrid from '@/components/ProductGrid';

type SubCategoryPageProps = {
  params: {
    slug: string;
    subslug: string;
  };
};

export default async function SubCategoryPage({ params }: SubCategoryPageProps) {
  const { slug, subslug } = await params;
  const supabase = createServerSupabaseClient();

  // Fetch parent category
  const { data: parentCategory } = await supabase
    .from('categories')
    .select('id, name_tr, slug')
    .eq('slug', slug)
    .single();

  if (!parentCategory) {
    notFound();
  }

  // Fetch subcategory
  const { data: subcategory } = await supabase
    .from('categories')
    .select('id, name_tr')
    .eq('slug', subslug)
    .eq('parent_id', parentCategory.id)
    .single();

  if (!subcategory) {
    notFound();
  }

  // Fetch products in this subcategory
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', subcategory.id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <nav className="flex mb-8 text-gray-600">
        <Link href="/" className="hover:text-primary">
          Ana Sayfa
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/categories/${parentCategory.slug}`} className="hover:text-primary">
          {parentCategory.name_tr}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-primary">{subcategory.name_tr}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-8">{subcategory.name_tr}</h1>

      <ProductGrid products={products || []} />

      {(!products || products.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          Bu kategoride henüz ürün bulunmamaktadır.
        </div>
      )}
    </div>
  );
}
