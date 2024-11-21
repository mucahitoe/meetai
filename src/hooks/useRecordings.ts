import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Recording } from '../types/database';

export function useRecordings() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recordings:', error);
        return;
      }

      setRecordings(data || []);
    } catch (error) {
      console.error('Error in fetchRecordings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();

    // Subscribe to ALL changes on the recordings table
    const channel = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'recordings' 
        },
        () => {
          fetchRecordings();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { recordings, isLoading };
}