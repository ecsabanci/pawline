'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/lib/supabase';
import Button from '@/components/ui/Button';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const cartItemCount = useSelector((state: RootState) =>
    Object.values(state.cart.items).reduce((total, item) => total + (item?.quantity || 0), 0)
  );

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name_tr');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data);
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }

      setIsAdmin(data?.is_admin || false);
    };

    checkAdminStatus();
  }, [user]);

  const mainCategories = categories.filter(cat => !cat.parent_id);
  const getSubCategories = (parentId: string) =>
    categories.filter(cat => cat.parent_id === parentId);

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="text-xl flex items-center gap-2 font-bold text-gray-100 bg-pink-700 p-2 rounded-md">
            Pawline
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffff"><path d="M180-475q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180-160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm240 0q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Zm180 160q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM266-75q-45 0-75.5-34.5T160-191q0-52 35.5-91t70.5-77q29-31 50-67.5t50-68.5q22-26 51-43t63-17q34 0 63 16t51 42q28 32 49.5 69t50.5 69q35 38 70.5 77t35.5 91q0 47-30.5 81.5T694-75q-54 0-107-9t-107-9q-54 0-107 9t-107 9Z" /></svg>
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/cart" className="relative">
              <span className="sr-only">Sepet</span>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M240-80q-33 0-56.5-23.5T160-160v-480q0-33 23.5-56.5T240-720h80q0-66 47-113t113-47q66 0 113 47t47 113h80q33 0 56.5 23.5T800-640v480q0 33-23.5 56.5T720-80H240Zm0-80h480v-480h-80v80q0 17-11.5 28.5T600-520q-17 0-28.5-11.5T560-560v-80H400v80q0 17-11.5 28.5T360-520q-17 0-28.5-11.5T320-560v-80h-80v480Zm160-560h160q0-33-23.5-56.5T480-800q-33 0-56.5 23.5T400-720ZM240-160v-480 480Z" /></svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {String(cartItemCount)}
                </span>
              )}
            </Link>

            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="text-pink-600 hover:text-pink-700 font-medium"
                      >
                        Admin Paneli
                      </Link>
                    )}
                    <Link href="/profile" className="text-gray-600 hover:text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#00000"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" /></svg>
                    </Link>
                    <Button
                      onClick={() => signOut()}
                      variant="danger"
                    >
                      Çıkış Yap
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/auth/login"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-indigo-700 text-white px-4 py-2 rounded"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Category Menu */}
        <div className="flex items-center space-x-8">
          {mainCategories.map((category) => (
            <Menu as="div" key={category.id} className="relative">
              {({ open }) => (
                <>
                  <Menu.Button className="text-gray-700 hover:text-pink-700 font-medium py-2 cursor-pointer inline-flex items-center">
                    {category.name_tr}
                    <svg
                      className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${open ? 'rotate-180' : ''
                        }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute left-0 top-full w-64 bg-white rounded-lg shadow-lg py-1 focus:outline-none z-50">
                      <div className="px-1 py-1">
                        {getSubCategories(category.id).map((subCategory) => (
                          <Menu.Item key={subCategory.id}>
                            {({ active }) => (
                              <Link
                                href={`/categories/${category.slug}/${subCategory.slug}`}
                                className={`${active ? 'bg-pink-50 text-pink-700' : 'text-gray-700'
                                  } group flex w-full items-center rounded-md px-4 py-2 text-sm transition-colors duration-150`}
                              >
                                {subCategory.name_tr}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </>
              )}
            </Menu>
          ))}
        </div>
      </nav>
    </header>
  );
} 