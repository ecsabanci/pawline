'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Profile, Address, Order } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import ProfileInfo from '@/components/profile/ProfileInfo';
import AddressList from '@/components/profile/AddressList';
import OrderList from '@/components/profile/OrderList';
import FavoriteList from '@/components/profile/FavoriteList';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

type TabType = 'profile' | 'addresses' | 'orders' | 'favorites';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const tabs = [
    { id: 'profile', label: 'Profil Bilgileri' },
    { id: 'addresses', label: 'Adreslerim' },
    { id: 'orders', label: 'Siparişlerim' },
    { id: 'favorites', label: 'Favorilerim' },
  ] as const;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Hesabım</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? 'primary' : 'outline'}
                  fullWidth
                  className={clsx(
                    'justify-start',
                    activeTab === tab.id
                      ? 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-100'
                      : 'hover:bg-gray-50'
                  )}
                >
                  {tab.label}
                </Button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            {activeTab === 'profile' && <ProfileInfo profile={profile} userId={user?.id || ''} />}
            {activeTab === 'addresses' && <AddressList addresses={addresses} />}
            {activeTab === 'orders' && <OrderList orders={orders} />}
            {activeTab === 'favorites' && <FavoriteList userId={user?.id || ''} />}
          </div>
        </div>
      </div>
    </div>
  );
} 