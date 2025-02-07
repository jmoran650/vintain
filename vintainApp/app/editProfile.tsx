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
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { updateProfile, generateUploadUrl } from '../src/apiService';
import { AuthContext } from '../context/authContext';

export default function EditProfileScreen() {
  const { user } = useContext(AuthContext);
  const userId = user?.id;
  const router = useRouter();

  const [username, setUsername] = useState(user?.profile?.username || '');
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(user?.profile?.profilePicture || null);
  const [uploading, setUploading] = useState(false);

  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!pickerResult.canceled) {
        // TypeScript now expects you to use the assets array
        const asset = pickerResult.assets[0];
        if (asset && asset.uri) {
          uploadProfilePicture(asset.uri);
        }
    }
  }

  async function uploadProfilePicture(uri: string) {
    try {
      setUploading(true);
      // Extract filename and determine MIME type.
      // In a production app, you might use a library (or inspect the file extension)
      // Here, we assume a JPEG image.
      const fileName = uri.split('/').pop() || `profile_${Date.now()}.jpg`;
      const contentType = 'image/jpeg';

      // Call our API helper to get a pre-signed URL (using folder "profile")
      const { preSignedUrl, fileUrl } = await generateUploadUrl(fileName, contentType, 'profile');

      // Read the file as a blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload the file to S3 using the pre-signed URL with PUT
      const uploadResult = await fetch(preSignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: blob,
      });
      if (!uploadResult.ok) {
        throw new Error('Upload failed.');
      }
      // Set the profile picture URL locally so it can be shown immediately.
      setProfilePicUrl(fileUrl);
      Alert.alert('Success', 'Profile picture uploaded!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!userId) {
      Alert.alert("Error", "User ID not found.");
      return;
    }
    try {
      // Ensure profilePicUrl is passed in if available.
      console.log("Updating profile with:", { username, bio, profilePicture: profilePicUrl });
      const success = await updateProfile(userId, username, bio, profilePicUrl || undefined);
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
        {profilePicUrl ? (
          <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
        ) : (
          <View style={[styles.profilePic, styles.profilePicPlaceholder]}>
            <Text style={styles.placeholderText}>No Photo</Text>
          </View>
        )}
        <Button title="Select Profile Picture" onPress={pickImage} disabled={uploading} color="#8d6e63" />
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
        <Button title="Save Changes" onPress={handleSubmit} color="#8d6e63" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff8e1' },
  container: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#8d6e63', marginBottom: 12, padding: 8, borderRadius: 4, width: '100%' },
  multiline: { height: 80, textAlignVertical: 'top' },
  profilePic: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
  profilePicPlaceholder: { backgroundColor: '#d7ccc8', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#3e2723' },
});