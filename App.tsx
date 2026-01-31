/**
 * App.tsx - Application Entry Point
 * 
 * This is the root component that Expo loads first.
 * Its job is minimal: set up providers and render the navigator.
 * 
 * "Providers" are components that wrap your app to give all children
 * access to certain features (like safe area insets, themes, etc.)
 */

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* 
        StatusBar controls the top bar (time, battery, signal).
        'light' = white icons (for dark backgrounds)
        'dark' = black icons (for light backgrounds)
        'auto' = matches system theme
      */}
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
