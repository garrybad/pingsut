import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return NextResponse.json({
    supabase_url: supabaseUrl,
    anon_key: supabaseAnonKey,
    channel: 'pingsut-arena',
    mode: 'broadcast',
    events: ['match_started', 'player_committed', 'match_completed'],
    note: 'Use Supabase Broadcast (FREE tier). No database replication required.'
  });
}
