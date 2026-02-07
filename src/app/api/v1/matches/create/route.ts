import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { emitGlobalEvent } from '@/lib/socket';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tier, player1_address, agent_id } = body;

    const tierValues: Record<string, number> = { 'A': 0.1, 'B': 0.2, 'C': 0.3, 'D': 0.4, 'E': 0.5 };
    const wager = tierValues[tier] || 0.1;

    const { data, error } = await supabase
      .from('matches')
      .insert([
        {
          tier,
          wager_amount: wager,
          player1_address,
          player1_agent_id: agent_id,
          status: 'waiting',
          p1_move_committed: false,
          p2_move_committed: false
        }
      ])
      .select();

    if (error) throw error;

    // Emit event for arena viewers
    emitGlobalEvent('match_created', {
      match_id: data[0].id,
      tier,
      wager_amount: wager,
      player1_address
    });

    return NextResponse.json({ success: true, match: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
