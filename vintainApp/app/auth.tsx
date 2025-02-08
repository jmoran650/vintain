// vintainApp/app/auth.tsx
import React, { useContext, useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import { AuthContext } from "../context/authContext";
import { signIn as apiSignIn, signUp as apiSignUp } from "../src/apiService";
import { logInfo, logError } from "../src/utils/logger";

export default function AuthScreen() {
  const { signIn } = useContext(AuthContext);

  const [isSignUp, setIsSignUp] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  const defaultRoles = ["User"];

  async function handleSubmit() {
    if (isSignUp) {
      try {
        await logInfo(`Attempting sign up for email: ${email}`, "vintainApp/app/auth.tsx");
        const newAccount = await apiSignUp(
          email,
          password,
          firstName,
          lastName,
          defaultRoles,
          username
        );
        await logInfo(`Sign up successful for email: ${newAccount.email}`, "vintainApp/app/auth.tsx");
        Alert.alert("Success", `Account created for ${newAccount.email}`);
        setIsSignUp(false);
      } catch (err: any) {
        const errMsg = err instanceof Error ? err.message : String(err);
        await logError(`Sign up failed for email: ${email}. Error: ${errMsg}`, "vintainApp/app/auth.tsx");
        Alert.alert("Error", errMsg || "Failed to create account");
      }
    } else {
      try {
        await logInfo(`Attempting login for email: ${email}`, "vintainApp/app/auth.tsx");
        const data = await apiSignIn(email, password);
        await logInfo(`Login successful for email: ${email}`, "vintainApp/app/auth.tsx");
        Alert.alert("Welcome", `Hello, ${data.name.first}!`);
        await signIn(data.accessToken, data);
      } catch (err: any) {
        const errMsg = err instanceof Error ? err.message : String(err);
        await logError(`Login failed for email: ${email}. Error: ${errMsg}`, "vintainApp/app/auth.tsx");
        Alert.alert("Error", errMsg || "Failed to sign in");
      }
    }
  }

  function toggleMode() {
    setIsSignUp(!isSignUp);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.header}>
          {isSignUp ? "Create Account" : "Sign In"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8d6e63"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8d6e63"
          secureTextEntry
          value={password}
          autoCapitalize="none"
          onChangeText={setPassword}
        />

        {isSignUp && (
          <>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#8d6e63"
              value={firstName}
              autoCapitalize="none"
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#8d6e63"
              value={lastName}
              autoCapitalize="none"
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#8d6e63"
              value={username}
              autoCapitalize="none"
              onChangeText={setUsername}
            />
          </>
        )}

        <Button title={isSignUp ? "Sign Up" : "Sign In"} onPress={handleSubmit} color="#8d6e63" />

        <TouchableOpacity onPress={toggleMode} style={styles.toggleBtn}>
          <Text style={styles.toggleText}>
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff8e1' },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff8e1',
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: 'SpaceMono',
    color: '#3e2723',
  },
  input: {
    borderWidth: 1,
    borderColor: "#8d6e63",
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
    color: '#3e2723',
    fontFamily: 'SpaceMono',
    backgroundColor: '#fff',
  },
  toggleBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  toggleText: {
    color: "#8d6e63",
    fontSize: 14,
    textDecorationLine: "underline",
    fontFamily: 'SpaceMono',
  },
});