import { Text, View } from '@/components/Themed';
import { Image, ScrollView, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
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
        <TouchableOpacity style={styles.locationButton}>
          <MapPinIcon />
        </TouchableOpacity>
      </View>

      {/* Main Content - Event Card */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {/* Decorative Background Elements */}
          <View style={styles.decorativeTop} />
          <View style={styles.decorativeMiddle} />
          
          {/* Main Event Card */}
          <View style={styles.eventCard}>
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
                <TouchableOpacity style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.shareButton}>
                  <ShareIcon />
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
  locationButton: {
    width: 40,
    height: 43,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 20,
  },
  cardContainer: {
    position: 'relative',
    marginTop: 25,
  },
  decorativeTop: {
    position: 'absolute',
    top: 0,
    left: 41,
    width: 256,
    height: 63,
    backgroundColor: '#0D0D0D',
    borderRadius: 21.56,
    borderWidth: 0.9,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    opacity: 0.8,
    zIndex: 0,
  },
  decorativeMiddle: {
    position: 'absolute',
    top: 11,
    left: 23,
    width: 292,
    height: 71,
    backgroundColor: '#121212',
    borderRadius: 21.56,
    borderWidth: 0.9,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    zIndex: 1,
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
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 20,
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
