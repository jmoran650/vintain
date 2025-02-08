// vintainApp/context/authContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken, fetchMyProfile } from '../src/apiService';
import { jwtDecode } from "jwt-decode";
import { logInfo, logError } from "../src/utils/logger";

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
  
  const value: AuthContextType = {
    token,
    user,
    loading,
    signIn,
    signOut,
  };


  async function signIn(newToken: string, userData: any) {
    try {
      await SecureStore.setItemAsync('token', newToken);
      setTokenState(newToken);
      setUser(userData);
      setAuthToken(newToken);
      await logInfo(`Frontend: signIn successful for user id: ${userData.id}`, "vintainApp/context/authContext.tsx");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await logError(`Frontend: signIn failed: ${errorMsg}`, "vintainApp/context/authContext.tsx");
      console.error('Error saving token to SecureStore', err);
    }
  }

  async function signOut() {
    try {
      await SecureStore.deleteItemAsync('token');
      setTokenState(null);
      setUser(null);
      setAuthToken(null);
      await logInfo(`Frontend: signOut successful`, "vintainApp/context/authContext.tsx");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      await logError(`Frontend: signOut failed: ${errorMsg}`, "vintainApp/context/authContext.tsx");
      console.error('Error deleting token from SecureStore', err);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('token');
        if (savedToken) {
          setTokenState(savedToken);
          setAuthToken(savedToken);
          const decoded: { id: string } = jwtDecode(savedToken);
          const profile = await fetchMyProfile(decoded.id);
          setUser(profile);
          await logInfo(`Frontend: Loaded profile for user id: ${decoded.id}`, "vintainApp/context/authContext.tsx");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await logError(`Error loading token or fetching profile: ${errorMsg}`, "vintainApp/context/authContext.tsx");
        console.error('Error loading token or fetching profile:', err);
        // **Clear token and user info when an error occurs**
        await signOut();
      } finally {
        setLoading(false);
      }
    })();
  }, []);




  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}