"use client"

import { PrivyProvider } from '@privy-io/react-auth';
import TeamPageComponent from '../components/TeamPageComponent';

export default function TeamPage() {
  return (
    <PrivyProvider appId="cm7p7aqcz00deec0zc4ehmngc">
      <TeamPageComponent />
    </PrivyProvider>
  )
}

