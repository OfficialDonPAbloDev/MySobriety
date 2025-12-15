import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CommunityPost, POST_CATEGORIES } from '../services/communityService';

interface PostCardProps {
  post: CommunityPost;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
}

export function PostCard({ post, onPress, onLike, onComment }: PostCardProps) {
  const category = POST_CATEGORIES.find((c) => c.value === post.category);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.is_anonymous ? '?' : post.author_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.author_name}</Text>
            {post.author_days_sober !== undefined && (
              <Text style={styles.daysSober}>{post.author_days_sober} days sober</Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.date}>{formatDate(post.created_at)}</Text>
        </View>
      </View>

      {/* Category Badge */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryIcon}>{category?.icon}</Text>
        <Text style={styles.categoryLabel}>{category?.label}</Text>
      </View>

      {/* Content */}
      <Text style={styles.content} numberOfLines={3}>
        {post.content}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.actionButton, post.user_has_liked && styles.actionButtonActive]}
          onPress={onLike}
        >
          <Text style={styles.actionIcon}>{post.user_has_liked ? '❤️' : '🤍'}</Text>
          <Text
            style={[styles.actionText, post.user_has_liked && styles.actionTextActive]}
          >
            {post.encouragement_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{post.comment_count}</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.encourageButton}>
          <Text style={styles.encourageText}>Encourage</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  daysSober: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  content: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  actionButtonActive: {
    backgroundColor: '#FEE2E2',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  actionText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#EF4444',
  },
  spacer: {
    flex: 1,
  },
  encourageButton: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  encourageText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
});
