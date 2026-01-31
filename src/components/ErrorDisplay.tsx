/**
 * ErrorDisplay Component
 * 
 * A consistent error display used across the app.
 * Shows error message with optional retry button.
 * 
 * Usage:
 * - With retry: <ErrorDisplay message="Failed to load" onRetry={handleRetry} />
 * - Without retry: <ErrorDisplay message="Something went wrong" />
 * - Custom title: <ErrorDisplay title="Network Error" message="Check connection" />
 */

import { StyleSheet, View, Text, Pressable } from 'react-native';

export interface ErrorDisplayProps {
  /** Error title (default: "Something went wrong") */
  title?: string;
  /** Error message to display */
  message: string;
  /** Callback when retry button is pressed */
  onRetry?: () => void;
  /** Text for retry button (default: "Try Again") */
  retryText?: string;
  /** Whether to center in full screen */
  fullScreen?: boolean;
  /** Test ID for testing */
  testID?: string;
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try Again',
  fullScreen = true,
  testID = 'error-display',
}: ErrorDisplayProps) {
  const content = (
    <>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          testID={`${testID}-retry`}
        >
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </Pressable>
      )}
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
    paddingHorizontal: 32,
    backgroundColor: '#0f172a',
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
