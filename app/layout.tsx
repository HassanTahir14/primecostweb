import './globals.css';
import { Poppins } from 'next/font/google';
import { ReduxProvider } from '@/store/Provider';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { TranslationProvider } from '@/context/TranslationContext';

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const metadata = {
  title: 'Prime Cost',
  description: 'Restaurant Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
      </head>
      <body className={poppins.className}>
        <CurrencyProvider>
          <ReduxProvider>
            <TranslationProvider>
              {children}
            </TranslationProvider>
          </ReduxProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}