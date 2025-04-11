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

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
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
                    <Link href="/profile" className="text-gray-600 hover:text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Çıkış Yap
                    </button>
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
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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
                      className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
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
                                className={`${
                                  active ? 'bg-pink-50 text-pink-700' : 'text-gray-700'
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