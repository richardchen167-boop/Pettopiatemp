import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTimeTracking(userId: string) {
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
  const [previousTimeSeconds, setPreviousTimeSeconds] = useState(0);

  useEffect(() => {
    if (!userId) return;

    let displayIntervalId: number;
    let saveIntervalId: number;
    const sessionStartTime = Date.now();

    const loadPreviousTime = async () => {
      try {
        const { data } = await supabase
          .from('user_sessions')
          .select('total_time_seconds')
          .eq('user_id', userId)
          .maybeSingle();

        if (data) {
          setPreviousTimeSeconds(data.total_time_seconds || 0);
        }
      } catch (error) {
        console.error('Error loading previous time:', error);
      }
    };

    const saveTimeToDatabase = async (totalSeconds: number) => {
      try {
        const { data: existing } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('user_sessions')
            .update({
              total_time_seconds: totalSeconds,
              last_active: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        } else {
          await supabase
            .from('user_sessions')
            .insert({
              user_id: userId,
              total_time_seconds: totalSeconds,
              last_active: new Date().toISOString()
            });
        }
      } catch (error) {
        console.error('Error saving time to database:', error);
      }
    };

    const updateDisplay = () => {
      const currentSessionSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      const totalSeconds = previousTimeSeconds + currentSessionSeconds;
      setTotalTimeSeconds(totalSeconds);
    };

    loadPreviousTime();

    displayIntervalId = window.setInterval(updateDisplay, 1000);
    updateDisplay();

    saveIntervalId = window.setInterval(() => {
      const currentSessionSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      const totalSeconds = previousTimeSeconds + currentSessionSeconds;
      saveTimeToDatabase(totalSeconds);
    }, 30000);

    return () => {
      if (displayIntervalId) clearInterval(displayIntervalId);
      if (saveIntervalId) clearInterval(saveIntervalId);

      const currentSessionSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      const totalSeconds = previousTimeSeconds + currentSessionSeconds;
      saveTimeToDatabase(totalSeconds);
    };
  }, [userId, previousTimeSeconds]);

  return { totalTimeSeconds };
}

export async function getUserSessionTime(userId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('user_sessions')
      .select('total_time_seconds')
      .eq('user_id', userId)
      .maybeSingle();

    return data?.total_time_seconds || 0;
  } catch (error) {
    console.error('Error getting user session time:', error);
    return 0;
  }
}

export function formatTimeSpent(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }

  return `${days}d`;
}
