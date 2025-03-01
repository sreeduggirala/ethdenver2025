"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import NFTCard from '../components/nft-card'
import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import rawKolsData from '../../data/kols.json'
import { getBalance } from '../lib/getBalance'
import { usePrivy } from '@privy-io/react-auth'
import { getDraft } from '../lib/getDraft'

export default function SearchPage() {
  const [roster, setRoster] = useState<any[]>([{}, {}, {}, {}, {}])
  const [balance, setBalance] = useState<number>(0)
  const [initialBalance, setInitialBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [draftedKols, setDraftedKols] = useState<string[]>([])
  const [hasDraftedKols, setHasDraftedKols] = useState(false)
  const [availableKols, setAvailableKols] = useState<any[]>([])
  const [allKols, setAllKols] = useState<any[]>([])
  
  const { user } = usePrivy()
  const address = user?.wallet?.address || window.localStorage.getItem("address")

  // Load all KOLs from JSON file
  useEffect(() => {
    // Ensure we're getting all KOLs from the JSON file
    console.log("Raw KOLs data:", rawKolsData);
    
    if (rawKolsData && rawKolsData.kols && Array.isArray(rawKolsData.kols)) {
      // Store the complete KOL objects without any transformation
      setAllKols(rawKolsData.kols);
      console.log("All KOLs loaded:", rawKolsData.kols.length);
      
      // Log the first and last KOL to verify all properties are present
      if (rawKolsData.kols.length > 0) {
        const firstKol = rawKolsData.kols[0];
        const lastKol = rawKolsData.kols[rawKolsData.kols.length - 1];
        
        console.log("First KOL with all properties:", firstKol);
        console.log("First KOL properties:", Object.keys(firstKol));
        console.log("First KOL points value:", firstKol.points);
        
        console.log("Last KOL with all properties:", lastKol);
        console.log("Last KOL properties:", Object.keys(lastKol));
        console.log("Last KOL points value:", lastKol.points);
      }
    } else {
      console.error("Invalid KOLs data structure:", rawKolsData);
    }
  }, []);

  // Load roster from localStorage
  useEffect(() => {
    const savedRoster = localStorage.getItem('roster')
    if (savedRoster) {
      setRoster(JSON.parse(savedRoster))
    } else {
      localStorage.setItem("roster", JSON.stringify([{}, {}, {}, {}, {}]));
    }
  }, [])

  // Check for drafted KOLs
  useEffect(() => {
    async function fetchDraftedKols() {
      if (address) {
        try {
          const draft = await getDraft(address)
          setDraftedKols(draft)
          
          // Check if there are any non-empty drafted KOLs
          const hasNonEmptyDraft = draft.some(wallet => wallet !== "")
          setHasDraftedKols(hasNonEmptyDraft)
          
          if (hasNonEmptyDraft) {
            // If user has drafted KOLs, redirect back to team page
            window.location.href = '/team'
          }
        } catch (error) {
          console.error("Error fetching drafted KOLs:", error)
        }
      }
    }
    
    fetchDraftedKols()
  }, [address])

  // Fetch balance and calculate available KOLs
  useEffect(() => {
    async function fetchBalanceAndKols() {
      if (address && allKols.length > 0) {
        setIsLoading(true)
        try {
          const bal = await getBalance(address)
          setInitialBalance(bal)
          
          // Calculate total cost of current roster
          const rosterCost = roster.reduce((total, kol) => {
            return total + (kol.price || 0)
          }, 0)
          
          // Subtract roster cost from initial balance
          const availableBalance = bal - rosterCost
          setBalance(availableBalance)
          
          // Get IDs of KOLs in the roster (excluding empty slots)
          const rosterIds = roster
            .filter(item => item && item.id)
            .map(item => item.id)
          
          console.log("Roster IDs:", rosterIds);
          console.log("All KOLs count (from state):", allKols.length);
          
          // Filter out KOLs that are already in the roster
          // This preserves ALL properties of each KOL object
          const filteredKols = allKols.filter(kol => !rosterIds.includes(kol.id));
          console.log("Filtered KOLs count:", filteredKols.length);
          
          // Verify that points are preserved in the filtered KOLs
          if (filteredKols.length > 0) {
            console.log("Sample filtered KOL with all properties:", filteredKols[0]);
            console.log("Sample filtered KOL points:", filteredKols[0].points);
          }
          
          setAvailableKols(filteredKols)
        } catch (error) {
          console.error("Error fetching balance:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    fetchBalanceAndKols()
  }, [address, roster, allKols])

  const handleKolSelection = async (kol: any) => {
    // Check if user has enough balance
    if (balance < kol.price) {
      alert("Insufficient balance to purchase this KOL")
      return
    }

    const index = (new URLSearchParams(window.location.search)).get("index") || "0"
    const indexNum = parseInt(index)
    
    // Get current roster
    let currentRoster = JSON.parse(window.localStorage.getItem("roster")) || []
    
    // Check if replacing an existing KOL (refund their price)
    let refundAmount = 0
    if (currentRoster[indexNum] && currentRoster[indexNum].price) {
      refundAmount = currentRoster[indexNum].price
    }
    
    // Update roster with the complete KOL object (including points)
    currentRoster[indexNum] = kol
    window.localStorage.setItem("roster", JSON.stringify(currentRoster))
    
    // Redirect back to team page
    window.location.href = `/team?index=${index}`
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-2xl">Loading...</div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/team" className="mr-4 text-gray-400 hover:text-white">
                <ArrowLeftIcon className="h-6 w-6" />
              </Link>
              <h1 className="text-3xl font-bold">Select KOL</h1>
            </div>
            <div className="text-green-400 text-xl md:text-2xl font-mono">Bank: {balance}c</div>
          </div>

          {/* Debug Info */}
          <div className="mb-4 text-gray-400">
            <p>Available KOLs: {availableKols.length}</p>
          </div>

          {/* KOL Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {availableKols.length > 0 ? (
              availableKols.map((kol) => (
                <div
                  key={kol.id}
                  className={`relative cursor-pointer group ${balance < kol.price ? 'opacity-50' : ''}`}
                  onClick={() => balance >= kol.price && handleKolSelection(kol)}
                >
                  <NFTCard
                    imageUrl={kol.imageUrl}
                    username={kol.username}
                    backgroundColor={kol.backgroundColor}
                    price={kol.price}
                    points={kol.points}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {balance >= kol.price ? (
                      <span className="text-white font-semibold text-lg">Buy Now</span>
                    ) : (
                      <span className="text-red-400 font-semibold text-lg">Insufficient Funds</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-gray-400">No available KOLs found. Your roster may be full.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}

