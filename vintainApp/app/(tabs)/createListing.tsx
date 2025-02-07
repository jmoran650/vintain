// vintainApp/app/(tabs)/createListing.tsx
import React, { useState, useContext } from 'react';
import { SafeAreaView, Text, TextInput, Button, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
// Import our mutation hooks
import { useCreateListing, useGenerateUploadUrl } from '../../hooks/useApi';
import { AuthContext } from '../../context/authContext';

export default function CreateListingScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const createListingMutation = useCreateListing();
  const generateUploadUrlMutation = useGenerateUploadUrl();

  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  async function pickListingImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Permission to access media library is required.");
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!pickerResult.canceled) {
      const asset = pickerResult.assets[0];
      if (asset?.uri) {
        await uploadListingImage(asset.uri);
      }
    }
  }

  async function uploadListingImage(uri: string) {
    try {
      setUploading(true);
      const fileName = uri.split('/').pop() || `listing_${Date.now()}.jpg`;
      const contentType = 'image/jpeg';
  
      console.log("[CreateListing] Requesting pre-signed URL with:", {
        fileName,
        contentType,
        folder: 'listing',
      });
      const { data } = await generateUploadUrlMutation.mutateAsync({
        fileName,
        contentType,
        folder: 'listing',
      });
      const { preSignedUrl, fileUrl } = data;
      console.log("[CreateListing] Received preSignedUrl:", preSignedUrl);
      console.log("[CreateListing] File URL will be:", fileUrl);
  
      const response = await fetch(uri);
      const blob = await response.blob();
  
      console.log("[CreateListing] Uploading image to S3...");
      const uploadResult = await fetch(preSignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });
  
      console.log("[CreateListing] Upload response status:", uploadResult.status, uploadResult.statusText);
  
      if (!uploadResult.ok) {
        const errorText = await uploadResult.text();
        console.error("[CreateListing] Upload failed with response:", errorText);
        throw new Error("Image upload failed.");
      }
  
      setImageUrls(prev => [...prev, fileUrl]);
      Alert.alert("Success", "Image added!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to upload image");
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  }
  
  function handleSubmit() {
    if (!user || !user.id) {
      Alert.alert("Error", "User not logged in.");
      return;
    }
    if (!brand || !name || !description) {
      Alert.alert("Error", "Brand, Name, and Description are required.");
      return;
    }
    createListingMutation.mutate(
      {
        ownerId: user.id,
        brand,
        name,
        description,
        imageUrls,
      },
      {
        onSuccess: (data) => {
          Alert.alert("Success", "Listing created!");
          router.push(`/listingDetail?listingId=${data.id}`);
        },
        onError: (err: any) => {
          Alert.alert("Error", err.message || "Failed to create listing");
        },
      }
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Create New Listing</Text>
        <TextInput style={styles.input} placeholder="Brand" value={brand} onChangeText={setBrand} />
        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Button title="Add Photo" onPress={pickListingImage} disabled={uploading} color="#8d6e63" />
        <ScrollView horizontal style={styles.imagePreviewContainer}>
          {imageUrls.map((url, idx) => (
            <Image key={idx} source={{ uri: url }} style={styles.imagePreview} />
          ))}
        </ScrollView>
        <Button title="Create Listing" onPress={handleSubmit} color="#8d6e63" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff8e1' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center', color: '#3e2723' },
  input: { borderWidth: 1, borderColor: '#8d6e63', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: '#fff', color: '#3e2723' },
  multiline: { height: 100, textAlignVertical: 'top' },
  imagePreviewContainer: { marginVertical: 10 },
  imagePreview: { width: 100, height: 100, marginRight: 10, borderRadius: 8 },
});