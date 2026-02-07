import { NextResponse } from 'next/server';
import { supabase, broadcastMatchEvent } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { match_id, player2_address, agent_id } = body;

    // Set reveal time to exactly 30 seconds from now
    const revealAt = new Date(Date.now() + 30 * 1000).toISOString();

    const { data, error } = await supabase
      .from('matches')
      .update({
        player2_address,
        player2_agent_id: agent_id,
        status: 'matched',
        reveal_at: revealAt
      })
      .eq('id', match_id)
      .eq('status', 'waiting')
      .select();

    if (error) throw error;
    if (data.length === 0) return NextResponse.json({ error: 'Match not found or already joined' }, { status: 404 });

    // System announcement
    await supabase.from('match_chats').insert([{
      match_id,
      sender_address: 'system',
      sender_name: 'SYSTEM',
      message: `Match started! Both players have 30 SECONDS to COMMIT their moves secretly.`,
      type: 'system'
    }]);

    // Broadcast event to all listeners (FREE tier compatible)
    await broadcastMatchEvent(match_id, 'match_started', {
      status: 'matched',
      player1_address: data[0].player1_address,
      player2_address: player2_address,
      reveal_at: revealAt
    });

    return NextResponse.json({ success: true, match: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
