import React, { createContext, useContext, useState, useEffect } from 'react';
import { Stats, StatsContextType } from '@/types';
import { supabase } from '@/integrations/supabase/client-browser';
import { useAuth } from './AuthContext';
import { notify } from '@/services/notification';

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { auth } = useAuth();

  // Cleanup effect
  useEffect(() => {
    if (!auth.isAuthenticated) {
      setStats(null);
      setIsLoading(false);
    }
  }, [auth.isAuthenticated]);

  const fetchLatestStats = async () => {
    try {
      if (!auth.user) return;

      // Get the most recent stats for the user
      const { data: latestStats, error } = await supabase
        .from('stats')
        .select()
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching stats:', error);
        notify.error('Erro ao carregar estatísticas', {
          description: 'Não foi possível carregar suas estatísticas.'
        });
        return;
      }

      // If no stats exist yet, create initial stats
      if (!latestStats || latestStats.length === 0) {
        const { data: newStats, error: insertError } = await supabase
          .from('stats')
          .insert([{
            user_id: auth.user.id,
            total_messages_sent: 0,
            total_messages_failed: 0
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating initial stats:', insertError);
          notify.error('Erro ao criar estatísticas iniciais', {
            description: 'Não foi possível inicializar suas estatísticas.'
          });
          return;
        }

        setStats(newStats as Stats);
      } else {
        setStats(latestStats[0] as Stats);
      }
    } catch (error) {
      console.error('Error in fetchLatestStats:', error);
      notify.error('Erro ao carregar estatísticas', {
        description: 'Ocorreu um erro ao processar suas estatísticas.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewStatsEntry = async (updates: Partial<Stats>) => {
    try {
      if (!auth.user) return;

      // Fetch the latest stats first
      const { data: latestStats, error: fetchError } = await supabase
        .from('stats')
        .select()
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // Get the current totals
      const currentStats = latestStats?.[0] || {
        total_messages_sent: 0,
        total_messages_failed: 0
      };

      // Create a new entry with accumulated totals
      const { data: newStats, error } = await supabase
        .from('stats')
        .insert([{
          user_id: auth.user.id,
          total_messages_sent: (updates.total_messages_sent || 0) + (currentStats.total_messages_sent || 0),
          total_messages_failed: (updates.total_messages_failed || 0) + (currentStats.total_messages_failed || 0)
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setStats(newStats as Stats);

    } catch (error) {
      console.error('Error creating new stats entry:', error);
      notify.error('Erro ao atualizar estatísticas', {
        description: 'Não foi possível salvar as novas estatísticas.'
      });
    }
  };

  const incrementMessagesSent = async (amount: number = 1) => {
    try {
      if (!auth.user) return;

      await createNewStatsEntry({
        total_messages_sent: amount
      });

    } catch (error) {
      console.error('Error incrementing messages sent:', error);
      notify.error('Erro ao atualizar estatísticas', {
        description: 'Não foi possível atualizar suas estatísticas.'
      });
    }
  };

  const incrementMessagesFailed = async (amount: number = 1) => {
    try {
      if (!auth.user) return;

      await createNewStatsEntry({
        total_messages_failed: amount
      });

    } catch (error) {
      console.error('Error incrementing failed messages:', error);
      notify.error('Erro ao atualizar estatísticas', {
        description: 'Não foi possível atualizar suas estatísticas.'
      });
    }
  };

  // Fetch stats when auth changes
  useEffect(() => {
    if (auth.user) {
      fetchLatestStats();
    } else {
      setStats(null);
    }
  }, [auth.user]);

  const refreshStats = async () => {
    await fetchLatestStats();
  };

  return (
    <StatsContext.Provider value={{
      stats,
      isLoading,
      incrementMessagesSent,
      incrementMessagesFailed,
      refreshStats,
      createNewStatsEntry
    }}>
      {children}
    </StatsContext.Provider>
  );
};

export function useStats() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
} 