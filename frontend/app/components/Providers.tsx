'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cm7p7aqcz00deec0zc4ehmngc" // replace with your actual app id
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: 'https://texarg.com/wp-content/uploads/2022/12/cropped-texarg-2.png', // replace with your logo URL
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
