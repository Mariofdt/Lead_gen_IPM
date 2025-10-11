import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

      const getAuthHeaders = useCallback((): Record<string, string> => {
        if (session?.access_token) {
          return {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          };
        }
        return {
          'Content-Type': 'application/json'
        };
      }, [session?.access_token]);

      return {
        session,
        loading,
        isAuthenticated: !!session,
        getAuthHeaders
      };
}
