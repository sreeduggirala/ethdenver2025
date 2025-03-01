"use client";

import Link from "next/link";
import { TrophyIcon } from "@heroicons/react/24/solid";
import NFTCard from "@/app/components/nft-card";
import { useEffect, useState } from "react";
import { getBalance } from "../lib/getBalance";
import { usePrivy } from "@privy-io/react-auth";
import { routeModule } from "next/dist/build/templates/app-page";

export default function TeamPageComponent() {
  const [roster, setRoster] = useState<any[]>([{}, {}, {}, {}, {}]);
  let [balance, setBalance] = useState(0);

  useEffect(() => {
    const savedRoster = localStorage.getItem("roster");
    if (savedRoster) {
      setRoster(JSON.parse(savedRoster));
    } else {
      localStorage.setItem("roster", JSON.stringify([{}, {}, {}, {}, {}]));
    }
  }, []);

  const handleEmptySlotClick = (slotIndex: number) => {
    localStorage.setItem("selectedSlotIndex", slotIndex.toString());
  };

  const { ready, authenticated, user } = usePrivy();
  let address: any =
    user?.wallet?.address || window.localStorage.getItem("address");

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
    async function fetchBalance() {
      const bal = await getBalance(address);
      setBalance(bal);
    }
    fetchBalance();
  }, [address]);

  return (
    <main className="flex min-h-screen flex-col bg-black text-white p-4 md:p-8">
      {address ? (
        <>
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
                  <Link
                    href={`/search?index=${index}`}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/60"
                  >
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                      onClick={() => handleEmptySlotClick(index)}
                    >
                      Swap
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center mx-2"
                      onClick={async (e) => {
                        e.preventDefault();
                        const newRoster = [...roster];
                        newRoster[index] = {};
                        setRoster(newRoster);
                        localStorage.setItem("roster", JSON.stringify(newRoster));
                        balance = await getBalance(address);
                      }}
                    >
                      Remove
                    </button>
                  </Link>
                </div>
              ) : (
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
              )
            )}
          </div>
        </>
      ) : (
        <div>
          <h1>Loading...</h1>
        </div>
      )}
    </main>
  );
}
