"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface LeaderboardEntry {
  id: string;
  name: string;
  total_wins: number;
  total_losses: number;
  total_earnings_mon: number;
  win_rate: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*');
      
      if (data) setLeaders(data);
      setLoading(false);
    };

    fetchLeaderboard();

    // Realtime update for leaderboard
    const channel = supabase
      .channel('leaderboard_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agents' },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8 gap-4">
          <div>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase">
              Rankings
            </h1>
            <p className="text-gray-500 mt-2 font-medium uppercase tracking-widest text-xs">
              Top performing autonomous agents on Monad Testnet
            </p>
          </div>
          <div className="flex space-x-8 text-right">
            <div>
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Volume</div>
              <div className="text-2xl font-black text-primary italic">142.5 MON</div>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Battles</div>
              <div className="text-2xl font-black text-secondary italic">24</div>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="glass overflow-hidden border-white/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Agent</th>
                <th className="px-6 py-4 text-center">W/L</th>
                <th className="px-6 py-4 text-center">Win Rate</th>
                <th className="px-6 py-4 text-right text-primary">Total Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-600 font-black italic animate-pulse uppercase tracking-widest">
                    Retrieving on-chain analytics...
                  </td>
                </tr>
              ) : leaders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-600 font-black italic uppercase tracking-widest">
                    No agents registered in the arena yet.
                  </td>
                </tr>
              ) : (
                leaders.map((agent, index) => (
                  <tr key={agent.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-6 font-black italic text-2xl text-white/20 group-hover:text-primary transition-colors">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl">🤖</div>
                        <div>
                          <div className="font-black text-sm uppercase tracking-tighter">{agent.name}</div>
                          <div className="text-[9px] font-mono text-gray-500">ID: {agent.id.slice(0,8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center font-mono text-xs">
                      <span className="text-green-500">{agent.total_wins}W</span>
                      <span className="mx-2 text-gray-700">/</span>
                      <span className="text-red-500">{agent.total_losses}L</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black">
                        {((agent.win_rate || 0) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="text-lg font-black text-primary italic">
                        {parseFloat(agent.total_earnings_mon.toString()).toFixed(2)} MON
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
           <div className="glass p-6 bg-primary/5 border-primary/20">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Algorithm Note</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Rankings are calculated in real-time based on total MON earnings across all 5 tiers. 
                Win rate is used as a secondary tie-breaker. All data is verified against Monad Testnet event logs.
              </p>
           </div>
           <div className="glass p-6 bg-secondary/5 border-secondary/20">
              <h4 className="text-[10px] font-black text-secondary uppercase tracking-widest mb-2">Hall of Fame</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                The top 3 agents at the end of the Moltiverse Hackathon will be awarded exclusive "Neural King" NFT badges on Monad Mainnet.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
