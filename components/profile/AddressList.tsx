'use client';

import { Address } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AddressListProps {
  addresses: Address[];
}

export default function AddressList({ addresses }: AddressListProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg p-6 pt-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Adreslerim</h2>
        <button
          onClick={() => router.push('/profile/addresses')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
        >
          Yeni Adres Ekle
        </button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-gray-600 text-center py-8">Henüz kayıtlı adresiniz bulunmuyor.</p>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="rounded-lg p-4 relative hover:shadow-sm transition-colors"
            >
              {address.is_default && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Varsayılan
                </span>
              )}
              <h3 className="font-semibold">{address.title}</h3>
              <p className="text-gray-600 mt-1">{address.address_line1}</p>
              <p className="text-gray-600 mt-1">{address.address_line2}</p>
              <p className="text-gray-600">{address.city} - {address.state} - {address.country} - {address.postal_code}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 