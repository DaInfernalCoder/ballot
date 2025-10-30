import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';
import { isValidUrl } from '@/utils/url-validator';

export function ExternalLink(
  props: Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string }
) {
  // Validate URL before opening
  const handlePress = (e: any) => {
    if (Platform.OS !== 'web') {
      // Prevent the default behavior of linking to the default browser on native.
      e.preventDefault();
      
      // Validate URL before opening
      if (!isValidUrl(props.href)) {
        console.error('[ExternalLink] Invalid or unsafe URL:', props.href);
        return;
      }
      
      // Open the link in an in-app browser.
      WebBrowser.openBrowserAsync(props.href as string);
    }
  };

  // Don't render link if URL is invalid
  if (!isValidUrl(props.href)) {
    console.warn('[ExternalLink] Skipping invalid URL:', props.href);
    return null;
  }

  return (
    <Link
      target="_blank"
      {...props}
      href={props.href as any}
      onPress={handlePress}
    />
  );
}
