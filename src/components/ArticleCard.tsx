/**
 * ArticleCard Component
 * 
 * A pressable card that displays article preview information.
 * Used in lists/feeds to show article summaries.
 * 
 * Design Principles:
 * - Neutral color palette for readability
 * - Clear visual hierarchy (title > summary > tags)
 * - Comfortable touch target (entire card is pressable)
 * - Subtle press feedback
 */

import { StyleSheet, Text, View, Pressable } from 'react-native';

export interface ArticleCardProps {
  /** Article headline */
  title: string;
  /** Brief description or excerpt */
  summary: string;
  /** Category tags for the article */
  tags: string[];
  /** Called when the card is pressed */
  onPress: () => void;
}

export function ArticleCard({ title, summary, tags, onPress }: ArticleCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.containerPressed,
      ]}
      onPress={onPress}
      testID="article-card"
      accessibilityRole="button"
      accessibilityLabel={`Article: ${title}`}
    >
      {/* Title */}
      <Text style={styles.title} numberOfLines={2} testID="article-title">
        {title}
      </Text>

      {/* Summary */}
      <Text style={styles.summary} numberOfLines={3} testID="article-summary">
        {summary}
      </Text>

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.tagsContainer} testID="article-tags">
          {tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{tags.length - 3}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    // Subtle border for definition
    borderWidth: 1,
    borderColor: '#334155',
  },
  containerPressed: {
    backgroundColor: '#334155',
    // Slight scale effect would require Animated, keeping it simple
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f1f5f9',
    lineHeight: 24,
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#64748b',
  },
});
