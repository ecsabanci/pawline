import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import AddToCartButton from '@/components/AddToCartButton';

export const revalidate = 3600;

async function getProduct(id: string) {
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

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-96 w-full">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="flex items-center justify-between mb-6">
            <span className="text-2xl font-bold">₺{product.price}</span>
            <span className="text-gray-600">
              Stok: {product.stock_quantity}
            </span>
          </div>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
} 