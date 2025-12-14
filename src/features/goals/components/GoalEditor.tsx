import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  GoalCategory,
  CreateGoalInput,
  GOAL_CATEGORIES,
  SUGGESTED_GOALS,
} from '../services/goalsService';

interface GoalEditorProps {
  onSave: (input: CreateGoalInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function GoalEditor({ onSave, onCancel, isSubmitting }: GoalEditorProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('recovery');
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [steps, setSteps] = useState<string[]>([]);
  const [newStep, setNewStep] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleAddStep = () => {
    if (newStep.trim()) {
      setSteps([...steps, newStep.trim()]);
      setNewStep('');
    }
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSelectSuggestion = (suggestion: (typeof SUGGESTED_GOALS)[0]) => {
    setTitle(suggestion.title);
    setDescription(suggestion.description);
    setCategory(suggestion.category);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      target_date: targetDate,
      steps: steps.length > 0 ? steps : undefined,
    });
  };

  const isValid = title.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Suggested Goals */}
        {showSuggestions && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>Suggested Goals</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SUGGESTED_GOALS.map((suggestion, index) => {
                const cat = GOAL_CATEGORIES.find((c) => c.value === suggestion.category);
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionCard}
                    onPress={() => handleSelectSuggestion(suggestion)}
                  >
                    <Text style={styles.suggestionIcon}>{cat?.icon}</Text>
                    <Text style={styles.suggestionTitle} numberOfLines={2}>
                      {suggestion.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Goal Title *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="What do you want to achieve?"
            placeholderTextColor="#9CA3AF"
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Why is this goal important to you?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {GOAL_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryOption,
                  category === cat.value && styles.categoryOptionSelected,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.value && styles.categoryLabelSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Steps Section */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Steps (Optional)</Text>
          <Text style={styles.hint}>Break your goal into smaller, actionable steps</Text>

          {steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
              <TouchableOpacity
                style={styles.removeStepButton}
                onPress={() => handleRemoveStep(index)}
              >
                <Text style={styles.removeStepText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.addStepRow}>
            <TextInput
              style={styles.stepInput}
              value={newStep}
              onChangeText={setNewStep}
              placeholder="Add a step..."
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={handleAddStep}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addStepButton, !newStep.trim() && styles.addStepButtonDisabled]}
              onPress={handleAddStep}
              disabled={!newStep.trim()}
            >
              <Text style={styles.addStepButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isSubmitting}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, (!isValid || isSubmitting) && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!isValid || isSubmitting}
        >
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Creating...' : 'Create Goal'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  suggestionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryLabelSelected: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  removeStepButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeStepText: {
    color: '#EF4444',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addStepRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addStepButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addStepButtonDisabled: {
    backgroundColor: '#C7D2FE',
  },
  addStepButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#C7D2FE',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
