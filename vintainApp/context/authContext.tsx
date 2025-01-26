// vintainApp/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

/**
 * The shape of auth state:
 *  - token: string | null
 *  - user: any (or a structured type with id, name, etc.)
 */
type AuthContextType = {
  token: string | null;
  user: any | null;
  loading: boolean;
  signIn: (token: string, user: any) => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the AuthContext
export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  signIn: async () => undefined,
  signOut: async () => undefined,
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * On app start, try to load existing token from SecureStore.
   * If found, assume user is logged in (you might also want to verify or fetch user).
   */
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('token');
        if (savedToken) {
          // If you also stored some user info, load that. 
          // For now, we only store token, so user might be minimal:
          setToken(savedToken);
          // Optionally: fetch user from the server if you want fresh data
          // setUser(...)
        }
      } catch (err) {
        console.error('Error loading token from SecureStore', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Called after successful sign-in or sign-up to store token in context + SecureStore.
   */
  async function signIn(newToken: string, userData: any) {
    try {
      await SecureStore.setItemAsync('token', newToken);
      setToken(newToken);
      setUser(userData);
    } catch (err) {
      console.error('Error saving token to SecureStore', err);
    }
  }

  /**
   * Sign out and clear the token.
   */
  async function signOut() {
    try {
      await SecureStore.deleteItemAsync('token');
      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('Error deleting token from SecureStore', err);
    }
  }

  const value: AuthContextType = {
    token,
    user,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}