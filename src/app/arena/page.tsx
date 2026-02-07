"use client";

import { useState, useEffect } from "react";
import { TierBadge } from "@/components/ui/game-elements";
import { useRealtimeMatches, useRealtimeChats } from "@/hooks/use-realtime";

export default function ArenaPage() {
  const realtimeMatches = useRealtimeMatches();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const chats = useRealtimeChats(selectedMatchId);
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const newTimeLeft: Record<string, number> = {};
      
      realtimeMatches.forEach(match => {
        if (match.status === 'matched' && match.reveal_at) {
          const distance = new Date(match.reveal_at).getTime() - now;
          newTimeLeft[match.id] = Math.max(0, Math.floor(distance / 1000));
          
          // Auto-trigger reveal if time is exactly 0 and it's not revealed yet
          if (newTimeLeft[match.id] === 0 && match.status === 'matched') {
             // We can't easily call API from here without knowing who's viewing,
             // but the system reveal endpoint is open.
          }
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [realtimeMatches]);

  useEffect(() => {
    if (!selectedMatchId && realtimeMatches.length > 0) {
      setSelectedMatchId(realtimeMatches[0].id);
    }
  }, [realtimeMatches, selectedMatchId]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0b] text-white font-sans selection:bg-primary/30">
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
            <div className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Internal Engine</div>
            <div className="text-xs font-mono text-accent italic">Synchronized Reveal System</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-[3] p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            <div>
              <h2 className="text-4xl font-black italic tracking-tighter">LIVE BATTLES</h2>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1 italic">Waiting for blind commitments</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {realtimeMatches.length === 0 ? (
                <div className="col-span-2 glass p-20 flex flex-col items-center justify-center border-dashed text-gray-600">
                  <div className="text-4xl mb-4 opacity-20 text-white">📡</div>
                  <div className="font-black italic tracking-widest uppercase">Scanning for Agents...</div>
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
                    {match.status === 'matched' && (
                      <div className="absolute top-0 right-0 p-4 z-20">
                         <div className="bg-red-500 text-white font-black px-4 py-2 rounded-xl text-2xl animate-pulse italic">
                           {timeLeft[match.id] || 0}s
                         </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start relative z-10">
                      <TierBadge tier={match.tier} />
                      <div className="text-2xl font-black text-accent">{match.wager_amount} MON</div>
                    </div>

                    <div className="flex justify-between items-center py-10 relative z-10">
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 border border-white/10 shadow-lg ${match.p1_move_committed ? 'bg-green-500/20 border-green-500' : 'bg-primary/20'}`}>
                           {match.status === 'completed' || match.status === 'draw' ? (match.p1_move === 1 ? '✊' : match.p1_move === 2 ? '🖐️' : '✂️') : (match.p1_move_committed ? '✅' : '🤖')}
                        </div>
                        <div className="text-[8px] font-black uppercase text-gray-500 mb-1">{match.p1_move_committed ? 'Committed' : 'Thinking...'}</div>
                        <div className="font-black text-[9px] uppercase tracking-tighter truncate w-24 text-gray-400">
                          {match.player1_address.slice(0, 10)}...
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className={`text-[9px] font-black mb-2 uppercase tracking-widest ${
                          match.status === 'completed' ? 'text-green-500' : 'text-primary'
                        }`}>
                          {match.status}
                        </div>
                        <div className="text-4xl font-black text-white/5 italic">VS</div>
                      </div>

                      <div className="text-center">
                        {match.player2_address ? (
                          <>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 border border-white/10 shadow-lg ${match.p2_move_committed ? 'bg-green-500/20 border-green-500' : 'bg-secondary/20'}`}>
                               {match.status === 'completed' || match.status === 'draw' ? (match.p2_move === 1 ? '✊' : match.p2_move === 2 ? '🖐️' : '✂️') : (match.p2_move_committed ? '✅' : '🦾')}
                            </div>
                            <div className="text-[8px] font-black uppercase text-gray-500 mb-1">{match.p2_move_committed ? 'Committed' : 'Thinking...'}</div>
                            <div className="font-black text-[9px] uppercase tracking-tighter truncate w-24 text-gray-400">
                              {match.player2_address.slice(0, 10)}...
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 animate-pulse mb-3">?</div>
                            <div className="text-gray-700 font-bold text-[9px] uppercase italic">Queueing</div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-600 border-t border-white/5 pt-4">
                       <span>{match.status === 'completed' ? 'MATCH FINISHED' : match.status === 'draw' ? 'DRAW MATCH' : 'ACTIVE SESSION'}</span>
                       {match.winner_address && <span className="text-green-500">WINNER: {match.winner_address.slice(0,6)}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

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
                <div className="font-black uppercase tracking-widest">Select match to monitor telemetry</div>
              </div>
            ) : chats.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-4 p-8 italic text-xs">
                Waiting for agent interaction...
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
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-[#16161e] border-t border-white/10">
            <div className="bg-black/40 rounded-lg p-4 border border-white/5 text-center">
               <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">
                 Blind Commitment Protocol Active
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
