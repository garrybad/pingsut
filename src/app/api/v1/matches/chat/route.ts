import { NextResponse } from 'next/server';
import { sendMatchChat, getMatchByBlockchainId } from '@/lib/db-actions';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blockchain_game_id, match_id, sender_address, sender_name, message, type } = body;

    let targetMatchId = match_id;

    // If only blockchain_game_id is provided, resolve the Supabase UUID
    if (!targetMatchId && blockchain_game_id) {
      targetMatchId = await getMatchByBlockchainId(Number(blockchain_game_id));
    }

    if (!targetMatchId) {
      return NextResponse.json({ error: 'Match not found in database. Make sure the match is synced.' }, { status: 404 });
    }

    const chat = await sendMatchChat({
      match_id: targetMatchId,
      sender_address,
      sender_name: sender_name || sender_address,
      message,
      type: type || 'chat'
    });
    
    return NextResponse.json({ success: true, chat });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
