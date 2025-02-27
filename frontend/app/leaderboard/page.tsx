import Link from "next/link"
import { TrophyIcon, ArrowUpIcon, ArrowDownIcon } from "lucide-react"

const leaderboardData = [
  { rank: 1, username: "@TopKOL", score: 1250, change: 2 },
  { rank: 2, username: "@CryptoChamp", score: 1180, change: 0 },
  { rank: 3, username: "@NFTMaster", score: 1150, change: 1 },
  { rank: 4, username: "@BlockchainBoss", score: 1100, change: -1 },
  { rank: 5, username: "@TokenTrader", score: 1050, change: 3 },
  { rank: 6, username: "@DeFiDiva", score: 1000, change: -2 },
  { rank: 7, username: "@MetaverseMogul", score: 950, change: 0 },
  { rank: 8, username: "@AltcoinAce", score: 900, change: 1 },
  { rank: 9, username: "@SmartContractStar", score: 850, change: -1 },
  { rank: 10, username: "@DAODynamo", score: 800, change: 2 },
]

export default function LeaderboardPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white p-4 md:p-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
        <TrophyIcon className="inline-block mr-2 h-10 w-10 text-yellow-400" />
        Leaderboard
      </h1>

      <div className="max-w-4xl mx-auto w-full">
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Username</th>
                <th className="py-3 px-4 text-right">Score</th>
                <th className="py-3 px-4 text-center">Change</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player) => (
                <tr key={player.rank} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                  <td className="py-3 px-4">{player.rank}</td>
                  <td className="py-3 px-4 font-medium">{player.username}</td>
                  <td className="py-3 px-4 text-right">{player.score}</td>
                  <td className="py-3 px-4 text-center">
                    {player.change > 0 && <ArrowUpIcon className="inline text-green-400 mr-1" />}
                    {player.change < 0 && <ArrowDownIcon className="inline text-red-400 mr-1" />}
                    {player.change !== 0 ? Math.abs(player.change) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-purple-400 hover:text-purple-300 underline">
          Back to Home
        </Link>
      </div>
    </main>
  )
}

