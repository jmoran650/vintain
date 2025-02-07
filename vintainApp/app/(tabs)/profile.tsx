// vintainApp/app/(tabs)/profile.tsx
import React, { useContext } from "react";
import { SafeAreaView, Text, StyleSheet, ActivityIndicator, Button, Image } from "react-native";
import { AuthContext } from "../../context/authContext";
import { useMyProfile } from "../../hooks/useApi";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useContext(AuthContext);
  const { data: profile, isLoading, isError } = useMyProfile(user?.id || "");
  // At the top of your ProfileScreen component (inside the function)
  console.log("Profile data:", profile);

  function handleSignOut() {
    signOut().catch((err) => {
      console.error("Failed to sign out", err);
    });
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#8d6e63" />
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.message}>No profile found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {profile.profile.profilePicture ? (
        <Image source={{ uri: profile.profile.profilePicture }} style={styles.profileImage} />
      ) : null}
      <Text style={styles.title}>
        {profile.name.first} {profile.name.last}
      </Text>
      <Text style={styles.subtitle}>@{profile.profile.username}</Text>
      <Text style={styles.bio}>
        {profile.profile.bio != null ? profile.profile.bio : "No bio available."}
      </Text>
      <Button title="Edit Profile" onPress={() => router.push("/editProfile")} color="#8d6e63" />
      <Button title="Sign Out" onPress={handleSignOut} color="#8d6e63" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: "#fff8e1", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 8, 
    color: "#3e2723", 
    fontFamily: 'SpaceMono' 
  },
  subtitle: { 
    fontSize: 20, 
    color: "#5d4037", 
    marginBottom: 12, 
    fontFamily: 'SpaceMono' 
  },
  bio: { 
    fontSize: 16, 
    marginBottom: 16, 
    color: "#3e2723", 
    fontFamily: 'SpaceMono', 
    textAlign: "center" 
  },
  message: { 
    fontSize: 16, 
    marginBottom: 16, 
    color: "#3e2723", 
    fontFamily: 'SpaceMono' 
  },
});