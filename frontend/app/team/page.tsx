"use client"

import { PrivyProvider } from '@privy-io/react-auth';
import TeamPageComponent from '../components/TeamPageComponent';
import NoTeamComponent from '../components/NoTeamComponent';
import { useState, useEffect } from 'react';

export default function TeamPage() {
  const [hasTeam, setHasTeam] = useState(false);
  
  // You'll need to implement logic to check if user has a team
  // This is a placeholder - replace with your actual team checking logic
  useEffect(() => {
    // Example: Check if user has a team
    // const checkTeam = async () => {
    //   const userHasTeam = await checkIfUserHasTeam();
    //   setHasTeam(userHasTeam);
    // };
    // checkTeam();
  }, []);

  return (
    <PrivyProvider appId="cm7p7aqcz00deec0zc4ehmngc">
      {hasTeam ? <TeamPageComponent /> : <NoTeamComponent />}
    </PrivyProvider>
  )
}

