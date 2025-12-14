import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useGoals,
  useGoalDetail,
  GoalCard,
  GoalEditor,
  GoalDetail,
} from '../../src/features/goals';

type ViewMode = 'list' | 'editor' | 'detail';

export default function GoalsScreen() {
  const {
    goals,
    activeGoals,
    completedGoals,
    isLoading,
    stats,
    createGoal,
    deleteGoal,
    completeGoal,
    updateGoal,
  } = useGoals();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const {
    goal: selectedGoal,
    addStep,
    toggleStep,
    deleteStep,
    refreshGoal,
  } = useGoalDetail(selectedGoalId);

  const handleCreateGoal = async (input: Parameters<typeof createGoal>[0]) => {
    setIsSubmitting(true);
    try {
      await createGoal(input);
      setViewMode('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalPress = (goalId: string) => {
    setSelectedGoalId(goalId);
    setViewMode('detail');
  };

  const handleCompleteGoal = (goalId: string) => {
    Alert.alert('Complete Goal', 'Mark this goal as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          await completeGoal(goalId);
        },
      },
    ]);
  };

  const handleDeleteGoal = async () => {
    if (!selectedGoalId) return;
    await deleteGoal(selectedGoalId);
    setViewMode('list');
    setSelectedGoalId(null);
  };

  const handleUpdateStatus = async (status: 'active' | 'completed' | 'paused' | 'cancelled') => {
    if (!selectedGoalId) return;
    await updateGoal(selectedGoalId, { status });
    await refreshGoal();
  };

  const filteredGoals =
    filter === 'all' ? goals : filter === 'active' ? activeGoals : completedGoals;

  if (viewMode === 'editor') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GoalEditor
          onSave={handleCreateGoal}
          onCancel={() => setViewMode('list')}
          isSubmitting={isSubmitting}
        />
      </SafeAreaView>
    );
  }

  if (viewMode === 'detail' && selectedGoal) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GoalDetail
          goal={selectedGoal}
          onToggleStep={(stepId, isCompleted) => toggleStep(stepId, isCompleted)}
          onAddStep={(title) => addStep(title)}
          onDeleteStep={(stepId) => deleteStep(stepId)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteGoal}
          onClose={() => {
            setViewMode('list');
            setSelectedGoalId(null);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Goals</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setViewMode('editor')}>
          <Text style={styles.addButtonText}>+ New Goal</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.activeGoals}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.completedGoals}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.completionRate}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['active', 'all', 'completed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && goals.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : filteredGoals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyTitle}>No {filter !== 'all' ? filter : ''} goals yet</Text>
          <Text style={styles.emptyText}>
            Set meaningful goals to guide your recovery journey and celebrate your progress.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setViewMode('editor')}>
            <Text style={styles.emptyButtonText}>Create Your First Goal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredGoals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <GoalCard
              goal={item}
              onPress={() => handleGoalPress(item.id)}
              onComplete={item.status === 'active' ? () => handleCompleteGoal(item.id) : undefined}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#4F46E5',
  },
  filterTabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
});
