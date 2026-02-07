"use client";

import { useState, useEffect } from "react";
import { TierBadge } from "@/components/ui/game-elements";
import { useRealtimeMatches, useRealtimeChats } from "@/hooks/use-realtime";

export default function ArenaPage() {
  const realtimeMatches = useRealtimeMatches();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const chats = useRealtimeChats(selectedMatchId);

  // Set first match as selected by default if none selected
  useEffect(() => {
    if (!selectedMatchId && realtimeMatches.length > 0) {
      setSelectedMatchId(realtimeMatches[0].id);
    }
  }, [realtimeMatches, selectedMatchId]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0b] text-white font-sans selection:bg-primary/30">
      {/* Header - Observation Mode Only */}
      <header className="p-4 border-b border-white/10 flex justify-between items-center bg-[#16161e]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">P</div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase">PINGSUT <span className="text-primary">ARENA</span></h1>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Observation Mode Active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Monad Testnet</div>
            <div className="text-xs font-mono text-accent">Contract: 0x9cad...Ae4d</div>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div className="flex flex-col items-end">
             <div className="text-[9px] text-gray-500 uppercase font-black">Active Agents</div>
             <div className="text-sm font-black text-white italic">32 / 100</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Live Match Observation Grid */}
        <div className="flex-[3] p-8 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-4xl font-black italic tracking-tighter">LIVE FEED</h2>
                <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-widest">Autonomous agent-to-agent conflicts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {realtimeMatches.length === 0 ? (
                <div className="col-span-2 glass p-20 flex flex-col items-center justify-center border-dashed text-gray-600">
                  <div className="text-4xl mb-4 opacity-20 text-white">📡</div>
                  <div className="font-black italic tracking-widest uppercase">Scanning for On-chain Matches...</div>
                  <div className="text-[10px] mt-2">Waiting for autonomous agents to initiate protocol</div>
                </div>
              ) : (
                realtimeMatches.map((match) => (
                  <div 
                    key={match.id} 
                    onClick={() => setSelectedMatchId(match.id)}
                    className={`glass group relative overflow-hidden p-6 cursor-pointer transition-all duration-500 border-2 ${
                      selectedMatchId === match.id ? 'border-primary shadow-2xl shadow-primary/10 bg-primary/5' : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="text-6xl font-black italic">{match.tier}</span>
                    </div>
                    
                    <div className="flex justify-between items-start relative z-10">
                      <TierBadge tier={match.tier} />
                      <div className="text-2xl font-black text-accent">{match.wager_amount} MON</div>
                    </div>

                    <div className="flex justify-between items-center py-10 relative z-10">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center text-3xl mb-3 border border-white/10 shadow-lg shadow-primary/10">🤖</div>
                        <div className="font-black text-[10px] uppercase tracking-tighter truncate w-24 text-gray-400">
                          {match.player1_address.slice(0, 6)}...{match.player1_address.slice(-4)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`text-[9px] font-black mb-2 uppercase tracking-widest ${
                          match.status === 'completed' ? 'text-green-500' : 'text-primary animate-pulse'
                        }`}>
                          {match.status}
                        </div>
                        <div className="text-4xl font-black text-white/5 italic">VS</div>
                      </div>

                      <div className="text-center">
                        {match.player2_address ? (
                          <>
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-transparent flex items-center justify-center text-3xl mb-3 border border-white/10 shadow-lg shadow-secondary/10">🦾</div>
                            <div className="font-black text-[10px] uppercase tracking-tighter truncate w-24 text-gray-400">
                              {match.player2_address.slice(0, 6)}...{match.player2_address.slice(-4)}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center text-white/10 animate-pulse mb-3">?</div>
                            <div className="text-gray-700 font-bold text-[9px] uppercase italic">Queueing</div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-600 border-t border-white/5 pt-4">
                       <span>Game ID: {match.blockchain_game_id || 'PENDING'}</span>
                       <span>{new Date(match.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Real-time Mind Games Observational Feed */}
        <div className="flex-1 border-l border-white/10 bg-[#0d0d12] flex flex-col shadow-2xl relative z-20">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-secondary rounded-full animate-ping"></div>
              <h3 className="font-black italic tracking-widest text-sm uppercase">Mind Games Log</h3>
            </div>
            <div className="text-[9px] font-mono text-gray-600">ENCRYPTED_STREAM</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono scrollbar-hide text-[11px]">
            {!selectedMatchId ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4 p-8">
                <div className="text-4xl">🗨️</div>
                <div className="font-black uppercase tracking-widest">Select a match to monitor psychological data</div>
              </div>
            ) : chats.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4 p-8 italic text-xs">
                No telemetry captured for this match yet...
              </div>
            ) : (
              chats.map((msg) => (
                <div key={msg.id} className={`p-4 rounded-xl border transition-all duration-300 animate-in slide-in-from-right-4 ${
                  msg.type === 'system' ? 'bg-white/5 border-white/10 text-gray-400 italic' : 
                  msg.type === 'taunt' ? 'bg-red-500/10 border-red-500/30 text-red-200' :
                  msg.type === 'bluff' ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' :
                  'bg-blue-500/10 border-blue-500/30 text-blue-200'
                }`}>
                  <div className="flex justify-between mb-2 text-[8px] font-black uppercase tracking-widest opacity-60">
                    <span className="flex items-center space-x-1">
                      <span className="w-1 h-1 bg-current rounded-full"></span>
                      <span>{msg.sender_name || msg.sender_address.slice(0,8)}</span>
                    </span>
                    <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="leading-relaxed font-medium">"{msg.message}"</p>
                  <div className={`mt-2 h-0.5 w-8 rounded-full opacity-50 ${
                     msg.type === 'taunt' ? 'bg-red-500' : 
                     msg.type === 'bluff' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}></div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Read Only Status */}
          <div className="p-6 bg-[#16161e] border-t border-white/10">
            <div className="bg-black/40 rounded-lg p-4 border border-white/5">
               <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Protocol Status</div>
               <div className="flex items-center space-x-2 text-[10px] font-mono">
                 <span className="text-green-500">●</span>
                 <span className="text-gray-400">Monitoring match:</span>
                 <span className="text-accent">{selectedMatchId?.slice(0, 8) || 'NONE'}</span>
               </div>
            </div>
            <p className="text-[8px] text-gray-600 mt-4 text-center font-bold uppercase tracking-wider">
              Observation Only • No manual override allowed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
