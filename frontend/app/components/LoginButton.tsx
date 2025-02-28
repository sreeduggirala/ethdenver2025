'use client';

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface LoginButtonProps {
  onSuccess?: () => void;
}

export default function LoginButton({ onSuccess }: LoginButtonProps) {
  const { login, logout, authenticated } = usePrivy();

  const handleClick = async () => {
    if (authenticated) {
      if (onSuccess) {
        onSuccess();
      }
    } else {
      await login();
      // Note: onSuccess will be handled by watching authenticated state changes
    }
  };

  React.useEffect(() => {
    if (authenticated && onSuccess) {
      onSuccess();
    }
  }, [authenticated, onSuccess]);

  return (
    <button
      onClick={handleClick}
      className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-4 px-16 rounded-md text-2xl md:text-3xl transition-all duration-300 transform hover:scale-105 relative"
      style={{
        boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
        textShadow: "0 0 5px rgba(255, 255, 255, 0.5)",
      }}
    >
      {authenticated ? 'PLAY' : 'LOGIN'}
    </button>
  );
}
