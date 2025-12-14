import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Goal, GOAL_CATEGORIES } from '../services/goalsService';

interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
  onComplete?: () => void;
}

export function GoalCard({ goal, onPress, onComplete }: GoalCardProps) {
  const category = GOAL_CATEGORIES.find((c) => c.value === goal.category);
  const isCompleted = goal.status === 'completed';
  const isPaused = goal.status === 'paused';

  const getStatusColor = () => {
    switch (goal.status) {
      case 'completed':
        return '#10B981';
      case 'paused':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#4F46E5';
    }
  };

  const getProgressColor = () => {
    if (goal.progress >= 75) return '#10B981';
    if (goal.progress >= 50) return '#22C55E';
    if (goal.progress >= 25) return '#EAB308';
    return '#4F46E5';
  };

  const formatTargetDate = () => {
    if (!goal.target_date) return null;
    const date = new Date(goal.target_date);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const targetDateText = formatTargetDate();
  const isOverdue = targetDateText === 'Overdue' && !isCompleted;

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.containerCompleted]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{category?.icon}</Text>
          <Text style={styles.categoryLabel}>{category?.label}</Text>
        </View>
        {!isCompleted && onComplete && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={onComplete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.completeButtonText}>✓</Text>
          </TouchableOpacity>
        )}
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        )}
      </View>

      <Text style={[styles.title, isCompleted && styles.titleCompleted]} numberOfLines={2}>
        {goal.title}
      </Text>

      {goal.description && (
        <Text style={styles.description} numberOfLines={2}>
          {goal.description}
        </Text>
      )}

      {/* Progress Bar */}
      {!isCompleted && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${goal.progress}%`, backgroundColor: getProgressColor() },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{goal.progress}%</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        {targetDateText && (
          <View style={[styles.dateBadge, isOverdue && styles.dateBadgeOverdue]}>
            <Text style={[styles.dateText, isOverdue && styles.dateTextOverdue]}>
              {targetDateText}
            </Text>
          </View>
        )}
        {isPaused && (
          <View style={styles.pausedBadge}>
            <Text style={styles.pausedText}>Paused</Text>
          </View>
        )}
        {goal.steps && goal.steps.length > 0 && (
          <Text style={styles.stepsText}>
            {goal.steps.filter((s) => s.is_completed).length}/{goal.steps.length} steps
          </Text>
        )}
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
  containerCompleted: {
    backgroundColor: '#F9FAFB',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 36,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateBadgeOverdue: {
    backgroundColor: '#FEE2E2',
  },
  dateText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  dateTextOverdue: {
    color: '#EF4444',
  },
  pausedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pausedText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  stepsText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 'auto',
  },
});
