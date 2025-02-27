"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { SearchIcon } from "lucide-react"
import NFTCard from "@/components/nft-card"

// Mock data for KOLs
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
  {
    id: 6,
    username: "@MetaverseMonarch",
    imageUrl: "/placeholder.svg?height=200&width=200",
    backgroundColor: "bg-red-200",
  },
]

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState(mockKOLs)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    const filteredResults = mockKOLs.filter((kol) => kol.username.toLowerCase().includes(term.toLowerCase()))
    setSearchResults(filteredResults)
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-white p-4 md:p-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">Search KOLs</h1>

      <div className="max-w-4xl mx-auto w-full mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for KOLs..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-purple-500"
          />
          <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {searchResults.map((kol) => (
          <NFTCard key={kol.id} imageUrl={kol.imageUrl} username={kol.username} backgroundColor={kol.backgroundColor} />
        ))}
      </div>

      {searchResults.length === 0 && <p className="text-center text-gray-400 mt-8">No results found.</p>}

      <div className="mt-8 text-center">
        <Link href="/" className="text-purple-400 hover:text-purple-300 underline">
          Back to Home
        </Link>
      </div>
    </main>
  )
}

