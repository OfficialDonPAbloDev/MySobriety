import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TriggerLog, TRIGGER_CATEGORIES, INTENSITY_LABELS } from '../services/triggersService';

interface TriggerLogCardProps {
  log: TriggerLog;
  onPress?: () => void;
  onDelete?: () => void;
}

export function TriggerLogCard({ log, onPress, onDelete }: TriggerLogCardProps) {
  const category = TRIGGER_CATEGORIES.find((c) => c.value === log.category);
  const intensity = INTENSITY_LABELS.find((i) => i.value === log.intensity);

  const getOutcomeColor = () => {
    switch (log.outcome) {
      case 'resisted':
        return '#10B981';
      case 'partially_resisted':
        return '#EAB308';
      case 'gave_in':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  const getOutcomeLabel = () => {
    switch (log.outcome) {
      case 'resisted':
        return 'Resisted';
      case 'partially_resisted':
        return 'Partially Resisted';
      case 'gave_in':
        return 'Gave In';
      default:
        return 'No outcome recorded';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{category?.icon}</Text>
          <Text style={styles.categoryLabel}>{category?.label}</Text>
        </View>
        <Text style={styles.date}>{formatDate(log.occurred_at)}</Text>
      </View>

      <Text style={styles.triggerName}>{log.trigger_name}</Text>

      {log.situation && (
        <Text style={styles.situation} numberOfLines={2}>
          {log.situation}
        </Text>
      )}

      <View style={styles.footer}>
        {/* Intensity */}
        <View style={styles.intensityContainer}>
          <Text style={styles.footerLabel}>Intensity:</Text>
          <View style={[styles.intensityBadge, { backgroundColor: intensity?.color + '20' }]}>
            <View style={[styles.intensityDot, { backgroundColor: intensity?.color }]} />
            <Text style={[styles.intensityText, { color: intensity?.color }]}>
              {intensity?.label}
            </Text>
          </View>
        </View>

        {/* Outcome */}
        <View style={[styles.outcomeBadge, { backgroundColor: getOutcomeColor() + '20' }]}>
          <Text style={[styles.outcomeText, { color: getOutcomeColor() }]}>
            {getOutcomeLabel()}
          </Text>
        </View>
      </View>

      {/* Coping Strategies Used */}
      {log.coping_strategies_used && log.coping_strategies_used.length > 0 && (
        <View style={styles.strategiesContainer}>
          <Text style={styles.strategiesLabel}>Coping strategies used:</Text>
          <View style={styles.strategiesList}>
            {log.coping_strategies_used.map((strategy, index) => (
              <View key={index} style={styles.strategyChip}>
                <Text style={styles.strategyText}>{strategy}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
      )}
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
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  triggerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  situation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 6,
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  outcomeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  outcomeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  strategiesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  strategiesLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  strategiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  strategyChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  strategyText: {
    fontSize: 12,
    color: '#4F46E5',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
