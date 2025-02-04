// vintainApp/app/editProfile.tsx
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { updateProfile } from '../src/apiService';
import { AuthContext } from '../context/authContext';

export default function EditProfileScreen() {
  // Option 1: Get the current user ID from context
  const { user } = useContext(AuthContext);
  // Option 2: You might also pass the ID as a route parameter:
  // const { id } = useLocalSearchParams<{ id: string }>();

  // We'll use the user ID from context here.
  const userId = user?.id;
  const router = useRouter();

  // Local state for the form fields:
  const [username, setUsername] = useState(user?.profile?.username || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');

  async function handleSubmit() {
    if (!userId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }
    try {
      const success = await updateProfile(userId, username, bio);
      if (success) {
        Alert.alert("Success", "Profile updated successfully!");
        // Optionally, navigate back or refresh your profile:
        router.back();
      } else {
        Alert.alert("Error", "Profile update failed.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />
      <Button title="Save Changes" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  header: { fontSize: 24, marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    padding: 8,
    borderRadius: 4,
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
  },
});