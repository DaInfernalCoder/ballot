import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Tab Icon Components
const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      fill={color}
    />
  </Svg>
);

const EventsIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
      fill={color}
    />
  </Svg>
);

// Home Indicator Component
const HomeIndicator = () => (
  <View 
    style={{ 
      position: 'absolute',
      bottom: 21,
      left: '50%',
      marginLeft: -74,
      width: 148,
      height: 5,
      backgroundColor: '#1E1E1E',
      borderRadius: 2.5,
    }} 
  />
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#151515',
          borderTopWidth: 0,
          height: 98,
          paddingTop: 15,
          paddingBottom: 0,
          paddingHorizontal: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -20 },
          shadowOpacity: 0.08,
          shadowRadius: 60,
          elevation: 20,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.54)',
        tabBarItemStyle: {
          paddingTop: 2,
          paddingBottom: 34,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 18,
          letterSpacing: 0.06,
          marginTop: 4,
        },
        tabBarBackground: () => (
          <View style={{ 
            flex: 1, 
            backgroundColor: '#151515',
          }}>
            <HomeIndicator />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <HomeIcon color={color} />
          ),
          tabBarLabelStyle: {
            fontFamily: 'System',
            fontWeight: '600',
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: -0.24,
            marginTop: 4,
          },
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Events',
          tabBarIcon: ({ focused, color }) => (
            <EventsIcon color={color} />
          ),
          tabBarLabelStyle: {
            fontFamily: 'System',
            fontWeight: '400',
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: 0.06,
            marginTop: 4,
          },
        }}
      />
    </Tabs>
  );
}
