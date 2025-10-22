import { Text, View } from '@/components/Themed';
import { Image, View as RNView, ScrollView, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// SVG Icons
const BookmarkIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    <Path
      d="M14.167 2.5H5.833c-.917 0-1.658.75-1.658 1.667L4.166 17.5l5.834-2.5 5.833 2.5V4.167c0-.917-.75-1.667-1.666-1.667z"
      stroke="rgba(255, 255, 255, 0.54)"
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

const FilterIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M3 5h18M7 11h10M12 17h3" stroke="rgba(255, 255, 255, 0.54)" strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

// Event data based on Figma
const eventsData = [
  {
    date: '21 Oct 2024',
    events: [
      {
        id: 1,
        name: 'Community Forum',
        location: 'Sunset Park, Arizona',
        datetime: 'Nov 2, 2024 • 6:00 PM',
        image: require('@/assets/images/event1.png'),
      },
      {
        id: 2,
        name: 'Creek Cleanup',
        location: 'Sunset Park, Arizona',
        datetime: 'Nov 2, 2024 • 6:00 PM',
        image: require('@/assets/images/event2.png'),
      },
    ],
  },
  {
    date: '28 Oct 2024',
    events: [
      {
        id: 3,
        name: 'Town Hall Meeting',
        location: 'Mountain View, Arizona',
        datetime: 'Nov 5, 2024 • 7:00 PM',
        image: require('@/assets/images/event3.png'),
      },
      {
        id: 4,
        name: 'Town Hall Meeting',
        location: 'Mountain View, Arizona',
        datetime: 'Nov 5, 2024 • 7:00 PM',
        image: require('@/assets/images/event4.png'),
      },
    ],
  },
  {
    date: '31 Oct 2024',
    events: [
      {
        id: 5,
        name: 'Community Meeting',
        location: 'Mountain View, Arizona',
        datetime: 'Nov 5, 2024 • 7:00 PM',
        image: require('@/assets/images/event5.png'),
      },
    ],
  },
];

export default function EventsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <TouchableOpacity>
          <FilterIcon />
        </TouchableOpacity>
      </View>

      {/* Event List */}
      <ScrollView
        style={styles.eventList}
        contentContainerStyle={styles.eventListContent}
        showsVerticalScrollIndicator={false}
      >
        {eventsData.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.eventGroup}>
            {/* Date Header */}
            <Text style={styles.dateHeader}>{group.date}</Text>
            
            {/* Events Container */}
            <View style={styles.eventContainer}>
              {group.events.map((event) => (
                <TouchableOpacity key={event.id} style={styles.eventCard}>
                  <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
                  
                  <RNView style={styles.eventDetails}>
                    <Text style={styles.eventName}>{event.name}</Text>
                    
                    <RNView style={styles.eventMeta}>
                      <RNView style={styles.metaRow}>
                        <LocationIcon />
                        <Text style={styles.metaText}>{event.location}</Text>
                      </RNView>
                      
                      <RNView style={styles.metaRow}>
                        <CalendarIcon />
                        <Text style={styles.metaText}>{event.datetime}</Text>
                      </RNView>
                    </RNView>
                  </RNView>
                  
                  <TouchableOpacity style={styles.bookmarkButton}>
                    <BookmarkIcon />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Reuse icons from home screen
const LocationIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1.333A4.667 4.667 0 003.333 6c0 3.5 4.667 8.667 4.667 8.667S12.667 9.5 12.667 6A4.667 4.667 0 008 1.333zm0 6.334A1.667 1.667 0 116.333 6 1.667 1.667 0 018 7.667z"
      fill="white"
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={14} height={14} viewBox="0 0 16 16" fill="none">
    <Path
      d="M12.667 2.667h-1.334V2a.667.667 0 00-1.333 0v.667H6V2a.667.667 0 00-1.333 0v.667H3.333A1.333 1.333 0 002 4v9.333A1.333 1.333 0 003.333 14.667h9.334A1.333 1.333 0 0014 13.333V4a1.333 1.333 0 00-1.333-1.333zm0 10.666H3.333V6.667h9.334v6.666z"
      fill="white"
    />
  </Svg>
);

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
    paddingTop: 71,
    paddingBottom: 17,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.48,
  },
  eventList: {
    flex: 1,
  },
  eventListContent: {
    paddingHorizontal: 20,
    paddingTop: 23,
    paddingBottom: 120,
    gap: 23,
  },
  eventGroup: {
    gap: 16,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '300',
    color: 'rgba(255, 255, 255, 0.54)',
    lineHeight: 27,
    letterSpacing: -0.36,
  },
  eventContainer: {
    gap: 12,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#151515',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    padding: 15,
    gap: 12,
    alignItems: 'flex-start',
  },
  eventImage: {
    width: 70,
    height: 61,
    borderRadius: 12,
  },
  eventDetails: {
    flex: 1,
    gap: 14,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 27,
    letterSpacing: -0.36,
  },
  eventMeta: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.31,
    opacity: 0.54,
  },
  metaText: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 16.5,
    flex: 1,
  },
  bookmarkButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
