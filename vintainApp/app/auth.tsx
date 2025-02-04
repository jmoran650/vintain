// vintainApp/app/auth.tsx
import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { AuthContext } from "../context/authContext";
import { signIn as apiSignIn, signUp as apiSignUp } from "../src/apiService";

export default function AuthScreen() {
  const { signIn } = useContext(AuthContext);

  const [isSignUp, setIsSignUp] = useState(false);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign-up fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");

  const defaultRoles = ["User"];

  async function handleSubmit() {
    if (isSignUp) {
      try {
        const newAccount = await apiSignUp(
          email,
          password,
          firstName,
          lastName,
          defaultRoles,
          username
        );
        Alert.alert("Success", `Account created for ${newAccount.email}`);
        // Option 1: Switch back to sign-in
        setIsSignUp(false);

        // Option 2: Or automatically sign them in if your backend returns a token:
        // e.g. if the backend's makeAccount returns an accessToken, then do:
        // await signIn(newAccount.accessToken, newAccount);
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to create account");
      }
    } else {
      try {
        const data = await apiSignIn(email, password);
        Alert.alert("Welcome", `Hello, ${data.name.first}!`);
        // data has { id, name, accessToken }
        await signIn(data.accessToken, data); // store in AuthContext
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to sign in");
      }
    }
  }

  function toggleMode() {
    setIsSignUp(!isSignUp);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {isSignUp ? "Create Account" : "Sign In"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
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
            value={firstName}
            autoCapitalize="none"
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            autoCapitalize="none"
            onChangeText={setLastName}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            autoCapitalize="none"
            onChangeText={setUsername}
          />
        </>
      )}

      <Button title={isSignUp ? "Sign Up" : "Sign In"} onPress={handleSubmit} />

      <TouchableOpacity onPress={toggleMode} style={styles.toggleBtn}>
        <Text style={styles.toggleText}>
          {isSignUp
            ? "Already have an account? Sign in"
            : "Don't have an account? Sign up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 8,
  },
  toggleBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  toggleText: {
    color: "#007AFF",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
