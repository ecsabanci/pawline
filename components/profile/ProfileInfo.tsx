'use client';

import { useState } from 'react';
import { Profile } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface ProfileInfoProps {
  profile: Profile | null;
  userId: string;
}

export default function ProfileInfo({ profile, userId }: ProfileInfoProps) {
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
  });

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
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      profile = profile ? {
        ...profile,
        full_name: formData.fullName,
        phone: formData.phone,
      } : null;
      
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Profil güncellenirken bir hata oluştu.');
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 pt-0">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {editMode ? (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Ad Soyad"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <Input
            label="Telefon"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              onClick={() => setEditMode(false)}
              variant="outline"
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="secondary"
            >
              Kaydet
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Profil Bilgileri</h2>
            <Button
              onClick={() => setEditMode(true)}
              variant="outline"
            >
              Düzenle
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex pb-5">
              <span className="w-1/3 text-gray-600 font-semibold">E-posta</span>
              <span className="w-2/3">{profile?.email}</span>
            </div>
            <div className="flex pb-5">
              <span className="w-1/3 text-gray-600 font-semibold">Ad Soyad</span>
              <span className="w-2/3">{profile?.full_name || '-'}</span>
            </div>
            <div className="flex pb-5">
              <span className="w-1/3 text-gray-600 font-semibold">Telefon</span>
              <span className="w-2/3">{profile?.phone || '-'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 