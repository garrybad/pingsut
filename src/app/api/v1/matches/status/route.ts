import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('match_id');

    if (!matchId) {
      return NextResponse.json({ error: 'Missing match_id' }, { status: 400 });
    }

    const { data: match, error } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (error || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const responseData: any = {
      success: true,
      match_id: match.id,
      status: match.status,
      player1: {
        address: match.player1_address,
        has_committed: match.p1_move_committed
      },
      player2: {
        address: match.player2_address,
        has_committed: match.p2_move_committed
      },
      reveal_at: match.reveal_at,
      time_left_seconds: Math.max(0, Math.floor((new Date(match.reveal_at).getTime() - Date.now()) / 1000))
    };

    // If the match is completed or drawn, include the final results
    if (match.status === 'completed' || match.status === 'draw') {
      responseData.result = {
        winner_address: match.winner_address,
        player1_move: match.p1_move,
        player2_move: match.p2_move,
        wager_amount: match.wager_amount,
        status: match.status
      };
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
