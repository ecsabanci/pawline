import { useState } from 'react';
import { Category, Product } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import ProductForm from './ProductForm';
import ProductList from './ProductList';

interface ProductManagementProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateProduct: (productId: string, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (productId: string) => Promise<void>;
}

export default function ProductManagement({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}: ProductManagementProps) {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  const handleFilter = (filtered: Product[]) => {
    setFilteredProducts(filtered);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Ürün Yönetimi</h2>
        <Button
          onClick={() => {
            setShowAddProduct(!showAddProduct);
            if (!showAddProduct) {
              setEditingProduct(null);
            }
          }}
          variant={showAddProduct ? 'outline' : 'primary'}
        >
          {showAddProduct ? 'İptal' : 'Yeni Ürün Ekle'}
        </Button>
      </div>

      {showAddProduct && (
        <ProductForm
          categories={categories}
          editingProduct={editingProduct}
          onSubmit={async (formData) => {
            if (editingProduct) {
              await onUpdateProduct(editingProduct.id, formData);
            } else {
              await onAddProduct(formData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
            }
            setShowAddProduct(false);
            setEditingProduct(null);
          }}
        />
      )}

      <ProductList
        products={filteredProducts}
        categories={categories}
        onEdit={(product) => {
          setEditingProduct(product);
          setShowAddProduct(true);
        }}
        onDelete={onDeleteProduct}
        onFilter={handleFilter}
        allProducts={products}
      />
    </div>
  );
} 