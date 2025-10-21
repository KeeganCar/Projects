/**
 * TheHuddle – Tabs Layout
 * Author: Keegan Carnell
 *
 * Overview:
 * - Bottom tab navigator for the app
 * - Simple, clean headers + icons
 * - Groups tab adds a headerRight "+" that routes to /create-group
 * - Kept minimal on purpose (no auth/dark-mode logic here)
 */

import React from 'react';
import { Tabs, useRouter, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
// import Colors from '@/constants/Colors';
// import { ActivityIndicator, View } from 'react-native';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from '../../utils/firebaseConfig';

// tiny helper so icons are consistent
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  // if you wire up dark mode later, swap this out
  const colorScheme = 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1A1A1A',
        tabBarInactiveTintColor: '#A9A9A9',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: '600',
          color: '#1A1A1A',
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          headerTitle: '',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />

      <Tabs.Screen
        name="groups"
        options={{
          title: '',
          headerTitle: 'Groups',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/create-group')}
              style={{ marginRight: 15 }}
            >
              <FontAwesome name="plus-circle" size={28} color="#333333" />
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: '',
          headerTitle: 'Create a Post',
          tabBarIcon: ({ color }) => <TabBarIcon name="plus-square" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          headerTitle: '',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
