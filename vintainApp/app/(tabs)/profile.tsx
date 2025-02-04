// vintainApp/app/(tabs)/profile.tsx

import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { AuthContext } from '../../context/authContext';
import { fetchMyProfile } from '../../src/apiService';

export default function ProfileScreen() {
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
    // Just call signOut() from AuthContext
    signOut().catch((err) => {
      console.error('Failed to sign out', err);
    });
    // After signOut, token becomes null => root layout shows Auth screen
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>No profile found (user might not be logged in or missing ID)</Text>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {profile.name.first} {profile.name.last}
      </Text>
      <Text style={styles.subtitle}>@{profile.profile.username}</Text>

      {profile.profile.bio ? (
        <Text style={styles.bio}>{profile.profile.bio}</Text>
      ) : (
        <Text style={styles.bio}>No bio</Text>
      )}

      {/* Sign Out button */}
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 12 },
  bio: { fontSize: 16, marginBottom: 16 },
});