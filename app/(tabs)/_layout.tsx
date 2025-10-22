import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import EventsIconSvg from '../../assets/images/events-icon.svg';
import HomeIconSvg from '../../assets/images/home-icon.svg';

// Tab Icon Components using SVG
const HomeIcon = ({ color, focused }: { color: string, focused: boolean }) => {
  const opacity = focused ? 1 : 0.54;
  return (
    <HomeIconSvg
      width={24}
      height={24}
      fill={color}
      opacity={opacity}
    />
  );
};

const EventsIcon = ({ color, focused }: { color: string, focused: boolean }) => {
  const opacity = focused ? 1 : 0.54;
  return (
    <EventsIconSvg
      width={24}
      height={24}
      fill={color}
      opacity={opacity}
    />
  );
};

// Home Indicator Component - iOS style
const HomeIndicator = () => (
  <View 
    style={{ 
      position: 'absolute',
      bottom: 8,
      left: '50%',
      marginLeft: -74,
      width: 148,
      height: 5,
      backgroundColor: '#1E1E1E',
      borderRadius: 100,
    }} 
  />
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#151515',
          borderTopWidth: 0,
          height: 98,
          paddingTop: 15,
          paddingBottom: 34,
          paddingLeft: 24,
          paddingRight: 24,
          // iOS Shadow
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -20 },
          shadowOpacity: 0.08,
          shadowRadius: 60,
          // Android Shadow
          elevation: 20,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.54)',
        tabBarItemStyle: {
          paddingTop: 1.5,
          paddingBottom: 0,
          gap: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 18,
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
          tabBarIcon: ({ color, focused }) => <HomeIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => <EventsIcon color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
