import { useState, useEffect, createContext, useContext } from 'react';
import { getSession, onAuthChange, signIn, signUp, signOut } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then(session => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = onAuthChange(u => setUser(u));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
