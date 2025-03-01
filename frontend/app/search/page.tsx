"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import NFTCard from '../components/nft-card'
import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import kolsData from '../../data/kols.json'
export default function SearchPage() {
  const [roster, setRoster] = useState<any[]>([{}, {}, {}, {}, {}])
  useEffect(() => {
    const savedRoster = localStorage.getItem('roster')
    if (savedRoster) {
      setRoster(JSON.parse(savedRoster))
    } else {
      localStorage.setItem("roster", JSON.stringify([{}, {}, {}, {}, {}]));
    }
  }, [])
  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/team" className="mr-4 text-gray-400 hover:text-white">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <h1 className="text-3xl font-bold">Select KOL</h1>
          </div>
          <div className="text-green-400 text-xl md:text-2xl font-mono">Bank: 50c</div>
        </div>

        {/* KOL Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {kolsData.kols.filter(kol => !roster.map(kol => kol.wallet).includes(kol.wallet)).map((kol) => (
            <div
              key={kol.id}
              className="relative cursor-pointer group"
              onClick={() => {
                // Handle KOL selection/purchase here
                // Then redirect back to team page
                const index = (new URLSearchParams(window.location.search)).get("index") || 0;
                let roster = JSON.parse(window.localStorage.getItem("roster")) || [];
                roster[index] = kol;
                window.localStorage.setItem("roster", JSON.stringify(roster));
                window.location.href = `/team?index=${index}`
              }}
            >
              <NFTCard
                imageUrl={kol.imageUrl}
                username={kol.username}
                backgroundColor={kol.backgroundColor}
                price={kol.price}
                points={kol.points}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-white font-semibold text-lg">Buy Now</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

