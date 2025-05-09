// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useContext } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, AuthContext } from '../context/authContext';
import AuthScreen from './auth';

// *** Import our React Query setup to enable online and focus management ***
import '../src/reactQuerySetup';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a React Query client
const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthOrStack />
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

function AuthOrStack() {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return null;
  }

  if (!token) {
    return <AuthScreen />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
      <Stack.Screen
        name="listingDetail"
        options={{
          headerTitle: '',
          headerBackTitle: '',
          headerTransparent: true,
          headerBackButtonMenuEnabled: false,
        }}
      />
    </Stack>
  );
}