import { Text } from '@/components/Themed';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextStyle } from 'react-native';

interface StreamingTextProps {
  text: string;
  speed?: number; // milliseconds per character
  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
  textAlign?: TextStyle['textAlign'];
  onComplete?: () => void;
}

export default function StreamingText({
  text,
  speed = 30,
  fontSize = 16,
  fontWeight = '400',
  textAlign = 'left',
  onComplete,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setShowCursor(false);
        if (onComplete) {
          onComplete();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  // Cursor blink effect
  useEffect(() => {
    if (!showCursor) return;

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [showCursor]);

  return (
    <Text
      style={[
        styles.text,
        {
          fontSize,
          fontWeight,
          textAlign,
        },
      ]}
    >
      {displayedText}
      {showCursor && displayedText.length < text.length && (
        <Text style={styles.cursor}>|</Text>
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#FFFFFF',
    lineHeight: 24,
  },
  cursor: {
    color: '#FFFFFF',
    opacity: 0.7,
  },
});

