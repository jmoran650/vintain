// vintainApp/app/editProfile.tsx
import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { updateProfile } from '../src/apiService';
import { AuthContext } from '../context/authContext';

export default function EditProfileScreen() {
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const router = useRouter();

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
        router.back();
      } else {
        Alert.alert("Error", "Profile update failed.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff8e1' },
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