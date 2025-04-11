'use client';

import { Order } from '@/lib/supabase';

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  return (
    <div className="bg-white rounded-lg p-6 pt-0">
      <h2 className="text-xl font-semibold mb-6">Siparişlerim</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600 text-center py-8">Henüz siparişiniz bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">Sipariş No: </span>
                  <span>{order.id}</span>
                </div>
                <div>
                  <span className="font-semibold">Tutar: </span>
                  <span>₺{order.total_amount}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="font-semibold">Durum: </span>
                <span className="capitalize">{order.status}</span>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {new Date(order.created_at).toLocaleDateString('tr-TR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 