// app/(tabs)/profile.tsx
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { AuthContext } from '../../context/authContext';
import { fetchMyProfile } from '../../src/apiService';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useContext(AuthContext);
  const [profile, setProfile] = useState<{
    id: string;
    name: { first: string; last: string };
    profile: { username: string; bio?: string | null };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadProfile(user.id);
    } else {
      setLoading(false);
    }
  }, [user]);

  async function loadProfile(id: string) {
    try {
      const data = await fetchMyProfile(id);
      setProfile(data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    signOut().catch((err) => {
      console.error('Failed to sign out', err);
    });
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#8d6e63" />
      </View>
    );
  }

  // Instead of returning early when no profile is found, we render a screen that
  // tells the user no profile was found *and* lets them create one.
  return (
    <View style={styles.container}>
      {profile ? (
        <>
          <Text style={styles.title}>
            {profile.name.first} {profile.name.last}
          </Text>
          <Text style={styles.subtitle}>@{profile.profile.username}</Text>
          <Text style={styles.bio}>
            {profile.profile.bio || 'No bio available.'}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.message}>No profile found.</Text>
        </>
      )}
      <Button
        title="Edit Profile"
        onPress={() => router.push('/editProfile')}
        color="#8d6e63"
      />
      <Button title="Sign Out" onPress={handleSignOut} color="#8d6e63" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff8e1', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#3e2723', fontFamily: 'SpaceMono' },
  subtitle: { fontSize: 20, color: '#5d4037', marginBottom: 12, fontFamily: 'SpaceMono' },
  bio: { fontSize: 16, marginBottom: 16, color: '#3e2723', fontFamily: 'SpaceMono', textAlign: 'center' },
  message: { fontSize: 16, marginBottom: 16, color: '#3e2723', fontFamily: 'SpaceMono' },
});