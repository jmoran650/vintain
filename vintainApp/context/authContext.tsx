// vintainApp/context/authContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
// Import setAuthToken and fetchMyProfile from your API service.
import { setAuthToken, fetchMyProfile } from '../src/apiService';
// Import jwt-decode as a default import
import { jwtDecode } from "jwt-decode";

type AuthContextType = {
  token: string | null;
  user: any | null;
  loading: boolean;
  signIn: (token: string, user: any) => Promise<void>;
  signOut: () => Promise<void>;
};

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
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        // Attempt to load the saved token from SecureStore.
        const savedToken = await SecureStore.getItemAsync('token');
        if (savedToken) {
          setTokenState(savedToken);
          // Update our API service so all future requests include the token.
          setAuthToken(savedToken);
          // Decode the token to extract the user ID.
          const decoded: { id: string } = jwtDecode(savedToken);
          // Fetch the user profile using the decoded ID.
          const profile = await fetchMyProfile(decoded.id);
          setUser(profile);
        }
      } catch (err) {
        console.error('Error loading token or fetching profile:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function signIn(newToken: string, userData: any) {
    try {
      await SecureStore.setItemAsync('token', newToken);
      setTokenState(newToken);
      setUser(userData);
      // Update our API service.
      setAuthToken(newToken);
    } catch (err) {
      console.error('Error saving token to SecureStore', err);
    }
  }

  async function signOut() {
    try {
      await SecureStore.deleteItemAsync('token');
      setTokenState(null);
      setUser(null);
      // Clear token in our API service.
      setAuthToken(null);
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