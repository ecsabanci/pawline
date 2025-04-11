import ProductGrid from '@/components/ProductGrid';
import { createServerSupabaseClient } from '@/lib/supabase.server';

export const revalidate = 3600; // Revalidate every hour

async function getProducts() {
  const supabase = createServerSupabaseClient();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  return products;
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="container mx-auto px-4 py-8">
      <ProductGrid products={products} />
    </main>
  );
} 