'use client';

import { Product } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg border-dashed border-1 border-gray-300 hover:border-gray-400 transition-all duration-300 overflow-hidden">
          <Link href={`/products/${product.id}`}>
            <div className="relative h-48 w-full">
              <Image
                src={product.image_url}
                alt={product.name_tr}
                fill
                className="object-cover"
              />
            </div>
          </Link>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{product.name_tr}</h3>
            {/* <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {product.description_tr}
            </p> */}
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">₺{product.price}</span>
              {/* <button
                onClick={() => dispatch(addToCart(product))}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Sepete Ekle
              </button> */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 