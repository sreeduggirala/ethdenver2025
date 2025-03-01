"use client"

import type React from "react"

import Link from "next/link"
import { TrophyIcon, ArrowsUpDownIcon } from "@heroicons/react/24/solid"
import NFTCard from "@/app/components/nft-card"
import kolsData from '../../data/kols.json'

export default function TeamPage() {
  // Get first 3 KOLs for demonstration
  const selectedKols = kolsData.kols.slice(0, 3)

  return (
    <main className="flex min-h-screen flex-col bg-black text-white p-4 md:p-8">
      {/* Header with Starting 5 and Leaderboard link */}
      <div className="flex justify-between items-center mb-12 mt-4">
        <div className="border-2 border-white p-3 md:p-4 rounded-md">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider font-mono">Starting 5</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/leaderboard" className="flex items-center text-yellow-400 hover:text-yellow-300">
            <TrophyIcon className="h-6 w-6 mr-2" />
            <span className="hidden md:inline">Leaderboard</span>
          </Link>

          <div className="text-green-400 text-xl md:text-2xl font-mono">Bank: 50c</div>
        </div>
      </div>

      {/* Player Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
        {selectedKols.map((kol) => (
          <div key={kol.id} className="relative group">
            <NFTCard 
              imageUrl={kol.imageUrl}
              username={kol.username}
              backgroundColor={kol.backgroundColor}
              price={kol.price}
              points={kol.points}
            />
            <Link href="/search" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60">
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                <ArrowsUpDownIcon className="h-5 w-5 mr-2" />
                Swap
              </button>
            </Link>
          </div>
        ))}
        <Link href="/search">
          <NFTCard imageUrl="" username="@KOL4" isEmpty={true} />
        </Link>
        <Link href="/search">
          <NFTCard imageUrl="" username="@KOL5" isEmpty={true} />
        </Link>
      </div>

    </main>
  )
}

