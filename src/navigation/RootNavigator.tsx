/**
 * RootNavigator
 * 
 * The top-level navigator that controls the entire app's navigation structure.
 * 
 * React Navigation uses a "stack" metaphor:
 * - Screens are "pushed" onto a stack when you navigate to them
 * - Press back → the screen is "popped" off, revealing the previous one
 * 
 * Think of it like a deck of cards — you add/remove from the top.
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens';

/**
 * Type definition for our navigation routes.
 * 
 * This tells TypeScript which screens exist and what params they accept.
 * `undefined` means the screen takes no parameters.
 * 
 * Benefits:
 * - Autocomplete when navigating: navigation.navigate('Home')
 * - Type errors if you try to navigate to a non-existent screen
 */
export type RootStackParamList = {
  Home: undefined;
  // Add more screens here as we build them:
  // Login: undefined;
  // Profile: { userId: string };
};

// Create the stack navigator with our type definitions
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          // Global options for all screens in this navigator
          headerShown: false, // We'll create custom headers later
          contentStyle: { backgroundColor: '#0f172a' }, // Consistent background
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        {/* Add more screens here as we build them */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
