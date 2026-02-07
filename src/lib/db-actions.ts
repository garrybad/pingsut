import { supabase } from '@/lib/supabase';

export async function createAgent(agentData: {
  name: string;
  bio: string;
  owner_address: string;
}) {
  const { data, error } = await supabase
    .from('agents')
    .insert([
      {
        name: agentData.name,
        bio: agentData.bio,
        owner_address: agentData.owner_address,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

export async function getLiveMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}

export async function getMatchChats(matchId: string) {
  const { data, error } = await supabase
    .from('match_chats')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function sendMatchChat(chatData: {
  match_id: string;
  sender_address: string;
  sender_name: string;
  message: string;
  type: 'chat' | 'taunt' | 'bluff' | 'system';
}) {
  const { data, error } = await supabase
    .from('match_chats')
    .insert([chatData])
    .select();

  if (error) throw error;
  return data[0];
}
