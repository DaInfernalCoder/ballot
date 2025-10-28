import { SavedEvent } from '@/types/event';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Permission not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Event Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#7876FD',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('[Notifications] Permission request failed:', error);
    return false;
  }
}

/**
 * Parse event date and time strings into a Date object
 * Example inputs:
 * - date: "Dec 12, 2024" or "December 12, 2024"
 * - time: "7:30 PM" or "7:30 PM - 9:00 PM"
 */
function parseEventDateTime(dateStr: string, timeStr?: string): Date | null {
  try {
    // Parse the date part
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.warn('[Notifications] Invalid date format:', dateStr);
      return null;
    }

    // If time is provided, parse it
    if (timeStr) {
      // Extract start time (handles "7:30 PM" or "7:30 PM - 9:00 PM")
      const startTime = timeStr.split('-')[0].trim();

      // Parse time (e.g., "7:30 PM")
      const timeMatch = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const meridiem = timeMatch[3].toUpperCase();

        // Convert to 24-hour format
        if (meridiem === 'PM' && hours !== 12) {
          hours += 12;
        } else if (meridiem === 'AM' && hours === 12) {
          hours = 0;
        }

        date.setHours(hours, minutes, 0, 0);
      } else {
        // If time parsing fails, default to 9 AM
        console.warn('[Notifications] Could not parse time, defaulting to 9 AM:', timeStr);
        date.setHours(9, 0, 0, 0);
      }
    } else {
      // No time provided, default to 9 AM
      date.setHours(9, 0, 0, 0);
    }

    return date;
  } catch (error) {
    console.error('[Notifications] Error parsing date/time:', error);
    return null;
  }
}

/**
 * Schedule a notification for an event (1 hour before event time)
 * @returns notification ID if successful, null otherwise
 */
export async function scheduleEventNotification(event: SavedEvent): Promise<string | null> {
  try {
    const eventDateTime = parseEventDateTime(event.date, event.time);

    if (!eventDateTime) {
      console.warn('[Notifications] Could not parse event date/time:', event);
      return null;
    }

    // Calculate notification time (1 hour before event)
    const notificationTime = new Date(eventDateTime.getTime() - 60 * 60 * 1000);

    // Don't schedule notifications for past events
    const now = new Date();
    if (notificationTime <= now) {
      console.log('[Notifications] Event is in the past, skipping notification:', event.title);
      return null;
    }

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Event Starting Soon!`,
        body: `${event.title} starts in 1 hour at ${event.time || '9:00 AM'}`,
        data: {
          eventId: event.id,
          eventTitle: event.title,
          eventLocation: event.location,
          eventTime: event.time,
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: notificationTime,
        channelId: 'default',
      },
    });

    console.log(
      `[Notifications] Scheduled notification for "${event.title}" at ${notificationTime.toLocaleString()}`
    );

    return notificationId;
  } catch (error) {
    console.error('[Notifications] Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('[Notifications] Cancelled notification:', notificationId);
  } catch (error) {
    console.error('[Notifications] Failed to cancel notification:', error);
  }
}

/**
 * Trigger an immediate test notification for an event
 */
export async function triggerTestNotification(event: SavedEvent): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: `${event.title}\n${event.location}${event.time ? ' • ' + event.time : ''}`,
        data: {
          eventId: event.id,
          test: true,
        },
        sound: 'default',
      },
      trigger: null, // Immediate delivery
    });

    console.log('[Notifications] Triggered test notification for:', event.title);
  } catch (error) {
    console.error('[Notifications] Failed to trigger test notification:', error);
    throw error;
  }
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('[Notifications] Failed to get scheduled notifications:', error);
    return [];
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] Cancelled all notifications');
  } catch (error) {
    console.error('[Notifications] Failed to cancel all notifications:', error);
  }
}
