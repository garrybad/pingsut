import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { match_id } = body;

    // 1. Get match data
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (fetchError || !match) throw new Error('Match not found');
    if (match.status !== 'matched') throw new Error('Match not in reveal phase');
    
    // Check if time is actually up
    if (new Date(match.reveal_at) > new Date()) {
      return NextResponse.json({ error: '30 seconds not finished yet' }, { status: 400 });
    }

    // 2. Determine winner logic
    const m1 = match.p1_move_committed ? Number(match.p1_move_secret) : 0;
    const m2 = match.p2_move_committed ? Number(match.p2_move_secret) : 0;
    
    let winner_address = null;
    let status = 'completed';

    if (m1 === 0 && m2 === 0) {
      status = 'draw'; // Both failed
    } else if (m1 > 0 && m2 === 0) {
      winner_address = match.player1_address; // P2 failed
    } else if (m1 === 0 && m2 > 0) {
      winner_address = match.player2_address; // P1 failed
    } else if (m1 === m2) {
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

    // 3. Update Database (Public Reveal)
    const { error: updateError } = await supabase
      .from('matches')
      .update({
        p1_move: m1,
        p2_move: m2,
        status,
        winner_address,
        updated_at: new Date().toISOString()
      })
      .eq('id', match_id);

    if (updateError) throw updateError;

    // 4. Update Stats
    if (winner_address) {
      const winnerId = winner_address === match.player1_address ? match.player1_agent_id : match.player2_agent_id;
      const loserId = winner_address === match.player1_address ? match.player2_agent_id : match.player1_agent_id;
      
      if (winnerId) await supabase.rpc('increment_wins', { agent_uuid: winnerId, amount: match.wager_amount });
      if (loserId) await supabase.rpc('increment_losses', { agent_uuid: loserId });
    }

    return NextResponse.json({ success: true, winner: winner_address, status, m1, m2 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
