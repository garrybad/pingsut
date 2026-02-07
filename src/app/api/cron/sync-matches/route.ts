// src/app/api/cron/sync-matches/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic';

const ABI = [
  "function gameCount() view returns (uint256)",
  "function games(uint256) view returns (address player1, address player2, uint256 wager, uint8 tier, bytes32 commitment1, uint8 move2, bool completed, uint256 startTime, uint256 revealDeadline)"
];

const CONTRACT_ADDRESS = "0x02bD2cE9f911D51B47A0a5395A8B506c22e56C30";
const RPC_URL = "https://testnet-rpc.monad.xyz";

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    
    const count = await contract.gameCount();
    const gameCount = Number(count);
    
    const tiers = ['A', 'B', 'C', 'D', 'E'];
    const results = [];

    for (let i = 1; i <= gameCount; i++) {
      const g = await contract.games(i);
      
      const matchData = {
        blockchain_game_id: i,
        player1_address: g.player1,
        player2_address: g.player2 === ethers.ZeroAddress ? null : g.player2,
        wager_amount: parseFloat(ethers.formatEther(g.wager)),
        tier: tiers[Number(g.tier)],
        status: g.completed ? 'completed' : 
                (g.player2 !== ethers.ZeroAddress ? 
                  (Number(g.revealDeadline) < Math.floor(Date.now() / 1000) ? 'timeout' : 'matched') 
                : 'waiting'),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('matches')
        .upsert(matchData, { onConflict: 'blockchain_game_id' })
        .select();
      
      results.push({ id: i, success: !error });
    }

    return NextResponse.json({ success: true, gamesSynced: gameCount, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
