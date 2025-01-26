// vintainApp/app/auth.tsx
import React, { useContext, useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../context/authContext';
// Adjust import path to your GraphQL calls
import { signIn as apiSignIn, signUp as apiSignUp } from '../src/apiService';

export default function AuthScreen() {
  const { signIn } = useContext(AuthContext);

  // Toggle sign-in / sign-up
  const [isSignUp, setIsSignUp] = useState(false);

  // Form fields for both
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Additional fields for sign-up
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Example roles for new users
  const defaultRoles = ['User'];

  async function handleSubmit() {
    if (isSignUp) {
      // Attempt sign-up
      try {
        const newAccount = await apiSignUp(email, password, firstName, lastName, defaultRoles);
        Alert.alert('Success', `Account created for ${newAccount.email}`);
        // Option 1: Switch back to sign-in mode
        setIsSignUp(false);
        // Option 2: Or automatically sign them in:
        // await signIn(TOKEN_FROM_BACKEND, { id: newAccount.id, ... });
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to create account');
      }
    } else {
      // Attempt sign-in
      try {
        const data = await apiSignIn(email, password);
        Alert.alert('Welcome', `Hello, ${data.name.first}!`);
        // data.accessToken is presumably your JWT token
        // pass user data if you want
        await signIn(data.accessToken, data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed to sign in');
      }
    }
  }

  function toggleMode() {
    setIsSignUp((prev) => !prev);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {isSignUp ? 'Create Account' : 'Sign In'}
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
        onChangeText={setPassword}
      />

      {isSignUp && (
        <>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </>
      )}

      <Button
        title={isSignUp ? 'Sign Up' : 'Sign In'}
        onPress={handleSubmit}
      />

      <TouchableOpacity onPress={toggleMode} style={styles.toggleBtn}>
        <Text style={styles.toggleText}>
          {isSignUp
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 16, justifyContent: 'center',
  },
  header: {
    fontSize: 24, marginBottom: 16, textAlign: 'center',
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', marginBottom: 12, padding: 8,
  },
  toggleBtn: {
    marginTop: 12,
    alignItems: 'center',
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});