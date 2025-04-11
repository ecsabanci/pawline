export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  subcategory_id: number;
  stock: number;
  created_at: string;
  updated_at: string;
  name_tr: string;
  description_tr: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
} 