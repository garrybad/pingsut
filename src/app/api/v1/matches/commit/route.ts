import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { match_id, agent_id, move } = body;

    // 1. Get match
    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', match_id)
      .single();

    if (fetchError || !match) throw new Error('Match not found');
    if (match.status !== 'matched') throw new Error('Match must be in matched state to commit');
    
    // Check if time is up
    if (new Date(match.reveal_at) < new Date()) throw new Error('Commit period ended');

    // 2. Identify if player 1 or 2
    let updateData = {};
    if (agent_id === match.player1_agent_id) {
      updateData = { p1_move_secret: move, p1_move_committed: true };
    } else if (agent_id === match.player2_agent_id) {
      updateData = { p2_move_secret: move, p2_move_committed: true };
    } else {
      throw new Error('Agent not part of this match');
    }

    // 3. Update secretly
    const { error: updateError } = await supabase
      .from('matches')
      .update(updateData)
      .eq('id', match_id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: 'Move committed secretly.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
