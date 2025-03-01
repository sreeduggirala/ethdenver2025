"use client";

import Link from "next/link";
import { TrophyIcon } from "@heroicons/react/24/solid";
import NFTCard from "@/app/components/nft-card";
import { useEffect, useState } from "react";
import { getBalance } from "../lib/getBalance";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { getDraft } from "../lib/getDraft";
import kolsData from "../../data/kols.json";

export default function TeamPageComponent() {
  const [roster, setRoster] = useState<any[]>([{}, {}, {}, {}, {}]);
  const [balance, setBalance] = useState(0);
  const [initialBalance, setInitialBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showFundPopup, setShowFundPopup] = useState(false);
  const [draftedKols, setDraftedKols] = useState<string[]>([]);
  const [hasDraftedKols, setHasDraftedKols] = useState(false);
  const [teamId, setTeamId] = useState<number | null>(-1);

  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [wallet, setWallet] = useState();
  let address: any = user?.wallet?.address || window.localStorage.getItem("address");

  // Fetch drafted KOLs
  useEffect(() => {
    async function fetchDraftedKols() {
      if (address) {
        try {
          const teamId = await getTeamId(address, wallet?.chainId);
          setTeamId(teamId); 
          
          const draft = await getDraft(address);
          setDraftedKols(draft);
          
          // Check if there are any non-empty drafted KOLs
          const hasNonEmptyDraft = draft.some(wallet => wallet !== "");
          setHasDraftedKols(hasNonEmptyDraft);
          
          if (hasNonEmptyDraft) {
            // Map drafted KOL wallets to full KOL objects
            const draftedRoster = draft.map(wallet => {
              if (wallet === "") return {};
              const kol = kolsData.kols.find(k => k.wallet === wallet);
              return kol || {};
            });
            
            setRoster(draftedRoster);
            localStorage.setItem("roster", JSON.stringify(draftedRoster));
          } else {
            // If no drafted KOLs, load from localStorage
            const savedRoster = localStorage.getItem("roster");
            if (savedRoster) {
              setRoster(JSON.parse(savedRoster));
            } else {
              localStorage.setItem("roster", JSON.stringify([{}, {}, {}, {}, {}]));
            }
          }
        } catch (error) {
          console.error("Error fetching drafted KOLs:", error);
          
          // Fallback to localStorage if draft fetch fails
          const savedRoster = localStorage.getItem("roster");
          if (savedRoster) {
            setRoster(JSON.parse(savedRoster));
          } else {
            localStorage.setItem("roster", JSON.stringify([{}, {}, {}, {}, {}]));
          }
        }
      }
    }
    
    fetchDraftedKols();
  }, [address, wallet?.chainId]);

  useEffect(() => {
    if (ready && !authenticated) {
      localStorage.removeItem("roster");
      window.location.href = "/";
    }
    address = user?.wallet?.address;
    if (address != null) {
      localStorage.setItem("address", address);
    }
  }, [user, ready, authenticated]);

  useEffect(() => {
    if(wallets[0] != undefined) {
      setWallet(wallets[0]);
    }
  }, [wallets]);

  useEffect(() => {
    async function fetchBalance() {
      if (address) {
        setIsLoading(true);
        try {
          const bal = await getBalance(address, wallet?.chainId);
          setInitialBalance(bal);
          
          // Calculate total cost of current roster
          const rosterCost = roster.reduce((total, kol) => {
            return total + (kol.price || 0);
          }, 0);
          
          // Subtract roster cost from initial balance
          setBalance(bal - rosterCost);
        } catch (error) {
          console.error("Error fetching balance:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchBalance();
  }, [address, roster, wallet?.chainId]);

  const handleEmptySlotClick = (slotIndex: number) => {
    localStorage.setItem("selectedSlotIndex", slotIndex.toString());
  };

  const handleRemoveKol = async (index: number) => {
    const newRoster = [...roster];
    const removedKol = newRoster[index];
    newRoster[index] = {};
    setRoster(newRoster);
    localStorage.setItem("roster", JSON.stringify(newRoster));
    
    // Refund the removed KOL's price
    if (removedKol.price) {
      setBalance(balance + removedKol.price);
    }
  };

  const handleFundTeam = () => {
    // Logic to lock funds and finalize team
    console.log('Team funded and locked!');
    localStorage.setItem("teamLocked", "true");
    setShowFundPopup(false);
    
    // You might want to redirect to leaderboard or show a success message
    window.location.href = "/team";
  };

  return (
    <main className="flex min-h-screen flex-col bg-black text-white p-4 md:p-8">
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-2xl">Loading...</div>
        </div>
      ) : (
        <>
        {/* Join/Create Team Button - Only show if teamId is 0 */}  
        {teamId === null && (
            <div className="flex justify-center mt-8 mb-16">
              <Link href="/noteam">
                <button 
                  className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-bold text-xl py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
                >
                  Join or Create a Team
                </button>
              </Link>
            </div>
          )} : (
            <div className="flex justify-center mt-8 mb-16">{/* Fund Team Popup */}
            {/* Fund Team Popup */}
            {showFundPopup && !hasDraftedKols && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
                  <h2 className="text-2xl font-bold mb-4 text-yellow-400">Fund Your Team</h2>
                  <p className="text-gray-300 mb-6">
                    Warning: This action will lock your KOL team and funds. You won't be able to:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-2">
                    <li>Change your KOL team composition</li>
                    <li>Add, remove, or swap KOLs</li>
                    <li>Withdraw your deposited funds</li>
                  </ul>
                  <p className="text-gray-300 mb-6">
                    Are you sure you want to proceed?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleFundTeam}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-4 py-3 rounded transition-colors flex-1"
                    >
                      Confirm & Lock
                    </button>
                    <button
                      onClick={() => setShowFundPopup(false)}
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-3 rounded transition-colors flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Header with Starting 5 and Leaderboard link */}
            <div className="flex justify-between items-center mb-12 mt-4">
              <div className="border-2 border-white p-3 md:p-4 rounded-md">
                <h1 className="text-3xl md:text-4xl font-bold tracking-wider font-mono">
                  Starting 5
                </h1>
              </div>

              <div className="flex items-center space-x-12">
                <Link
                  href="/leaderboard"
                  className="flex items-center text-yellow-400 hover:text-yellow-300"
                >
                  <TrophyIcon className="h-12 w-12 mr-2" />
                  <span className="hidden md:inline text-2xl">Leaderboard</span>
                </Link>
                <div className="text-green-400 text-2xl md:text-2xl font-mono">
                  Bank: {balance}c
                </div>
              </div>
            </div>

            {/* Player Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16 mt-24">
              {roster.map((kol, index) =>
                kol.id ? (
                  <div key={index} className="relative group">
                    <NFTCard
                      imageUrl={kol.imageUrl}
                      username={kol.username}
                      backgroundColor={kol.backgroundColor}
                      price={kol.price}
                      points={kol.points}
                    />
                    {!hasDraftedKols && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60">
                        <Link
                          href={`/search?index=${index}`}
                          onClick={() => handleEmptySlotClick(index)}
                        >
                          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                            Swap
                          </button>
                        </Link>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center mx-2"
                          onClick={() => handleRemoveKol(index)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  !hasDraftedKols ? (
                    <Link
                      key={index}
                      href={`/search?index=${index}`}
                      onClick={() => handleEmptySlotClick(index)}
                    >
                      <NFTCard
                        imageUrl=""
                        username={`Slot ${index + 1}`}
                        isEmpty={true}
                      />
                    </Link>
                  ) : (
                    <div key={index}>
                      <NFTCard
                        imageUrl=""
                        username={`Empty Slot`}
                        isEmpty={true}
                      />
                    </div>
                  )
                )
              )}
            </div>
            
            {hasDraftedKols && (
              <div className="bg-yellow-800 text-white p-4 rounded-md mb-8 text-center">
                <p className="text-lg">Your team has been finalized. Good luck now, degen!</p>
              </div>
            )}

            {/* Fund Team Button - Only show if not drafted */}
            {!hasDraftedKols && (
              <div className="flex justify-center mb-16">
                <button 
                  className="bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-black font-bold text-xl py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
                  onClick={() => setShowFundPopup(true)}
                >
                  Fund Team
                </button>
              </div>
            )}</div>
          )
        </>
      )}
    </main>
  );
}
