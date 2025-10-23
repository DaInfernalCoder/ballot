import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import SwipeableEventCard from '@/components/SwipeableEventCard';
import { Text, View } from '@/components/Themed';
import { useEvents } from '@/contexts/events-context';
import { useState } from 'react';
import { Image, View as RNView, ScrollView, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function EventsScreen() {
  const { savedEvents, removeSavedEventById } = useEvents();
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    eventId: string | null;
    eventName: string;
  }>({
    visible: false,
    eventId: null,
    eventName: '',
  });

  const handleDeletePress = (eventId: string, eventName: string) => {
    setConfirmModal({ visible: true, eventId, eventName });
  };

  const handleConfirmDelete = () => {
    if (confirmModal.eventId) removeSavedEventById(confirmModal.eventId);
    setConfirmModal({ visible: false, eventId: null, eventName: '' });
  };

  const handleCancelDelete = () => setConfirmModal({ visible: false, eventId: null, eventName: '' });

  const hasAny = savedEvents.length > 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Events</Text>
      </View>

      {/* Event List */}
      <ScrollView
        style={styles.eventList}
        contentContainerStyle={[styles.eventListContent, !hasAny && { flex: 1, justifyContent: 'center', alignItems: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        {!hasAny && (
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}>No saved events yet. Swipe right on a card to add.</Text>
        )}

        {hasAny && (
          <View style={styles.eventGroup}>
            <View style={styles.eventContainer}>
              {savedEvents.map((event) => (
                <SwipeableEventCard
                  key={event.id}
                  onDelete={() => removeSavedEventById(event.id)}
                  onDeletePress={() => handleDeletePress(event.id, event.title)}
                >
                  <TouchableOpacity style={styles.eventCard}>
                    <Image source={event.image} style={styles.eventImage} resizeMode="cover" />

                    <RNView style={styles.eventDetails}>
                      <Text style={styles.eventName}>{event.title}</Text>

                      <RNView style={styles.eventMeta}>
                        <RNView style={styles.metaRow}>
                          <LocationIcon />
                          <Text style={styles.metaText}>{event.location}</Text>
                        </RNView>

                        <RNView style={styles.metaRow}>
                          <CalendarIcon />
                          <Text style={styles.metaText}>{event.date}</Text>
                        </RNView>
                      </RNView>
                    </RNView>
                  </TouchableOpacity>
                </SwipeableEventCard>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={confirmModal.visible}
        eventName={confirmModal.eventName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
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
    // Gap removed - handled by SwipeableEventCard marginBottom
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
});
