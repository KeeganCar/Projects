/**
 * TheHuddle – Profile Screen
 * Author: Keegan Carnell
 *
 * Overview:
 * - Fetches the signed-in user's profile from Firestore and shows basic info
 * - Simple stats strip (groups count, posts placeholder)
 * - Includes a Sign Out button
 * - Kept minimal on purpose; expand with edit profile / avatar upload later
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../utils/firebaseConfig';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { UserProfile } from '../../types';

export default function ProfileScreen() {
  // user data + loading state
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // fetch profile once on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  // loading UI
  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  // basic fallback if we can't load the profile
  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text>Could not load profile.</Text>
        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // main UI
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <FontAwesome name="user" size={40} color="#333333" />
        </View>
        <Text style={styles.username}>{userData.displayName}</Text>
        <Text style={styles.email}>{userData.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        {/* we can wire these up to real counts later */}
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{userData.groups?.length || 0}</Text>
          <Text style={styles.statLabel}>Groups</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24 },

  profileHeader: { alignItems: 'center', marginBottom: 32 },

  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
  },

  username: { fontSize: 24, fontWeight: '600', color: '#1A1A1A' },
  email: { fontSize: 16, color: '#666666', marginTop: 4 },

  statsContainer: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginBottom: 32, paddingVertical: 16,
    backgroundColor: '#F2F2F2', borderRadius: 12,
  },

  stat: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '600', color: '#1A1A1A' },
  statLabel: { fontSize: 14, color: '#666666', marginTop: 4 },

  button: {
    backgroundColor: '#333333',
    paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 'auto',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
