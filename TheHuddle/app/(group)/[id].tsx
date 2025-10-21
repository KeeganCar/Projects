/**
 * TheHuddle – Group Detail Screen
 * Author: Keegan Carnell
 *
 * Overview:
 * - Shows a group's header (image, description, member count)
 * - Lets the user join/leave the group
 * - Tabs between "Posts" (FlatList of PostCard) and "Chat" (GroupChat)
 * - Live updates via Firestore onSnapshot for both group + posts
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ImageBackground,
  FlatList
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  collection,
  where,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../../utils/firebaseConfig';
import { Group, Post } from '../../types';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import PostCard from '../../components/PostCard';
import GroupChat from '@/components/GroupChat';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();

  // group state
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // content state
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const currentUser = auth.currentUser;

  // grab group doc in realtime
  useEffect(() => {
    if (!id) return;

    const groupRef = doc(db, 'groups', id);
    const unsubscribe = onSnapshot(groupRef, (docSnap) => {
      if (docSnap.exists()) {
        const groupData = { id: docSnap.id, ...docSnap.data() } as Group;
        setGroup(groupData);
        setIsMember(groupData.members?.includes(currentUser?.uid));
      } else {
        setGroup(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, currentUser]);

  // set up the header (title + leave button if member)
  useEffect(() => {
    if (group) {
      navigation.setOptions({
        headerTitle: group.name,
        headerRight: () =>
          isMember ? (
            <TouchableOpacity
              onPress={handleToggleMembership}
              style={{ marginRight: 15 }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FF4D4F" />
              ) : (
                <FontAwesome name="sign-out" size={24} color="#FF4D4F" />
              )}
            </TouchableOpacity>
          ) : null
      });
    }
  }, [group, isMember, isProcessing, navigation]);

  // pull group posts in realtime (newest first)
  useEffect(() => {
    if (!id) return;

    const postsQuery = query(
      collection(db, 'posts'),
      where('groupId', '==', id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
      const postsData = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Post)
      );
      setPosts(postsData);
      setPostsLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // join/leave toggle
  const handleToggleMembership = async () => {
    if (isProcessing || !currentUser) return;

    setIsProcessing(true);
    const groupRef = doc(db, 'groups', id);
    const userRef = doc(db, 'users', currentUser.uid);
    const operation = isMember ? arrayRemove : arrayUnion;

    try {
      await updateDoc(groupRef, { members: operation(currentUser.uid) });
      await updateDoc(userRef, { groups: operation(id) });
    } catch (error) {
      console.error('Error updating membership: ', error);
      Alert.alert('Error', 'Could not update membership.');
    } finally {
      setIsProcessing(false);
    }
  };

  // header UI (image + description + member count + tab toggle)
  const ListHeader = () => (
    <>
      <ImageBackground
        source={group.imageUrl ? { uri: group.imageUrl } : undefined}
        style={styles.headerImage}
      >
        <View style={styles.overlay} />
        <View style={styles.headerContent}>
          <Text style={styles.groupDescription} numberOfLines={3}>
            {group.description}
          </Text>
          <Text style={styles.memberCount}>{group.members.length} Members</Text>
        </View>
      </ImageBackground>

      {!isMember && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.button, styles.joinButton]}
            onPress={handleToggleMembership}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? 'Processing...' : 'Join Group'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.toggleOuterContainer}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'posts' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.toggleText, activeTab === 'posts' && styles.toggleTextActive]}>
              Posts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleButton, activeTab === 'chat' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('chat')}
          >
            <Text style={[styles.toggleText, activeTab === 'chat' && styles.toggleTextActive]}>
              Chat
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  if (loading) {
    return <ActivityIndicator size="large" style={styles.centered} />;
  }

  if (!group) {
    return (
      <View style={styles.centered}>
        <Text>Group not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ListHeader />

      {activeTab === 'posts' ? (
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostCard post={item} />}
          keyExtractor={(item) => item.id}
          // padding inside the list
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ListEmptyComponent={() => {
            // empty state for posts tab
            if (postsLoading) return <ActivityIndicator style={{ marginTop: 50 }} />;
            return (
              <View style={styles.placeholderView}>
                <Text style={styles.placeholderText}>Be the first to post!</Text>
              </View>
            );
          }}
        />
      ) : (
        <View style={styles.chat}>
          <GroupChat groupId={id} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  chat: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },

  headerImage: {
    height: 220,
    justifyContent: 'flex-end',
    backgroundColor: '#E0E0E0' // fallback gray if no image
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  },
  headerContent: {
    padding: 16
  },
  groupDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  memberCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E0E0E0'
  },

  actionContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2'
  },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  joinButton: { backgroundColor: '#333333' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  toggleOuterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2'
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    padding: 4
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666'
  },
  toggleTextActive: {
    color: '#1A1A1A',
    fontWeight: '600'
  },

  placeholderView: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200
  },
  placeholderText: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center'
  }
});
