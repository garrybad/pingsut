"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeMatches() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Fetch matches error:", error);
      } else if (data) {
        setMatches(data);
      }
    };

    fetchMatches();

    const channel = supabase
      .channel('schema-db-changes')
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
          } else if (payload.eventType === 'DELETE') {
            setMatches((prev) => prev.filter((m) => m.id !== payload.old.id));
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
    if (!matchId) {
      setChats([]);
      return;
    }

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('match_chats')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Fetch chats error:", error);
      } else if (data) {
        setChats(data);
      }
    };

    fetchChats();

    const channel = supabase
      .channel(`match-chat-${matchId}`)
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
