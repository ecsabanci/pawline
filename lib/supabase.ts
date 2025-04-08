'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);

// Types for our Supabase tables
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_quantity: number;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
};

export type Address = {
  id: string;
  user_id: string;
  title: string;
  address_line: string;
  city: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
}; 