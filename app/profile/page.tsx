'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Profile, Address, Order } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchProfileData = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
        setFormData({
          fullName: profileData.full_name || '',
          phone: profileData.phone || '',
        });

        // Fetch addresses
        const { data: addressData, error: addressError } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });

        if (addressError) throw addressError;
        setAddresses(addressData);

        // Fetch orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;
        setOrders(orderData);

      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Profil bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
        })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => prev ? {
        ...prev,
        full_name: formData.fullName,
        phone: formData.phone,
      } : null);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Profil güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profilim</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Kişisel Bilgiler</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-blue-600 hover:text-blue-800"
            >
              {editMode ? 'İptal' : 'Düzenle'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">E-posta:</span>
                <span className="ml-2">{profile?.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Ad Soyad:</span>
                <span className="ml-2">{profile?.full_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Telefon:</span>
                <span className="ml-2">{profile?.phone || '-'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Adreslerim</h2>
            <button
              onClick={() => router.push('/profile/addresses')}
              className="text-blue-600 hover:text-blue-800"
            >
              Adres Ekle
            </button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-gray-600">Henüz kayıtlı adresiniz bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="border rounded-lg p-4 relative"
                >
                  {address.is_default && (
                    <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Varsayılan
                    </span>
                  )}
                  <h3 className="font-semibold">{address.title}</h3>
                  <p className="text-gray-600 mt-1">{address.address_line}</p>
                  <p className="text-gray-600">{address.city} - {address.postal_code}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Siparişlerim</h2>

          {orders.length === 0 ? (
            <p className="text-gray-600">Henüz siparişiniz bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-4"
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
      </div>
    </div>
  );
} 