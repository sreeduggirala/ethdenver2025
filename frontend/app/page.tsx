'use client';
import Link from "next/link"
import { CircleIcon } from "lucide-react"

import React from 'react';
import Providers from './components/Providers'; 
import LoginButton from './components/LoginButton';



export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-40 left-40 text-indigo-700 opacity-70">
        <CircleIcon size={60} strokeWidth={1.5} />
      </div>
      <div className="absolute top-60 right-60 text-indigo-700 opacity-70">
        <CircleIcon size={40} strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-60 left-60 text-indigo-700 opacity-70">
        <CircleIcon size={50} strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-40 right-40 text-indigo-700 opacity-70">
        <CircleIcon size={70} strokeWidth={1.5} />
      </div>
      <div className="absolute top-1/4 right-1/4 text-indigo-700 opacity-70">
        <CircleIcon size={45} strokeWidth={1.5} />
      </div>
      <div className="absolute bottom-1/4 left-1/4 text-indigo-700 opacity-70">
        <CircleIcon size={55} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="z-10 flex flex-col items-center justify-center text-center px-4 py-16 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-wider mb-8 font-mono">Fantasy KOL</h1>

        <p className="text-xl md:text-2xl mb-6 font-light">Fantasy Football but with KOL Wallets.</p>

        <p className="text-lg md:text-xl mb-16 font-light">Pick your starting 5. Compete. Win.</p>

        <Providers>
          <LoginButton onSuccess={() => window.location.href = '/team'} />
        </Providers>
      </div>
    </main>
  )
}

