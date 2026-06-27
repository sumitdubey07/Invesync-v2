import { useState, useEffect } from 'react'
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import Layout from '../components/Layout'
import { getLeaderboard } from '../api/stocks'
import { useAuth } from '../context/AuthContext'

const medals = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { user } = useAuth()
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard()
      .then((res) => setRankings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const myRank = rankings.find((r) =>
    r.email.startsWith(user?.email?.slice(0, 2))
  )

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Trophy size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-slate-400 text-sm">Top traders ranked by portfolio returns</p>
          </div>
        </div>

        {/* Top 3 podium */}
        {!loading && rankings.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[rankings[1], rankings[0], rankings[2]].map((r, i) => {
              const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3
              const isUp = r.returns >= 0
              const heights = ['h-28', 'h-36', 'h-24']
              return (
                <div key={r.email} className={`flex flex-col items-center justify-end ${heights[i]}`}>
                  <div className={`w-full rounded-xl p-4 text-center border ${
                    actualRank === 1
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : actualRank === 2
                      ? 'bg-gray-500/10 border-gray-500/30'
                      : 'bg-orange-500/10 border-orange-500/30'
                  }`}>
                    <p className="text-2xl mb-1">{medals[actualRank - 1]}</p>
                    <p className="text-white font-semibold text-sm truncate">{r.name}</p>
                    <p className={`text-sm font-bold mt-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                      {isUp ? '+' : ''}{r.returns}%
                    </p>
                    <p className="text-slate-300 text-xs mt-1">
                      ₹{r.totalValue.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Full rankings table */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-white font-semibold">All Traders</h2>
            <span className="text-slate-400 text-xs">Updated every 2 min</span>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <p className="text-slate-300 text-sm">Loading rankings...</p>
            </div>
          ) : rankings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-300 text-sm">No traders yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-300 text-xs uppercase border-b border-slate-700 bg-slate-800">
                  <th className="px-6 py-3 text-left">Rank</th>
                  <th className="px-6 py-3 text-left">Trader</th>
                  <th className="px-6 py-3 text-right">Portfolio Value</th>
                  <th className="px-6 py-3 text-right">Cash</th>
                  <th className="px-6 py-3 text-right">Returns</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => {
                  const isUp = r.returns >= 0
                  const isMe = r.email.startsWith(user?.email?.slice(0, 2))
                  return (
                    <tr
                      className={`border-b border-[#2a2a3d] last:border-0 transition-colors ${
                        isMe ? 'bg-purple-500/5 border-purple-500/20' : 'hover:bg-[#2a2a3d]'
                        }`}
                    >
                      <td className="px-6 py-4">
                        {r.rank <= 3 ? (
                          <span className="text-lg">{medals[r.rank - 1]}</span>
                        ) : (
                          <span className="text-slate-400 font-mono text-sm">#{r.rank}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {r.name}
                              {isMe && (
                                <span className="ml-2 text-xs text-purple-400 font-normal">(you)</span>
                              )}
                            </p>
                            <p className="text-slate-400 text-xs">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="text-white font-semibold">
                          ₹{r.totalValue.toLocaleString('en-IN')}
                        </p>
                        <p className="text-slate-400 text-xs">
                          Holdings: ₹{r.holdingsValue.toLocaleString('en-IN')}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-200 font-medium">
                        ₹{r.balance.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`flex items-center justify-end gap-1 font-bold ${
                          isUp ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {isUp ? '+' : ''}{r.returns}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}
