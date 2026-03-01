import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <View><Text>Loading...</Text></View>;
  }

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 25 : 15,
          left: 20,
          right: 20,
          borderRadius: 40,
          height: 70,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(26, 26, 36, 0.9)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          elevation: 10,
          shadowColor: '#E50914',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <View style={StyleSheet.absoluteFill}>
              <BlurView intensity={90} tint="dark" style={[StyleSheet.absoluteFill, { borderRadius: 40, overflow: 'hidden' }]} />
            </View>
          ) : null,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#E50914', // Netflix style primary red
        tabBarInactiveTintColor: '#8A8A93',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? "search" : "search-outline"} size={28} color={color} />
              {focused && <View style={[styles.dot, { backgroundColor: color }]} />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 14 : 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  }
});
