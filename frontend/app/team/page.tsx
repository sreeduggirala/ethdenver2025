"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { SearchIcon, TrophyIcon } from "lucide-react"
import NFTCard from "@/components/nft-card"

// Mock data for KOLs (you would fetch this from an API in a real application)
const mockKOLs = [
  { id: 1, username: "@CryptoKing", imageUrl: "/placeholder.svg?height=200&width=200", backgroundColor: "bg-blue-200" },
  { id: 2, username: "@NFTQueen", imageUrl: "/placeholder.svg?height=200&width=200", backgroundColor: "bg-pink-200" },
  {
    id: 3,
    username: "@BlockchainBaron",
    imageUrl: "/placeholder.svg?height=200&width=200",
    backgroundColor: "bg-green-200",
  },
  {
    id: 4,
    username: "@TokenTitan",
    imageUrl: "/placeholder.svg?height=200&width=200",
    backgroundColor: "bg-yellow-200",
  },
  { id: 5, username: "@DeFiDuke", imageUrl: "/placeholder.svg?height=200&width=200", backgroundColor: "bg-purple-200" },
]

export default function TeamPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setShowSearchResults(e.target.value.length > 0)
  }

  const filteredKOLs = mockKOLs.filter((kol) => kol.username.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <main className="flex min-h-screen flex-col bg-black text-white p-4 md:p-8">
      {/* Header with Starting 5, Search, and Leaderboard link */}
      <div className="flex justify-between items-center mb-12 mt-4">
        <div className="border-2 border-white p-3 md:p-4 rounded-md">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider font-mono">Starting 5</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search KOLs..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="bg-gray-800 text-white border-2 border-gray-700 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-purple-500"
            />
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          </div>

          <Link href="/leaderboard" className="flex items-center text-yellow-400 hover:text-yellow-300">
            <TrophyIcon className="h-6 w-6 mr-2" />
            <span className="hidden md:inline">Leaderboard</span>
          </Link>

          <div className="text-green-400 text-xl md:text-2xl font-mono">Bank: 50c</div>
        </div>
      </div>

      {/* Search Results Popup */}
      {showSearchResults && (
        <div className="fixed top-20 right-4 w-64 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Search Results</h3>
            {filteredKOLs.length > 0 ? (
              filteredKOLs.map((kol) => (
                <div
                  key={kol.id}
                  className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-gray-700 p-2 rounded"
                >
                  <Image
                    src={kol.imageUrl || "/placeholder.svg"}
                    alt={kol.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span>{kol.username}</span>
                </div>
              ))
            ) : (
              <p>No results found</p>
            )}
          </div>
        </div>
      )}

      {/* Player Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
        <NFTCard imageUrl="/placeholder.svg?height=200&width=200" username="@KOL1" backgroundColor="bg-gray-300" />
        <NFTCard imageUrl="/placeholder.svg?height=200&width=200" username="@KOL2" backgroundColor="bg-green-200" />
        <NFTCard imageUrl="/placeholder.svg?height=200&width=200" username="@KOL3" backgroundColor="bg-pink-300" />
        <NFTCard imageUrl="" username="@KOL4" isEmpty={true} />
        <NFTCard imageUrl="" username="@KOL5" isEmpty={true} />
      </div>

      {/* Bench Section */}
      <div className="border-2 border-white rounded-lg p-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-mono mb-6">Bench:</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border-2 border-white rounded-md flex items-center justify-center aspect-square">
            <span className="text-xl font-mono transform -rotate-45">search</span>
          </div>
          <div className="border-2 border-white rounded-md flex items-center justify-center aspect-square">
            <span className="text-xl font-mono transform -rotate-45">search</span>
          </div>
        </div>
      </div>

      {/* Navigation back to home */}
      <div className="mt-8 text-center">
        <Link href="/" className="text-purple-400 hover:text-purple-300 underline">
          Back to Home
        </Link>
      </div>
    </main>
  )
}

