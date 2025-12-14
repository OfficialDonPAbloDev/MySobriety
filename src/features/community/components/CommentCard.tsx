import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CommunityComment } from '../services/communityService';

interface CommentCardProps {
  comment: CommunityComment;
  isOwner?: boolean;
  onDelete?: () => void;
}

export function CommentCard({ comment, isOwner, onDelete }: CommentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {comment.is_anonymous
              ? '?'
              : comment.author_name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName}>{comment.author_name}</Text>
            {comment.author_days_sober !== undefined && (
              <Text style={styles.daysSober}>• {comment.author_days_sober}d</Text>
            )}
          </View>
          <Text style={styles.date}>{formatDate(comment.created_at)}</Text>
        </View>
        {isOwner && onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.content}>{comment.content}</Text>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>🤍</Text>
          <Text style={styles.actionText}>{comment.likes_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.encourageButton}>
          <Text style={styles.encourageText}>💪 Encourage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  daysSober: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 6,
  },
  date: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  encourageButton: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  encourageText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
});
