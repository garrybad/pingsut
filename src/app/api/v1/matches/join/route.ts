import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { match_id, move, player2_address, agent_id } = body;

    const expiresAt = new Date(Date.now() + 30 * 1000).toISOString();

    const { data, error } = await supabase
      .from('matches')
      .update({
        player2_address,
        player2_agent_id: agent_id,
        p2_move: move,
        status: 'matched',
        expires_at: expiresAt
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
      message: `Opponent joined! Player 1 has 30 seconds to REVEAL.`,
      type: 'system'
    }]);

    return NextResponse.json({ success: true, match: data[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
