/**
 * FeedScreen
 * 
 * The main screen showing a scrollable list of articles.
 * 
 * Features:
 * - Fetches articles from Supabase on mount
 * - Pull-to-refresh support
 * - Loading, empty, and error state handling
 * - Sign out functionality
 */

import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { signOut, fetchArticles } from '../services';
import { ArticleCard } from '../components';
import type { Article } from '../types';

type FeedScreenProps = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Feed'>;
};

export function FeedScreen({ navigation }: FeedScreenProps) {
  // Data state
  const [articles, setArticles] = useState<Article[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load articles from the service.
   * Called on mount and pull-to-refresh.
   */
  const loadArticles = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    const result = await fetchArticles();

    if (result.error) {
      setError(result.error.message);
      setArticles([]);
    } else {
      setArticles(result.data);
    }

    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  // Fetch articles on mount
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  /**
   * Handle pull-to-refresh.
   */
  const handleRefresh = useCallback(() => {
    loadArticles(true);
  }, [loadArticles]);

  /**
   * Handle sign out button press.
   * 
   * Flow:
   * 1. Show loading state (disable button)
   * 2. Call signOut service
   * 3. If error, show alert
   * 4. If success, RootNavigator automatically switches to Auth stack
   *    because it listens to Supabase auth state changes
   */
  const handleSignOut = async () => {
    setIsSigningOut(true);
    
    const result = await signOut();
    
    if (result.error) {
      setIsSigningOut(false);
      Alert.alert(
        'Sign Out Failed',
        result.error.message,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Success! RootNavigator will automatically navigate to Login
    // because onAuthStateChange fires with SIGNED_OUT event.
    // We don't reset isSigningOut here because the component will unmount.
  };

  /**
   * Handle article card press.
   */
  const handleArticlePress = (articleId: string) => {
    navigation.navigate('Article', { articleId });
  };

  /**
   * Render a single article card.
   */
  const renderArticle = ({ item }: { item: Article }) => (
    <ArticleCard
      title={item.title}
      summary={item.summary}
      tags={item.tags}
      onPress={() => handleArticlePress(item.id)}
    />
  );

  /**
   * Render loading state.
   */
  const renderLoading = () => (
    <View style={styles.centerContainer} testID="loading-indicator">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.loadingText}>Loading articles...</Text>
    </View>
  );

  /**
   * Render error state with retry button.
   */
  const renderError = () => (
    <View style={styles.centerContainer} testID="error-state">
      <Text style={styles.errorTitle}>Unable to load articles</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <Pressable style={styles.retryButton} onPress={() => loadArticles()}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </Pressable>
    </View>
  );

  /**
   * Render empty state when no articles exist.
   */
  const renderEmpty = () => (
    <View style={styles.centerContainer} testID="empty-state">
      <Text style={styles.emptyTitle}>No articles yet</Text>
      <Text style={styles.emptyMessage}>
        Pull down to refresh or check back later.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Feed</Text>
        <Pressable
          style={[
            styles.signOutButton,
            isSigningOut && styles.signOutButtonDisabled,
          ]}
          onPress={handleSignOut}
          disabled={isSigningOut}
          testID="sign-out-button"
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color="#94a3b8" testID="sign-out-loading" />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </Pressable>
      </View>

      {/* Content */}
      {isLoading ? (
        renderLoading()
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={renderArticle}
          contentContainerStyle={[
            styles.listContent,
            articles.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
              colors={['#3b82f6']}
            />
          }
          showsVerticalScrollIndicator={false}
          testID="articles-list"
        />
      )}
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
    paddingHorizontal: 20,
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
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonDisabled: {
    opacity: 0.6,
  },
  signOutText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listContentEmpty: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
