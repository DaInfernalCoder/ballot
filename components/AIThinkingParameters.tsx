import { Text, View } from '@/components/Themed';
import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import ThinkingDots from './ThinkingDots';

interface AIThinkingParametersProps {
  location: string;
}

const BrainIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 3C9.23 3 6.19 5.95 6 9.66l-1.92.58C2.75 10.58 1.5 11.84 1.5 13.5c0 1.93 1.57 3.5 3.5 3.5h1.75c.69 0 1.25.56 1.25 1.25V19c0 1.1.9 2 2 2h1c.55 0 1-.45 1-1v-1h2v1c0 .55.45 1 1 1h1c1.1 0 2-.9 2-2v-.75c0-.69.56-1.25 1.25-1.25H20c1.93 0 3.5-1.57 3.5-3.5 0-1.66-1.25-2.92-2.58-3.26l-1.92-.58C18.81 5.95 15.77 3 12 3h1z"
      fill="white"
      fillOpacity={0.7}
    />
  </Svg>
);

export default function AIThinkingParameters({ location }: AIThinkingParametersProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <BrainIcon />
        <ThinkingDots />
      </View>
      
      <Text style={styles.title}>Searching for events...</Text>
      
      <View style={styles.parametersContainer}>
        <View style={styles.parameterRow}>
          <Text style={styles.parameterLabel}>Model:</Text>
          <Text style={styles.parameterValue}>Perplexity Sonar Pro</Text>
        </View>
        
        <View style={styles.parameterRow}>
          <Text style={styles.parameterLabel}>Temperature:</Text>
          <Text style={styles.parameterValue}>0.2 (Precise)</Text>
        </View>
        
        <View style={styles.parameterRow}>
          <Text style={styles.parameterLabel}>Max Tokens:</Text>
          <Text style={styles.parameterValue}>5000</Text>
        </View>
        
        <View style={styles.parameterRow}>
          <Text style={styles.parameterLabel}>Location:</Text>
          <Text style={styles.parameterValue}>{location}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 32,
    opacity: 0.9,
  },
  parametersContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  parameterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parameterLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

