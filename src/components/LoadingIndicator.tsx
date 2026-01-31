/**
 * LoadingIndicator Component
 * 
 * A consistent loading indicator used across the app.
 * Provides both full-screen and inline variants.
 * 
 * Usage:
 * - Full screen: <LoadingIndicator /> or <LoadingIndicator fullScreen />
 * - Inline with message: <LoadingIndicator message="Loading articles..." />
 * - Custom size: <LoadingIndicator size="small" />
 */

import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';

export interface LoadingIndicatorProps {
  /** Optional message to display below the spinner */
  message?: string;
  /** Size of the spinner */
  size?: 'small' | 'large';
  /** Whether to center in full screen */
  fullScreen?: boolean;
  /** Test ID for testing */
  testID?: string;
}

export function LoadingIndicator({
  message,
  size = 'large',
  fullScreen = true,
  testID = 'loading-indicator',
}: LoadingIndicatorProps) {
  const content = (
    <>
      <ActivityIndicator size={size} color="#3b82f6" />
      {message && <Text style={styles.message}>{message}</Text>}
    </>
  );

  if (fullScreen) {
    return (
      <View style={styles.fullScreen} testID={testID}>
        {content}
      </View>
    );
  }

  return (
    <View style={styles.inline} testID={testID}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
