import { View, Text, StyleSheet } from 'react-native';
import { TRIGGER_CATEGORIES, TriggerCategory } from '../services/triggersService';

interface TriggerStatsProps {
  stats: {
    totalLogs: number;
    mostCommonTrigger: string | null;
    mostCommonCategory: TriggerCategory | null;
    resistanceRate: number;
    averageIntensity: number;
    triggersByCategory: Record<TriggerCategory, number>;
  };
}

export function TriggerStats({ stats }: TriggerStatsProps) {
  const mostCommonCat = stats.mostCommonCategory
    ? TRIGGER_CATEGORIES.find((c) => c.value === stats.mostCommonCategory)
    : null;

  const getResistanceColor = () => {
    if (stats.resistanceRate >= 75) return '#10B981';
    if (stats.resistanceRate >= 50) return '#22C55E';
    if (stats.resistanceRate >= 25) return '#EAB308';
    return '#EF4444';
  };

  const getIntensityColor = () => {
    if (stats.averageIntensity <= 2) return '#10B981';
    if (stats.averageIntensity <= 3) return '#EAB308';
    return '#EF4444';
  };

  if (stats.totalLogs === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No trigger logs yet</Text>
        <Text style={styles.emptyText}>
          Start logging triggers to see your patterns and insights here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Stats Row */}
      <View style={styles.mainStatsRow}>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatNumber}>{stats.totalLogs}</Text>
          <Text style={styles.mainStatLabel}>Triggers Logged</Text>
        </View>
        <View style={styles.mainStatDivider} />
        <View style={styles.mainStat}>
          <Text style={[styles.mainStatNumber, { color: getResistanceColor() }]}>
            {stats.resistanceRate}%
          </Text>
          <Text style={styles.mainStatLabel}>Resistance Rate</Text>
        </View>
        <View style={styles.mainStatDivider} />
        <View style={styles.mainStat}>
          <Text style={[styles.mainStatNumber, { color: getIntensityColor() }]}>
            {stats.averageIntensity.toFixed(1)}
          </Text>
          <Text style={styles.mainStatLabel}>Avg Intensity</Text>
        </View>
      </View>

      {/* Most Common Trigger */}
      {stats.mostCommonTrigger && (
        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>Most Common Trigger</Text>
          <Text style={styles.insightValue}>{stats.mostCommonTrigger}</Text>
          {mostCommonCat && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryIcon}>{mostCommonCat.icon}</Text>
              <Text style={styles.categoryLabel}>{mostCommonCat.label}</Text>
            </View>
          )}
        </View>
      )}

      {/* Category Breakdown */}
      <View style={styles.categoryBreakdown}>
        <Text style={styles.breakdownTitle}>Triggers by Category</Text>
        {TRIGGER_CATEGORIES.filter((cat) => stats.triggersByCategory[cat.value] > 0).map((cat) => {
          const count = stats.triggersByCategory[cat.value];
          const percentage = Math.round((count / stats.totalLogs) * 100);
          return (
            <View key={cat.value} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryRowIcon}>{cat.icon}</Text>
                <Text style={styles.categoryRowLabel}>{cat.label}</Text>
                <Text style={styles.categoryCount}>{count}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${percentage}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  mainStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mainStat: {
    flex: 1,
    alignItems: 'center',
  },
  mainStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  mainStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  insightCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  insightLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  categoryBreakdown: {
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  categoryRow: {
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryRowIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryRowLabel: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 3,
  },
});
