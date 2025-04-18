import { createServerSupabaseClient } from '@/lib/supabase.server';
import { notFound } from 'next/navigation';
import ProductDetail from './ProductDetail';

export const revalidate = 3600; // 1 saat

async function getProduct(id: string) {
  const supabase = createServerSupabaseClient();
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    return null;
  }

  return product;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
} 