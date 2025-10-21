/**
 * TheHuddle – Create Group Screen
 * Author: Keegan Carnell
 *
 * Overview:
 * - Lets a logged-in user create a new group
 * - Uses Firestore batch write to add group + update user's group list atomically
 * - Supports public/private toggle
 * - Minimal form with validation + loading state
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { doc, writeBatch, serverTimestamp, collection, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../utils/firebaseConfig';

export default function CreateGroupScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // create group + update user’s doc in one transaction
  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Group name is required.');
      return;
    }
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      Alert.alert('Error', 'You must be logged in to create a group.');
      router.replace('./index');
      return;
    }

    const batch = writeBatch(db);
    const groupRef = doc(collection(db, 'groups'));

    // group doc
    batch.set(groupRef, {
      name: name.trim(),
      description: description.trim(),
      isPublic,
      creatorId: user.uid,
      createdAt: serverTimestamp(),
      members: [user.uid],
    });

    // update user’s groups array
    const userRef = doc(db, 'users', user.uid);
    batch.update(userRef, {
      groups: arrayUnion(groupRef.id),
    });

    try {
      await batch.commit();
      Alert.alert('Success', 'Group created successfully!');
      router.back();
    } catch (error) {
      console.error('Error creating group: ', error);
      Alert.alert('Error', 'Could not create the group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* toggle for public/private */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Public Group</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isPublic ? '#f5dd4b' : '#f4f3f4'}
          onValueChange={() => setIsPublic((prev) => !prev)}
          value={isPublic}
        />
      </View>
      <Text style={styles.switchDescription}>
        Public groups are visible in search. Private groups are by invitation only.
      </Text>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateGroup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Create Group'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 24, color: '#1A1A1A' },
  input: {
    backgroundColor: '#F2F2F2',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1A1A1A',
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  switchLabel: { fontSize: 16, color: '#1A1A1A' },
  switchDescription: { fontSize: 14, color: '#666666', marginBottom: 24 },
  button: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#A9A9A9' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
