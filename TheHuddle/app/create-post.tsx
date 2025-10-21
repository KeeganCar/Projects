/**
 * TheHuddle – Create Post Screen
 * Author: Keegan Carnell
 *
 * Overview:
 * - Allows a user to post text and/or an image to a specific group
 * - Handles image picking and Firebase Storage upload
 * - Saves the post to Firestore with author + timestamp metadata
 * - Simple layout with preview + loading state
 */

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ImageBackground,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { addDoc, collection, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { db, auth, storage } from '../utils/firebaseConfig';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function CreatePostScreen() {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { groupId, groupName } = useLocalSearchParams<{ groupId: string; groupName: string }>();
  const navigation = useNavigation();

  // set screen title dynamically
  useEffect(() => {
    navigation.setOptions({ title: `Post to ${groupName}` });
  }, [groupName, navigation]);

  // open photo library
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // upload image to Firebase Storage
  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `posts/${Date.now()}-${auth.currentUser?.uid}.jpg`);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  // create post in Firestore
  const handleCreatePost = async () => {
    if (!text.trim() && !imageUri) {
      Alert.alert('Error', 'Please add some text or an image to your post.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to post.');
      return;
    }

    setLoading(true);
    try {
      // fetch display name
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      let authorDisplayName = user.email;
      if (userDoc.exists()) {
        authorDisplayName = userDoc.data().displayName;
      }

      // upload image if provided
      let imageUrl: string | undefined = undefined;
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      }

      // create Firestore doc
      await addDoc(collection(db, 'posts'), {
        groupId: groupId,
        authorId: user.uid,
        authorDisplayName: authorDisplayName,
        text: text.trim(),
        imageUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Your post has been created!');
      router.back();
    } catch (error) {
      console.error('Error creating post: ', error);
      Alert.alert('Error', 'Could not create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* image picker preview */}
      <TouchableOpacity onPress={pickImage}>
        <ImageBackground
          source={imageUri ? { uri: imageUri } : undefined}
          style={styles.imagePickerContainer}
          imageStyle={styles.imageStyle}
        >
          {!imageUri && (
            <View style={styles.placeholderContent}>
              <FontAwesome name="camera" size={24} color="#888" />
              <Text style={styles.placeholderText}>Add Image</Text>
            </View>
          )}
        </ImageBackground>
      </TouchableOpacity>

      {/* text input */}
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={text}
        onChangeText={setText}
        multiline
      />

      <View style={{ flex: 1 }} />

      {/* submit button */}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreatePost}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Post</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 24 },
  imagePickerContainer: {
    height: 200,
    width: '100%',
    backgroundColor: '#F2F2F2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  imageStyle: { borderRadius: 12 },
  placeholderContent: { alignItems: 'center' },
  placeholderText: { marginTop: 8, color: '#888', fontWeight: '500' },
  input: {
    fontSize: 18,
    color: '#1A1A1A',
    minHeight: 100,
    textAlignVertical: 'top',
    padding: 16,
  },
  button: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: { backgroundColor: '#A9A9A9' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
