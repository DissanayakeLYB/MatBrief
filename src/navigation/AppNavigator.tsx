/**
 * AppNavigator
 * 
 * Navigation stack for authenticated users.
 * Contains the main app screens that require a signed-in user.
 * 
 * This navigator is shown when:
 * - User is signed in with a valid session
 * 
 * Security Note:
 * This navigator is only rendered when auth state confirms a user exists.
 * Unauthenticated users physically cannot reach these screens because
 * the RootNavigator doesn't render this component for them.
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeedScreen, ArticleScreen } from '../screens';

/**
 * Type definition for App stack routes.
 * 
 * Note: Article takes an articleId parameter.
 * This is used to fetch and display specific article content.
 */
export type AppStackParamList = {
  Feed: undefined;
  Article: { articleId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Feed"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f172a' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="Article" component={ArticleScreen} />
    </Stack.Navigator>
  );
}
