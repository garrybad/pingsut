import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Broadcast helper for real-time events (works on FREE tier)
export async function broadcastMatchEvent(matchId: string, eventType: string, data: any) {
  const channel = supabase.channel('pingsut-arena');
  
  await channel.send({
    type: 'broadcast',
    event: eventType,
    payload: { match_id: matchId, ...data }
  });
}
