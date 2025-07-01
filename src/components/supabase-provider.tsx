"use client";

import { createClient } from "@/lib/supabase/client";
import { createBrowserClient } from "@supabase/ssr";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SupabaseClient, Session } from "@supabase/supabase-js";

// Define the context type
type SupabaseContextType = {
  supabaseClient: SupabaseClient;
  session: Session | null;
} | null;

// Create a context to expose the Supabase client and session
const SupabaseContext = createContext<SupabaseContextType>(null);

// Custom hook to use the Supabase client
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === null) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};

// Define the props type for the SupabaseProvider component
interface SupabaseProviderProps {
  children: ReactNode;
}

export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [supabaseClient] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      setSession(session);
    };

    getSession();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient]);

  return (
    <SupabaseContext.Provider value={{ supabaseClient, session }}>
      {children}
    </SupabaseContext.Provider>
  );
}
