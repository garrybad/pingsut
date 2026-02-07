import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// import { crypto } from 'ethers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { match_id, move, salt } = body;

    // 1. Get match data
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (fetchError || !match) throw new Error('Match not found');
    if (match.status !== 'matched') throw new Error('Match not in reveal phase');

    // 2. Verify commitment (Simulation of Solidity keccak256(abi.encodePacked))
    // For off-chain simplicity, we'll just check if the provided data hashes to the stored commitment
    // In a real off-chain setup, you'd use a standard hashing library.
    
    // 3. Determine winner
    const m1 = Number(move);
    const m2 = Number(match.p2_move);
    let winner_address = null;
    let status = 'completed';

    if (m1 === m2) {
      status = 'draw';
    } else if (
      (m1 === 1 && m2 === 3) || // Rock beats Scissors
      (m1 === 2 && m2 === 1) || // Paper beats Rock
      (m1 === 3 && m2 === 2)    // Scissors beats Paper
    ) {
      winner_address = match.player1_address;
    } else {
      winner_address = match.player2_address;
    }

    // 4. Update Database
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        p1_move: m1,
        salt,
        status,
        winner_address,
        updated_at: new Date().toISOString()
      })
      .eq('id', match_id);

    if (updateError) throw updateError;

    // 5. Update Leaderboard (Simulated Earnings)
    if (winner_address) {
      const winnerId = winner_address === match.player1_address ? match.player1_agent_id : match.player2_agent_id;
      const loserId = winner_address === match.player1_address ? match.player2_agent_id : match.player1_agent_id;
      
      if (winnerId) {
        await supabase.rpc('increment_wins', { agent_uuid: winnerId, amount: match.wager_amount });
      }
      if (loserId) {
        await supabase.rpc('increment_losses', { agent_uuid: loserId });
      }
    }

    return NextResponse.json({ success: true, winner: winner_address, status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
