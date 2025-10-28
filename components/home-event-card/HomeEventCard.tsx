import FlippableCard from '@/components/FlippableCard';
import SwipeActionCard from '@/components/SwipeActionCard';
import { Text, View } from '@/components/Themed';
import { useEvents } from '@/contexts/events-context';
import { SavedEvent } from '@/types/event';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HomeEventCardProps extends SavedEvent {
  flipped: boolean;
  onFlip: () => void;
  onUnflip: () => void;
  onDismiss: (id: string) => void;
  style?: any;
}

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


export function HomeEventCard({
  id,
  title,
  location,
  date,
  image,
  imageKey,
  imageUrl,
  flipped,
  onFlip,
  onUnflip,
  onDismiss,
  style,
  address,
  time,
  venue,
  organizer,
  websiteLink,
  impactStatement,
  qaPairs,
  aiOverview,
  link,
  sourceUrls,
  tags,
}: HomeEventCardProps) {
  const { addSavedEvent } = useEvents();

  // Prioritize Unsplash URL over local image
  const imageSource = imageUrl ? { uri: imageUrl } : image;

  const cardContent = (
    <FlippableCard
      style={[
        styles.eventCard,
        style,
      ]}
      flipped={flipped}
      front={
          <>
            <Image
              source={imageSource}
              style={styles.eventImage}
              contentFit="cover"
              transition={200}
              allowDownscaling
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{title}</Text>
              <View style={styles.eventDetails}>
                <View style={styles.detailRow}>
                  <LocationIcon />
                  <Text style={styles.detailText}>{location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <CalendarIcon />
                  <Text style={styles.detailText}>{date}</Text>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.viewDetailsButton} onPress={onFlip}>
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
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
              showsVerticalScrollIndicator={false}
              bounces={true}
              nestedScrollEnabled={true}
              directionalLockEnabled={true}
            >
              <View style={styles.eventContent}>
                <Text style={styles.backTitle}>{title}</Text>

                {/* Top Section - Event Details */}
                <View style={styles.detailsSection}>
                  {venue && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Venue</Text>
                      <Text style={styles.detailValue}>{venue}</Text>
                    </View>
                  )}

                  {address && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Address</Text>
                      <View style={styles.addressRow}>
                        <Text style={[styles.detailValue, styles.addressText]}>{address}</Text>
                        <LocationIcon />
                      </View>
                    </View>
                  )}

                  {organizer && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Organizer</Text>
                      <Text style={styles.detailValue}>{organizer}</Text>
                    </View>
                  )}

                  {websiteLink && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Website</Text>
                      <Text style={[styles.detailValue, styles.linkText]} numberOfLines={1}>
                        {websiteLink}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Bottom Section - Impact & Q&A */}
                {(impactStatement || aiOverview) && (
                  <View style={styles.impactSection}>
                    <Text style={styles.impactHeading}>Impact of This Event</Text>
                    <Text style={styles.impactText}>
                      {impactStatement || aiOverview}
                    </Text>
                  </View>
                )}

                {qaPairs && qaPairs.length > 0 && (
                  <View style={styles.qaSection}>
                    {qaPairs.map((qa, index) => (
                      <View key={index} style={styles.qaItem}>
                        <Text style={styles.qaQuestion}>{qa.question}</Text>
                        <Text style={styles.qaAnswer}>{qa.answer}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Close Details button at bottom */}
            <View style={styles.backButtonContainer}>
              <TouchableOpacity style={styles.closeDetailsButton} onPress={onUnflip}>
                <Text style={styles.closeDetailsText}>Close Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
  );

  // Use SwipeActionCard for horizontal swipe gestures
  return (
    <SwipeActionCard
      onSwipeRight={() => {
        addSavedEvent({
          id,
          title,
          location,
          date,
          image,
          imageKey,
          imageUrl,
          address,
          time,
          venue,
          organizer,
          websiteLink,
          impactStatement,
          qaPairs,
          aiOverview,
          link,
          sourceUrls,
          tags,
        });
        onDismiss(id);
      }}
      onSwipeLeft={() => onDismiss(id)}
    >
      {cardContent}
    </SwipeActionCard>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: 'column',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  backButtonContainer: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#151515',
  },
  closeDetailsButton: {
    height: 54,
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeDetailsText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 22.5,
    letterSpacing: -0.3,
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
  detailsSection: {
    marginBottom: 16,
    gap: 12,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.54,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    opacity: 0.92,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  addressText: {
    flex: 1,
  },
  linkText: {
    color: '#60A5FA',
    textDecorationLine: 'underline',
  },
  impactSection: {
    marginBottom: 16,
  },
  impactHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    opacity: 0.92,
  },
  impactText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    opacity: 0.7,
  },
  qaSection: {
    gap: 12,
    marginBottom: 16,
  },
  qaItem: {
    gap: 4,
  },
  qaQuestion: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.87,
  },
  qaAnswer: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
    opacity: 0.7,
  },
});

export default HomeEventCard;


