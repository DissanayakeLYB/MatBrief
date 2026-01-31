/**
 * FeedScreen
 * 
 * The main screen showing a list of articles/content.
 * This is a placeholder — we'll add the full UI in the next phase.
 */

import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { signOut } from '../services';

type FeedScreenProps = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Feed'>;
};

export function FeedScreen({ navigation }: FeedScreenProps) {
  const handleSignOut = async () => {
    await signOut();
    // Navigation will automatically switch to Auth stack
    // because RootNavigator listens to auth state changes
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Feed</Text>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
      
      <View style={styles.content}>
        {/* Sample article cards */}
        <Pressable 
          style={styles.card}
          onPress={() => navigation.navigate('Article', { articleId: '1' })}
        >
          <Text style={styles.cardTitle}>Sample Article 1</Text>
          <Text style={styles.cardDescription}>Tap to view article details</Text>
        </Pressable>

        <Pressable 
          style={styles.card}
          onPress={() => navigation.navigate('Article', { articleId: '2' })}
        >
          <Text style={styles.cardTitle}>Sample Article 2</Text>
          <Text style={styles.cardDescription}>Tap to view article details</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
  },
  signOutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1e293b',
    borderRadius: 6,
  },
  signOutText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
