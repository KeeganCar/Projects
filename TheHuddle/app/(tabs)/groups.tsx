/**
 * TheHuddle – Groups Screen
 * Author: Keegan Carnell
 *
 * Overview:
 * - Toggle between "Discover" (public groups) and "My Groups"
 * - Realtime listener for the user's group memberships
 * - Simple list item: name + member count + thumbnail, routes to /(group)/:id
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs, onSnapshot, doc } from 'firebase/firestore';
import { db, auth } from '../../utils/firebaseConfig';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1506812574058-958514c235b8?q=80&w=2832&auto=format&fit=crop';

export default function GroupsScreen() {
  const router = useRouter();

  // which tab we're showing
  const [activeView, setActiveView] = useState<'discover' | 'myGroups'>('discover');

  // quick inline Group type to keep this file self-contained
  type Group = {
    id: string;
    name?: string;
    isPublic?: boolean;
    members?: string[];
    imageUrl?: string;
    [key: string]: any;
  };

  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // watch user's groups so join/leave updates the UI live
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUserGroups = onSnapshot(userDocRef, async (userDoc) => {
      if (userDoc.exists()) {
        const groupIds = userDoc.data().groups || [];
        if (groupIds.length > 0) {
          const groupsQuery = query(
            collection(db, 'groups'),
            where('__name__', 'in', groupIds)
          );
          const groupsSnapshot = await getDocs(groupsQuery);
          const groupsData = groupsSnapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }));
          setMyGroups(groupsData as Group[]);
        } else {
          setMyGroups([]);
        }
      }
    });

    // fetch public groups once (can layer search later)
    const fetchDiscoverGroups = async () => {
      const q = query(collection(db, 'groups'), where('isPublic', '==', true));
      const querySnapshot = await getDocs(q);
      const groupsData = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setDiscoverGroups(groupsData as Group[]);
    };

    fetchDiscoverGroups().finally(() => setLoading(false));

    // clean up listener
    return () => unsubscribeUserGroups();
  }, []);

  // render for each group cell
  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/(group)/${item.id}`)}
    >
      {/* left: name + members */}
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemText} numberOfLines={1}>
          {item.name}
          {!item.isPublic && ' (Private)'}
        </Text>
        <Text style={styles.itemSubText}>{`${item.members?.length || 0} members`}</Text>
      </View>

      {/* right: thumbnail */}
      <View style={styles.itemImageContainer}>
        <Image
          source={{ uri: item.imageUrl || PLACEHOLDER_IMAGE }}
          style={styles.itemImage}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search groups..."
        placeholderTextColor="#888"
      />

      {/* toggle between Discover / My Groups */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, activeView === 'discover' && styles.toggleButtonActive]}
          onPress={() => setActiveView('discover')}
        >
          <Text
            style={[styles.toggleText, activeView === 'discover' && styles.toggleTextActive]}
          >
            Discover
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, activeView === 'myGroups' && styles.toggleButtonActive]}
          onPress={() => setActiveView('myGroups')}
        >
          <Text
            style={[styles.toggleText, activeView === 'myGroups' && styles.toggleTextActive]}
          >
            My Groups
          </Text>
        </TouchableOpacity>
      </View>

      {/* list of groups for the active tab */}
      <FlatList
        data={activeView === 'myGroups' ? myGroups : discoverGroups}
        renderItem={renderGroupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeView === 'myGroups'
                ? "You haven't joined any groups yet. Find one in the Discover tab!"
                : 'No public groups found.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 24 },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleText: { fontSize: 14, fontWeight: '500', color: '#666666' },
  toggleTextActive: { color: '#1A1A1A', fontWeight: '600' },

  // Search
  input: {
    backgroundColor: '#F2F2F2',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1A1A1A',
  },

  // Item
  itemContainer: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTextContainer: { flex: 1, marginRight: 10 },
  itemText: { fontSize: 16, fontWeight: '600', color: '#333333' },
  itemSubText: { fontSize: 12, color: '#888', marginTop: 4 },
  itemImageContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  itemImage: { width: 75, height: 50, borderRadius: 6 },

  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#666', textAlign: 'center', fontSize: 16, lineHeight: 22 },
});
