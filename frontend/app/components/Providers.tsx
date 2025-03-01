'use client';

import React from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="cm7p7aqcz00deec0zc4ehmngc" // replace with your actual app id
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#7133ea',
          logo: '/fantasy_kol_logo.png',
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
