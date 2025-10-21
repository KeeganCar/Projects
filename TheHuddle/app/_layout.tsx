/**
 * TheHuddle – Root Layout
 * Author: Keegan Carnell
 *
 * Overview:
 * - App-wide stack + theme provider
 * - Loads fonts, holds splash until ready
 * - Simple auth state check (guard logic scaffolded)
 * - Presents modal routes for create-group and create-post
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import useColorScheme from './hooks/useColorScheme';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // load fonts (and FA glyphs)
  const [loaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const router = useRouter();
  const segments = useSegments();

  // auth + bootstrap loading
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // watch auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // hide splash once fonts load (or error)
  useEffect(() => {
    if (loaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [loaded, fontError]);

  // auth guard scaffold (kept commented; wire up when ready)
  useEffect(() => {
    if (loading || !loaded) return;

    const inTabsGroup = segments[0] === '(tabs)';

    // if (user && !inTabsGroup) {
    //   // signed in but not in main app → send to tabs
    //   router.replace('/(tabs)');
    // } else if (!user && inTabsGroup) {
    //   // not signed in but trying to access protected area → send to landing
    //   router.replace('/');
    // }
  }, [user, segments, loading, loaded, router]);

  // basic bootstrap spinner while we init
  if (loading || !loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { fontSize: 20, fontWeight: '600', color: '#1A1A1A' },
          headerTintColor: '#333333',
          headerBackTitle: 'Back',
          headerShadowVisible: false,
        }}
      >
        {/* landing / auth entry */}
        <Stack.Screen name="index" options={{ headerShown: false }} />

        {/* main app tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* group detail */}
        <Stack.Screen name="(group)/[id]" />

        {/* create group modal */}
        <Stack.Screen
          name="create-group"
          options={{
            headerTitle: 'Create Group',
            presentation: 'modal',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ color: '#333333', fontSize: 17 }}>Cancel</Text>
              </TouchableOpacity>
            ),
          }}
        />

        {/* create post modal */}
        <Stack.Screen
          name="create-post"
          options={{
            title: '',
            presentation: 'modal',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={{ color: '#333333', fontSize: 17 }}>Cancel</Text>
              </TouchableOpacity>
            ),
          }}
        />

        {/* generic modal route */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
