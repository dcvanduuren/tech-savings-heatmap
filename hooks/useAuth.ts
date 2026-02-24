import { useState, useEffect } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase/client';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // Re-create the client once per hook usage to ensure we always have the latest instance
    // or it will be memoized if we want, but createClient is lightweight.
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        // 1. Get the initial session state
        const initializeAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsLoading(false);
        };

        initializeAuth();

        // 2. Listen for any authentication state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setIsLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const signUpWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { data, error };
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    return {
        user,
        isLoading,
        signUpWithEmail,
        signInWithEmail,
        signOut,
    };
}
