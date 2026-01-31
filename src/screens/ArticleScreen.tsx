/**
 * ArticleScreen
 * 
 * Shows the full details of a single article.
 * Receives articleId as a route parameter.
 * 
 * Features:
 * - Fetches article data on mount
 * - Displays title, full summary, and tags
 * - "Read Full Article" button opens external URL
 * - Loading, error, and not found states
 */

import { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { fetchArticleById } from '../services';
import type { Article } from '../types';

type ArticleScreenProps = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Article'>;
  route: RouteProp<AppStackParamList, 'Article'>;
};

export function ArticleScreen({ navigation, route }: ArticleScreenProps) {
  const { articleId } = route.params;

  // Data state
  const [article, setArticle] = useState<Article | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load article data from the service.
   */
  const loadArticle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchArticleById(articleId);

      if (result.error) {
        setError(result.error.message);
        setArticle(null);
      } else {
        setArticle(result.data);
      }
    } catch (err) {
      // Handle unexpected errors (network failure, etc.)
      setError('Unable to connect. Please check your internet connection.');
      setArticle(null);
    } finally {
      setIsLoading(false);
    }
  }, [articleId]);

  // Fetch article on mount
  useEffect(() => {
    loadArticle();
  }, [loadArticle]);

  /**
   * Open the external article URL in the device's browser.
   */
  const handleReadFullArticle = async () => {
    if (!article?.externalUrl) return;

    try {
      const canOpen = await Linking.canOpenURL(article.externalUrl);
      
      if (canOpen) {
        await Linking.openURL(article.externalUrl);
      } else {
        Alert.alert(
          'Unable to Open',
          'Cannot open this link. The URL may be invalid.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      Alert.alert(
        'Error',
        'Failed to open the article link.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Format the created date for display.
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * Render loading state.
   */
  const renderLoading = () => (
    <View style={styles.centerContainer} testID="loading-indicator">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );

  /**
   * Render error state with retry button.
   */
  const renderError = () => (
    <View style={styles.centerContainer} testID="error-state">
      <Text style={styles.errorTitle}>Unable to load article</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <Pressable style={styles.retryButton} onPress={loadArticle}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </Pressable>
    </View>
  );

  /**
   * Render article content.
   */
  const renderArticle = () => {
    if (!article) return null;

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID="article-content"
      >
        {/* Title */}
        <Text style={styles.title} testID="article-title">
          {article.title}
        </Text>

        {/* Date */}
        <Text style={styles.date} testID="article-date">
          {formatDate(article.createdAt)}
        </Text>

        {/* Tags */}
        {article.tags.length > 0 && (
          <View style={styles.tagsContainer} testID="article-tags">
            {article.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        <Text style={styles.summary} testID="article-summary">
          {article.summary}
        </Text>

        {/* Read Full Article Button */}
        <Pressable
          style={styles.readButton}
          onPress={handleReadFullArticle}
          testID="read-full-article-button"
        >
          <Text style={styles.readButtonText}>Read Full Article</Text>
          <Text style={styles.readButtonIcon}>→</Text>
        </Pressable>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          testID="back-button"
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>

      {/* Content */}
      {isLoading ? renderLoading() : error ? renderError() : renderArticle()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    lineHeight: 36,
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  summary: {
    fontSize: 17,
    lineHeight: 28,
    color: '#e2e8f0',
    marginBottom: 32,
  },
  readButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  readButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  readButtonIcon: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
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
});
