//Tabs layout

import { Tabs } from 'expo-router';
import { Home, List, PlusCircle, ShieldCheck, User } from 'lucide-react-native';
import React from 'react';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
          borderTopWidth: 1,
          borderTopColor: colorScheme === 'dark' ? '#333' : '#eee',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="sell"
        options={{
          title: 'Sell',
          tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="my-listings"
        options={{
          title: 'My Listings',
          tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
        }}
      />

      {/* New Admin Tab */}
      <Tabs.Screen
        name="admin"
        options={{
          title: 'Admin',
          tabBarIcon: ({ color, size }) => <ShieldCheck size={size} color={color} />,
          // hide tab for non-admin users
          href: user?.role === 'admin' ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
