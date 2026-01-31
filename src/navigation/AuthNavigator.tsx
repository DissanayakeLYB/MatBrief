/**
 * AuthNavigator
 * 
 * Navigation stack for unauthenticated users.
 * Contains screens for signing in and creating accounts.
 * 
 * This navigator is shown when:
 * - No user is signed in
 * - Session has expired
 * - User has signed out
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen, SignupScreen } from '../screens';

/**
 * Type definition for Auth stack routes.
 * 
 * undefined means the screen takes no parameters.
 * This is exported so screens can type their navigation prop.
 */
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f172a' },
        // Smooth transitions
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
