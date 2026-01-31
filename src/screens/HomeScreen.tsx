/**
 * HomeScreen
 * 
 * The main landing screen of the app after launch.
 * This is a placeholder — we'll build it out as we add features.
 */

import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>MatBrief</Text>
        <Text style={styles.subtitle}>Your app is ready to build!</Text>
      </View>
    </SafeAreaView>
  );
}

/**
 * StyleSheet.create() is React Native's way of defining styles.
 * 
 * Why not inline styles?
 * 1. Performance: StyleSheet creates optimized style objects once
 * 2. Validation: Catches typos at compile time with TypeScript
 * 3. Readability: Keeps JSX clean, styles organized at bottom
 */
const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes up all available space
    backgroundColor: '#0f172a', // Dark slate background
  },
  content: {
    flex: 1,
    alignItems: 'center', // Center horizontally
    justifyContent: 'center', // Center vertically
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f8fafc', // Light text for dark background
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8', // Muted gray text
  },
});
