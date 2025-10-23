import FlippableCard from '@/components/FlippableCard';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { Image, Keyboard, ScrollView, StatusBar, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// SVG Icon Components
const MapPinIcon = () => (
  <Svg width={34} height={33} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      fill="white"
      fillOpacity={0.54}
      stroke="white"
      strokeOpacity={0.54}
      strokeWidth={2}
    />
  </Svg>
);

const LocationIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1.333A4.667 4.667 0 003.333 6c0 3.5 4.667 8.667 4.667 8.667S12.667 9.5 12.667 6A4.667 4.667 0 008 1.333zm0 6.334A1.667 1.667 0 116.333 6 1.667 1.667 0 018 7.667z"
      fill="white"
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M12.667 2.667h-1.334V2a.667.667 0 00-1.333 0v.667H6V2a.667.667 0 00-1.333 0v.667H3.333A1.333 1.333 0 002 4v9.333A1.333 1.333 0 003.333 14.667h9.334A1.333 1.333 0 0014 13.333V4a1.333 1.333 0 00-1.333-1.333zm0 10.666H3.333V6.667h9.334v6.666z"
      fill="white"
    />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
      fill="white"
    />
  </Svg>
);

export default function HomeScreen() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const expansion = useSharedValue(0);
  const [flipped, setFlipped] = useState(false);

  // Animate expansion when isExpanded changes
  useEffect(() => {
    expansion.value = withSpring(isExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 150,
    });
  }, [isExpanded]);

  // Handle keyboard dismiss
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (isExpanded && !searchText) {
          setIsExpanded(false);
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [isExpanded, searchText]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        expansion.value,
        [0, 1],
        [40, 170]
      ),
      height: 48,
      borderRadius: interpolate(
        expansion.value,
        [0, 1],
        [20, 8]
      ),
      backgroundColor: interpolate(
        expansion.value,
        [0, 1],
        [0, 0.54]
      ) as any,
      borderWidth: interpolate(
        expansion.value,
        [0, 1],
        [0, 1]
      ),
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(expansion.value, [0, 0.3], [1, 0]),
      transform: [
        {
          scale: interpolate(expansion.value, [0, 0.3], [1, 0.8]),
        },
      ],
    };
  });

  const textInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(expansion.value, [0.5, 1], [0, 1]),
    };
  });

  const handlePress = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleBlur = () => {
    if (!searchText) {
      setIsExpanded(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Logo and Location Pin */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/ballot-logo-258118.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity 
          style={styles.locationButtonContainer}
          onPress={handlePress}
          activeOpacity={1}
        >
          <Animated.View style={[styles.locationButton, animatedStyle]}>
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <MapPinIcon />
            </Animated.View>
            {isExpanded && (
              <Animated.View style={[styles.textInputContainer, textInputAnimatedStyle]}>
                <Svg width={20} height={24} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                  <Path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill="white"
                    fillOpacity={0.54}
                    stroke="white"
                    strokeOpacity={0.54}
                    strokeWidth={2}
                  />
                </Svg>
                <TextInput
                  style={styles.textInput}
                  placeholder="District/County"
                  placeholderTextColor="rgba(255, 255, 255, 0.38)"
                  value={searchText}
                  onChangeText={setSearchText}
                  onBlur={handleBlur}
                  autoFocus={true}
                  autoCorrect={false}
                  autoCapitalize="words"
                />
              </Animated.View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Main Content - Event Card */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {/* Main Event Card - Flippable */}
          <FlippableCard
            style={styles.eventCard}
            flipped={flipped}
            front={
              <>
                <Image
                  source={require('@/assets/images/event-image.png')}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>
                    Community Meeting - Discuss Development Plans
                  </Text>
                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <LocationIcon />
                      <Text style={styles.detailText}>Phoenix, Arizona</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <CalendarIcon />
                      <Text style={styles.detailText}>Dec 12, 2024 • 7:30 PM</Text>
                    </View>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.viewDetailsButton} onPress={() => setFlipped(true)}>
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareButton}>
                      <ShareIcon />
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            }
            back={
              <View style={styles.backFaceContainer}>
                <View style={styles.eventContent}>
                  <Text style={styles.backTitle}>
                    Community Meeting - Discuss Development Plans
                  </Text>
                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <LocationIcon />
                      <Text style={styles.detailText}>Phoenix, Arizona</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <CalendarIcon />
                      <Text style={styles.detailText}>Dec 12, 2024 • 7:30 PM</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.backButton} onPress={() => setFlipped(false)}>
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#000000',
  },
  logo: {
    width: 117,
    height: 29,
  },
  locationButtonContainer: {
    position: 'relative',
  },
  locationButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.54)',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    width: '100%',
    height: '100%',
  },
  inputIcon: {
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0.4,
  },
  locationIcon: {
    width: 34,
    height: 33,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  cardContainer: {
    position: 'relative',
    marginTop: 25,
  },
  eventCard: {
    backgroundColor: '#151515',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    marginTop: 25,
    zIndex: 2,
  },
  eventImage: {
    width: '100%',
    height: 293,
  },
  eventContent: {
    padding: 20,
  },
  backFaceContainer: {
    backgroundColor: '#151515',
    width: '100%',
    height: '100%',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  backTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 27,
    letterSpacing: -0.3,
    marginBottom: 16,
    opacity: 0.92,
  },
  eventDetails: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    opacity: 0.54,
  },
  detailIcon: {
    width: 16,
    height: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 16.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  viewDetailsButton: {
    flex: 1,
    height: 54,
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 22.5,
    letterSpacing: -0.3,
  },
  backButton: {
    height: 54,
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 22.5,
    letterSpacing: -0.3,
  },
  shareButton: {
    width: 54,
    height: 54,
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    width: 24,
    height: 24,
  },
});
