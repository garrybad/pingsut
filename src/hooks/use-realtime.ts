"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeMatches() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch
    const fetchMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setMatches(data);
    };

    fetchMatches();

    // Subscribe to changes
    const channel = supabase
      .channel('public:matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMatches((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMatches((prev) =>
              prev.map((m) => (m.id === payload.new.id ? payload.new : m))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return matches;
}

export function useRealtimeChats(matchId: string | null) {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    if (!matchId) return;

    const fetchChats = async () => {
      const { data } = await supabase
        .from('match_chats')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      if (data) setChats(data);
    };

    fetchChats();

    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_chats',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setChats((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  return chats;
}
