/**
 * ArticleScreen
 * 
 * Shows the details of a single article.
 * Receives articleId as a route parameter.
 */

import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { AppStackParamList } from '../navigation/AppNavigator';

type ArticleScreenProps = {
  navigation: NativeStackNavigationProp<AppStackParamList, 'Article'>;
  route: RouteProp<AppStackParamList, 'Article'>;
};

export function ArticleScreen({ navigation, route }: ArticleScreenProps) {
  const { articleId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Article {articleId}</Text>
        <Text style={styles.body}>
          This is a placeholder for article content. The articleId parameter 
          ({articleId}) would be used to fetch the actual article data from 
          Supabase.
        </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#cbd5e1',
  },
});
