"use client"

import { PrivyProvider } from '@privy-io/react-auth';
import LeaderPageComponent from '../components/LeaderPageCompontent';

export default function TeamPage() {
  return (
    <PrivyProvider appId="cm7p7aqcz00deec0zc4ehmngc">
      <LeaderPageComponent />
    </PrivyProvider>
  )
}

