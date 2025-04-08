import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from '@/store/provider';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Pawline - Pet Ürünleri',
  description: 'En kaliteli pet ürünleri',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
} 