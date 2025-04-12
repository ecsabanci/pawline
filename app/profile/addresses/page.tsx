'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Address } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function AddressesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    addressLine: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isDefault: false,
  });

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Adresler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchAddresses();
  }, [user, router, fetchAddresses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // If setting as default, update all other addresses to not default
      if (formData.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user?.id);
      }

      const { error } = await supabase
        .from('addresses')
        .insert([
          {
            user_id: user?.id,
            title: formData.title,
            address_line1: formData.addressLine,
            address_line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
            is_default: formData.isDefault,
          },
        ]);

      if (error) throw error;

      setFormData({
        title: '',
        addressLine: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        isDefault: false,
      });
      setShowAddForm(false);
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
      setError('Adres eklenirken bir hata oluştu.');
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      setError('Adres silinirken bir hata oluştu.');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // First, set all addresses to not default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      setError('Varsayılan adres ayarlanırken bir hata oluştu.');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Adreslerim</h1>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`px-4 py-2 border border-gray-300 rounded-md cursor-pointer ${showAddForm ? 'text-gray-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            {showAddForm ? 'İptal' : 'Yeni Adres Ekle'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Yeni Adres Ekle</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Adres Başlığı"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ev, İş vb."
              />
              <Input
                label="Adres"
                type="text"
                required
                value={formData.addressLine}
                onChange={(e) => setFormData({ ...formData, addressLine: e.target.value })}
                placeholder="Sokak, Mahalle, Bina No"
              />
              <Input
                label="Adres Detayı"
                type="text"
                required
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })} 
                placeholder="Apartman, Daire No"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Şehir"
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  label="İlçe"
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
                <Input
                  label="Posta Kodu"
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
              <Input
                label="Ülke"
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                  Varsayılan adres olarak ayarla
                </label>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                >
                  Kaydet
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {addresses.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Henüz kayıtlı adresiniz bulunmuyor.</p>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-lg shadow p-6 relative"
              >
                {address.is_default && (
                  <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    Varsayılan
                  </span>
                )}
                <h3 className="font-semibold text-lg">{address.title}</h3>
                <p className="text-gray-600 mt-2">{address.address_line1}</p>
                <p className="text-gray-600 mt-2">{address.address_line2}</p>
                <p className="text-gray-600">{address.city} - {address.state} - {address.country} - {address.postal_code}</p>
                <div className="mt-4 flex justify-end space-x-3">
                  {!address.is_default && (
                    <Button
                      onClick={() => handleSetDefault(address.id)}
                      variant="primary"
                    >
                      Varsayılan Yap
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(address.id)}
                    variant="danger"
                  >
                    Sil
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 