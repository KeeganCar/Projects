/**
 * TheHuddle – Select Group Screen
 * Author: Keegan Carnell
 *
 * Overview:
 * - Lists groups the current user belongs to
 * - Tapping a group routes to /create-post with that group's id/name
 * - Keeps group list live via onSnapshot on the user doc
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../utils/firebaseConfig';
import { Group } from '../../types';

export default function SelectGroupScreen() {
  const router = useRouter();

  // user's groups + loading
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // watch the user doc for changes to the groups array
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, async (userDoc) => {
      if (userDoc.exists() && userDoc.data().groups) {
        const groupIds = userDoc.data().groups as string[];

        if (groupIds.length > 0) {
          // fetch all group docs by id (Firestore __name__ in query)
          const groupsQuery = query(
            collection(db, 'groups'),
            where('__name__', 'in', groupIds)
          );
          const querySnapshot = await getDocs(groupsQuery);
          const groupsData = querySnapshot.docs.map(
            (d) => ({ id: d.id, ...d.data() } as Group)
          );
          setMyGroups(groupsData);
        } else {
          setMyGroups([]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // go to create-post with group params
  const handleSelectGroup = (item: Group) => {
    router.push({
      pathname: '/create-post',
      params: { groupId: item.id, groupName: item.name },
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Group</Text>

      <FlatList
        data={myGroups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => handleSelectGroup(item)}
          >
            <Text style={styles.itemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You must join a group before you can post.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24 },
  title: { fontSize: 20, fontWeight: '600', color: '#1A1A1A', marginBottom: 20 },
  itemContainer: { backgroundColor: '#F9F9F9', padding: 20, borderRadius: 12, marginBottom: 12 },
  itemText: { fontSize: 16, fontWeight: '600', color: '#333333' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 50 },
});
