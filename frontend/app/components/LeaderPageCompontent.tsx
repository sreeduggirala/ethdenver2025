"use client"

import Link from "next/link"
import { TrophyIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react"
import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth';
import { routeModule } from "next/dist/build/templates/app-page"
import { getMembersFromTeam } from "../lib/getMembersFromTeam";
import { getPointsFromTeam } from "../lib/getPointsFromTeam";
import { getTeamId } from "../lib/getTeamId";
import CreateGroupPopup from "./CreateGroupPopup";
import JoinGroupPopup from "./JoinGroupPopup";


export default function LeaderPageComponent() {
    const [players, setPlayers] = useState<Array<{
        address: string;
        points: number;
        rank: number;
    }>>([]);
    const [teamId, setTeamId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const { ready, authenticated, user } = usePrivy();
    let address: any = user?.wallet?.address || window.localStorage.getItem("address");
    const [isCopied, setIsCopied] = useState(false);
    const [showCreateGroupPopup, setShowCreateGroupPopup] = useState(false);
    const [showJoinGroupPopup, setShowJoinGroupPopup] = useState(false);
    const [showPrizePopup, setShowPrizePopup] = useState(false);

    const copyTeamId = async () => {
        try {
            await navigator.clipboard.writeText(teamId?.toString() || '');
            setIsCopied(true);
            // Reset "Copied" text after 2 seconds
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    useEffect(() => {
        async function fetchTeamId() {
            if (address) {
                try {
                    const id = await getTeamId(address);
                    setTeamId(id);
                    setIsLoading(false);
                } catch (error) {
                    console.error("Error fetching team ID:", error);
                }
            }
        }
        fetchTeamId();
    }, [address]);

    useEffect(() => {
        async function fetchAndSortPlayers() {
            if (teamId && teamId !== 0) {
                try {
                    const members = await getMembersFromTeam(teamId);
                    const points = await getPointsFromTeam(teamId);

                    // Combine members and points, filter out empty addresses
                    const combinedData = members
                        .map((address, index) => ({
                            address: address,
                            points: points[index],
                            rank: 0 // will be set after sorting
                        }))
                        .filter(player => player.address !== "");

                    // Sort by points (descending) and assign ranks
                    const sortedPlayers = combinedData
                        .sort((a, b) => b.points - a.points)
                        .map((player, index) => ({
                            ...player,
                            rank: index + 1
                        }));

                    setPlayers(sortedPlayers);
                } catch (error) {
                    console.error("Error fetching player data:", error);
                }
            }
        }

        fetchAndSortPlayers();
    }, [teamId]);

    useEffect(() => {
        if(ready && !authenticated) {
        localStorage.removeItem("roster")
        window.location.href = "/";
        }
        address = user?.wallet?.address;
        if(address != null) {
        localStorage.setItem("address", address);
        }
    }, [user, ready, authenticated]);

    const handleEmptySlotClick = (slotIndex: number) => {
        localStorage.setItem('selectedSlotIndex', slotIndex.toString())
    }

    const handleCreateGroup = (depositAmount: number) => {
        // Implement group creation logic here using depositAmount
        console.log(`Creating new group with ${depositAmount} RLUSD deposit requirement`);
        setShowCreateGroupPopup(false);
    };

    const handleJoinGroup = (teamId: number) => {
        // Implement group joining logic here using teamId
        console.log(`Joining group with ID: ${teamId}`);
        setShowJoinGroupPopup(false);
    };

    const handleGetPrize = () => {
        setShowPrizePopup(true);
    };

    return (
        <main className="flex min-h-screen flex-col bg-black text-white p-4 md:p-8">
            {isLoading ? (
                <div className="flex items-center justify-center h-screen">
                  <div className="text-2xl">Loading...</div>
                </div>
              ) : (
                <>
                    <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
                        <TrophyIcon className="inline-block mr-2 h-16 w-16 text-yellow-400" />
                        {teamId === 0 ? 'Welcome!' : 'Leaderboard'}
                    </h1>

                    {/* Create Group Popup */}
                    <CreateGroupPopup 
                        isOpen={showCreateGroupPopup}
                        onClose={() => setShowCreateGroupPopup(false)}
                        onCreateGroup={handleCreateGroup}
                    />

                    {/* Join Group Popup */}
                    <JoinGroupPopup 
                        isOpen={showJoinGroupPopup}
                        onClose={() => setShowJoinGroupPopup(false)}
                        onJoinGroup={handleJoinGroup}
                    />

                    {/* Get Prize Popup */}
                    {showPrizePopup && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                            <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full border-4 border-yellow-500">
                                <h2 className="text-2xl font-bold mb-4 text-yellow-400">🏆 Claim Your Prize</h2>
                                <p className="mb-4">
                                    Congratulations! You are eligible to claim your prize.
                                </p>
                                <p className="mb-6">
                                    Your prize will be sent to your connected wallet address:
                                    <span className="block mt-2 bg-gray-700 p-2 rounded font-mono text-sm overflow-hidden text-ellipsis">
                                        {address}
                                    </span>
                                </p>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
                                        onClick={() => setShowPrizePopup(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold rounded hover:from-yellow-500 hover:to-yellow-300"
                                        onClick={() => {
                                            setShowPrizePopup(false);
                                        }}
                                    >
                                        Claim Prize
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showPopup && teamId && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
                                <h2 className="text-2xl font-bold mb-4">Invite Players</h2>
                                <p className="text-gray-300 mb-4">Share this team ID with players you want to invite:</p>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="bg-gray-700 p-3 rounded flex-grow text-center">
                                        <span className="font-mono text-xl">{teamId}</span>
                                    </div>
                                    <button
                                        onClick={copyTeamId}
                                        className={`px-4 py-3 rounded transition-colors ${
                                            isCopied 
                                                ? 'bg-green-500 hover:bg-green-600' 
                                                : 'bg-blue-500 hover:bg-blue-600'
                                        }`}
                                    >
                                        {isCopied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {teamId === 0 ? (
                        <div className="flex flex-col items-center gap-6 mt-8">
                            <p className="text-xl text-gray-300">You're not part of any team yet!</p>
                            <div className="flex gap-4">
                                <button
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md mr-40 transition-colors mt-16"
                                    onClick={() => setShowCreateGroupPopup(true)}
                                >
                                    Create Group
                                </button>
                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors mt-16"
                                    onClick={() => setShowJoinGroupPopup(true)}
                                >
                                    Join Group
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="max-w-4xl mx-auto w-full">
                                <div className="bg-gray-800 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-700">
                                                <th className="py-3 px-4 text-left">Rank</th>
                                                <th className="py-3 px-4 text-left">Address</th>
                                                <th className="py-3 px-4 text-right">Points</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {players.map((player) => (
                                                <tr key={player.address} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                                                    <td className="py-3 px-4">{player.rank}</td>
                                                    <td className="py-3 px-4 font-medium">{player.address}</td>
                                                    <td className="py-3 px-4 text-right">{player.points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-8 text-center space-y-4">
                                <div className="flex justify-center gap-14 mb-8 mt-16">
                                    <button
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to leave this group?')) {
                                                // Add leave group logic here
                                                console.log('Leaving group...');
                                            }
                                        }}
                                    >
                                        Leave Group
                                    </button>
                                    {/* Get Prize Button */}
                                    <button 
                                        className="bg-gradient-to-r from-yellow-500 to-yellow-300 hover:from-yellow-400 hover:to-yellow-200 text-black font-bold px-4 py-2 rounded-md shadow-lg transform transition-all duration-300 hover:scale-105 border-2 border-yellow-600"
                                        onClick={handleGetPrize}
                                    >
                                        Get Prize
                                    </button>
                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
                                        onClick={() => setShowPopup(true)}
                                    >
                                        Invite Players
                                    </button>
                                </div>

                                <div>
                                    <Link href="/team" className="text-purple-400 hover:text-purple-300 underline">
                                        Back to Team
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </main>
    );
}

