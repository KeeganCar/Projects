/**
 * TheHuddle – Auth (Index) Screen
 * Author: Keegan Carnell
 *
 * Overview:
 * - Handles user authentication (Sign In + Sign Up)
 * - Sign In on main screen; Sign Up handled via modal overlay
 * - Uses Firebase Auth + Firestore to persist user info
 * - Redirects to main app tabs after success
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { db, auth } from '../utils/firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { router } from 'expo-router';

export default function Index() {
  // --- sign in state ---
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // --- sign up modal state ---
  const [signUpDisplayName, setSignUpDisplayName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');

  // --- shared state ---
  const [error, setError] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // create new user
  const handleSignUp = async () => {
    if (!signUpDisplayName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setError('All fields are required.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signUpEmail,
        signUpPassword
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: signUpDisplayName.trim() });

      // add user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: signUpDisplayName.trim(),
        createdAt: serverTimestamp(),
        groups: [],
      });

      console.log('User signed up and document created.');
      setModalVisible(false);
      router.replace('/(tabs)');
    } catch (error: any) {
      setError(error.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  // sign in existing user
  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        signInEmail,
        signInPassword
      );
      if (userCredential.user) router.replace('/(tabs)');
    } catch (error: any) {
      setError(error.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* =============== SIGN-IN SCREEN =============== */}
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>The Huddle</Text>

        {error && !isModalVisible && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          value={signInEmail}
          onChangeText={setSignInEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#A0A0A0"
          value={signInPassword}
          onChangeText={setSignInPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            setError('');
            setModalVisible(true);
          }}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Create an Account
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* =============== SIGN-UP MODAL =============== */}
      <Modal
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            style={styles.innerContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Text style={styles.title}>Create Account</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#A0A0A0"
              value={signUpDisplayName}
              onChangeText={setSignUpDisplayName}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#A0A0A0"
              value={signUpEmail}
              onChangeText={setSignUpEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#A0A0A0"
              value={signUpPassword}
              onChangeText={setSignUpPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  innerContainer: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  title: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 48,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F2F2F2',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#A9A9A9' },
  secondaryButton: { backgroundColor: '#FFFFFF' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButtonText: { color: '#333333' },
  errorText: { color: '#FF4D4F', textAlign: 'center', marginBottom: 16 },
});
