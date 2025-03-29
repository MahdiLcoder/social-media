import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../supabase-client';

interface AuthType {
    user: User | null;
    setUser: (user: User | null) => void;
    signInWithGitHub: () => Promise<void | Error>;
    signOut: () => Promise<void>;
}

const useAuth = create<AuthType>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    signInWithGitHub: async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' });
        if (error) {
            console.error('Error signing in with GitHub:', error);
            return error;
        }
    },
    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error);
            return;
        }

        // Clear the user state after logout
        set({ user: null });
    },
}));

export default useAuth;