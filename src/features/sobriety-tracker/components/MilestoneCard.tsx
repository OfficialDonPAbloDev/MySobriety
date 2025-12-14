import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Milestone } from '../utils/timeCalculations';

interface MilestoneCardProps {
  milestones: Milestone[];
  nextMilestone: { name: string; daysRequired: number; icon: string } | null;
  daysUntilNext: number;
}

interface MilestoneItemProps {
  milestone: Milestone;
}

function MilestoneItem({ milestone }: MilestoneItemProps) {
  return (
    <View style={[styles.milestoneItem, milestone.achieved && styles.milestoneAchieved]}>
      <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
      <View style={styles.milestoneInfo}>
        <Text
          style={[styles.milestoneName, milestone.achieved && styles.milestoneNameAchieved]}
          numberOfLines={1}
        >
          {milestone.name}
        </Text>
        {milestone.achieved && milestone.achievedAt && (
          <Text style={styles.milestoneDate}>
            {milestone.achievedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        )}
      </View>
      {milestone.achieved && <Text style={styles.checkmark}>&#10003;</Text>}
    </View>
  );
}

export function MilestoneCard({ milestones, nextMilestone, daysUntilNext }: MilestoneCardProps) {
  const achievedMilestones = milestones.filter((m) => m.achieved);
  const recentMilestones = achievedMilestones.slice(-3).reverse();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Milestones</Text>

      {/* Next milestone progress */}
      {nextMilestone && (
        <View style={styles.nextMilestoneContainer}>
          <View style={styles.nextMilestoneHeader}>
            <Text style={styles.nextMilestoneIcon}>{nextMilestone.icon}</Text>
            <View style={styles.nextMilestoneInfo}>
              <Text style={styles.nextMilestoneLabel}>Next: {nextMilestone.name}</Text>
              <Text style={styles.nextMilestoneDays}>
                {daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'} to go
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.max(5, ((nextMilestone.daysRequired - daysUntilNext) / nextMilestone.daysRequired) * 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Recent achievements */}
      {recentMilestones.length > 0 && (
        <View style={styles.achievedSection}>
          <Text style={styles.achievedTitle}>Recent Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentMilestones.map((milestone) => (
              <MilestoneItem key={milestone.id} milestone={milestone} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {achievedMilestones.length} of {milestones.length} milestones achieved
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  nextMilestoneContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  nextMilestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextMilestoneIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  nextMilestoneInfo: {
    flex: 1,
  },
  nextMilestoneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextMilestoneDays: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  achievedSection: {
    marginBottom: 12,
  },
  achievedTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  milestoneAchieved: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  milestoneIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  milestoneNameAchieved: {
    color: '#374151',
  },
  milestoneDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },
  summaryContainer: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
