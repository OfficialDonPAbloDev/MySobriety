import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Goal, GoalStep, GOAL_CATEGORIES, GoalStatus } from '../services/goalsService';

interface GoalDetailProps {
  goal: Goal;
  onToggleStep: (stepId: string, isCompleted: boolean) => Promise<void>;
  onAddStep: (title: string) => Promise<void>;
  onDeleteStep: (stepId: string) => Promise<void>;
  onUpdateStatus: (status: GoalStatus) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

export function GoalDetail({
  goal,
  onToggleStep,
  onAddStep,
  onDeleteStep,
  onUpdateStatus,
  onDelete,
  onClose,
}: GoalDetailProps) {
  const [newStepTitle, setNewStepTitle] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);

  const category = GOAL_CATEGORIES.find((c) => c.value === goal.category);
  const completedSteps = goal.steps?.filter((s) => s.is_completed).length || 0;
  const totalSteps = goal.steps?.length || 0;

  const handleAddStep = async () => {
    if (!newStepTitle.trim()) return;
    setIsAddingStep(true);
    try {
      await onAddStep(newStepTitle.trim());
      setNewStepTitle('');
    } finally {
      setIsAddingStep(false);
    }
  };

  const handleDeleteGoal = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const handleStatusChange = (newStatus: GoalStatus) => {
    if (newStatus === 'completed') {
      Alert.alert(
        'Complete Goal',
        'Congratulations! Mark this goal as completed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete', onPress: () => onUpdateStatus(newStatus) },
        ]
      );
    } else {
      onUpdateStatus(newStatus);
    }
  };

  const getProgressColor = () => {
    if (goal.progress >= 75) return '#10B981';
    if (goal.progress >= 50) return '#22C55E';
    if (goal.progress >= 25) return '#EAB308';
    return '#4F46E5';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteGoal} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{category?.icon}</Text>
          <Text style={styles.categoryLabel}>{category?.label}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{goal.title}</Text>

        {/* Description */}
        {goal.description && (
          <Text style={styles.description}>{goal.description}</Text>
        )}

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={[styles.progressValue, { color: getProgressColor() }]}>
              {goal.progress}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${goal.progress}%`, backgroundColor: getProgressColor() },
              ]}
            />
          </View>
          {totalSteps > 0 && (
            <Text style={styles.stepsProgress}>
              {completedSteps} of {totalSteps} steps completed
            </Text>
          )}
        </View>

        {/* Status Actions */}
        {goal.status === 'active' && (
          <View style={styles.statusActions}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleStatusChange('completed')}
            >
              <Text style={styles.completeButtonText}>✓ Mark Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={() => handleStatusChange('paused')}
            >
              <Text style={styles.pauseButtonText}>Pause</Text>
            </TouchableOpacity>
          </View>
        )}

        {goal.status === 'paused' && (
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() => handleStatusChange('active')}
          >
            <Text style={styles.resumeButtonText}>Resume Goal</Text>
          </TouchableOpacity>
        )}

        {goal.status === 'completed' && (
          <View style={styles.completedBanner}>
            <Text style={styles.completedEmoji}>🎉</Text>
            <Text style={styles.completedText}>Goal Completed!</Text>
            {goal.completed_at && (
              <Text style={styles.completedDate}>
                Completed on {new Date(goal.completed_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        )}

        {/* Steps Section */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>Steps</Text>

          {goal.steps && goal.steps.length > 0 ? (
            goal.steps.map((step) => (
              <StepItem
                key={step.id}
                step={step}
                onToggle={() => onToggleStep(step.id, !step.is_completed)}
                onDelete={() => onDeleteStep(step.id)}
                disabled={goal.status === 'completed'}
              />
            ))
          ) : (
            <Text style={styles.noStepsText}>No steps added yet</Text>
          )}

          {/* Add Step Input */}
          {goal.status === 'active' && (
            <View style={styles.addStepContainer}>
              <TextInput
                style={styles.addStepInput}
                value={newStepTitle}
                onChangeText={setNewStepTitle}
                placeholder="Add a new step..."
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={handleAddStep}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[
                  styles.addStepButton,
                  (!newStepTitle.trim() || isAddingStep) && styles.addStepButtonDisabled,
                ]}
                onPress={handleAddStep}
                disabled={!newStepTitle.trim() || isAddingStep}
              >
                <Text style={styles.addStepButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Meta Info */}
        <View style={styles.metaSection}>
          <Text style={styles.metaText}>
            Created {new Date(goal.created_at).toLocaleDateString()}
          </Text>
          {goal.target_date && (
            <Text style={styles.metaText}>
              Target: {new Date(goal.target_date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

interface StepItemProps {
  step: GoalStep;
  onToggle: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

function StepItem({ step, onToggle, onDelete, disabled }: StepItemProps) {
  return (
    <View style={styles.stepItem}>
      <TouchableOpacity
        style={[
          styles.stepCheckbox,
          step.is_completed && styles.stepCheckboxCompleted,
        ]}
        onPress={onToggle}
        disabled={disabled}
      >
        {step.is_completed && <Text style={styles.stepCheckmark}>✓</Text>}
      </TouchableOpacity>
      <Text
        style={[styles.stepTitle, step.is_completed && styles.stepTitleCompleted]}
      >
        {step.title}
      </Text>
      {!disabled && (
        <TouchableOpacity style={styles.stepDeleteButton} onPress={onDelete}>
          <Text style={styles.stepDeleteText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
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
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  stepsProgress: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  statusActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  completeButton: {
    flex: 2,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  pauseButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pauseButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  resumeButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  completedBanner: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  completedEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  completedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  completedDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  stepsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  noStepsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stepCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCheckboxCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepCheckmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepTitle: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  stepTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  stepDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDeleteText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addStepContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  addStepInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addStepButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStepButtonDisabled: {
    backgroundColor: '#C7D2FE',
  },
  addStepButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 26,
  },
  metaSection: {
    paddingVertical: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
});
