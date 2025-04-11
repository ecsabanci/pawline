'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Profile, Address, Order } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

type TabType = 'profile' | 'addresses' | 'orders';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
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

  const tabs = [
    { id: 'profile', label: 'Profil Bilgileri' },
    { id: 'addresses', label: 'Adreslerim' },
    { id: 'orders', label: 'Siparişlerim' },
  ] as const;

  const renderProfileContent = () => (
    <div className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {editMode ? (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
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
              type="button"
              onClick={() => setEditMode(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Kaydet
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Profil Bilgileri</h2>
            <button
              onClick={() => setEditMode(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              Düzenle
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex border-b pb-2">
              <span className="w-1/3 text-gray-600">E-posta</span>
              <span className="w-2/3">{profile?.email}</span>
            </div>
            <div className="flex border-b pb-2">
              <span className="w-1/3 text-gray-600">Ad Soyad</span>
              <span className="w-2/3">{profile?.full_name || '-'}</span>
            </div>
            <div className="flex border-b pb-2">
              <span className="w-1/3 text-gray-600">Telefon</span>
              <span className="w-2/3">{profile?.phone || '-'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddressesContent = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Adreslerim</h2>
        <button
          onClick={() => router.push('/profile/addresses')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
              className="border rounded-lg p-4 relative hover:border-blue-300 transition-colors"
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
  );

  const renderOrdersContent = () => (
    <div className="bg-white rounded-lg shadow p-6">
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Hesabım</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'w-full flex items-center px-4 py-3 text-left rounded-lg',
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && renderProfileContent()}
            {activeTab === 'addresses' && renderAddressesContent()}
            {activeTab === 'orders' && renderOrdersContent()}
          </div>
        </div>
      </div>
    </div>
  );
} 