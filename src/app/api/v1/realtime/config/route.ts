import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    realtime_url: `wss://${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]}/realtime/v1`,
    anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    topic: 'public:matches',
    event: 'postgres_changes',
    schema: 'public',
    table: 'matches'
  });
}
