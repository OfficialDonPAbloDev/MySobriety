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
  TriggerCategory,
  TriggerIntensity,
  CreateTriggerLogInput,
  CopingStrategy,
  TRIGGER_CATEGORIES,
  COMMON_TRIGGERS,
  INTENSITY_LABELS,
} from '../services/triggersService';

interface TriggerLogEditorProps {
  copingStrategies: CopingStrategy[];
  onSave: (input: CreateTriggerLogInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function TriggerLogEditor({
  copingStrategies,
  onSave,
  onCancel,
  isSubmitting,
}: TriggerLogEditorProps) {
  const [triggerName, setTriggerName] = useState('');
  const [category, setCategory] = useState<TriggerCategory>('emotional');
  const [intensity, setIntensity] = useState<TriggerIntensity>(3);
  const [situation, setSituation] = useState('');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<'resisted' | 'partially_resisted' | 'gave_in' | null>(null);
  const [notes, setNotes] = useState('');

  const handleSelectCommonTrigger = (trigger: { name: string; category: TriggerCategory }) => {
    setTriggerName(trigger.name);
    setCategory(trigger.category);
  };

  const handleToggleStrategy = (strategyName: string) => {
    setSelectedStrategies((prev) =>
      prev.includes(strategyName)
        ? prev.filter((s) => s !== strategyName)
        : [...prev, strategyName]
    );
  };

  const handleSave = async () => {
    if (!triggerName.trim()) return;

    await onSave({
      trigger_name: triggerName.trim(),
      category,
      intensity,
      situation: situation.trim() || undefined,
      coping_strategies_used: selectedStrategies.length > 0 ? selectedStrategies : undefined,
      outcome: outcome || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const isValid = triggerName.trim().length > 0;

  // Group coping strategies by category
  const strategiesByCategory = copingStrategies.reduce(
    (acc, strategy) => {
      if (!acc[strategy.category]) acc[strategy.category] = [];
      acc[strategy.category].push(strategy);
      return acc;
    },
    {} as Record<string, CopingStrategy[]>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Common Triggers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Triggers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {COMMON_TRIGGERS.map((trigger, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.commonTriggerChip,
                  triggerName === trigger.name && styles.commonTriggerChipSelected,
                ]}
                onPress={() => handleSelectCommonTrigger(trigger)}
              >
                <Text
                  style={[
                    styles.commonTriggerText,
                    triggerName === trigger.name && styles.commonTriggerTextSelected,
                  ]}
                >
                  {trigger.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trigger Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Trigger *</Text>
          <TextInput
            style={styles.textInput}
            value={triggerName}
            onChangeText={setTriggerName}
            placeholder="What triggered you?"
            placeholderTextColor="#9CA3AF"
            maxLength={100}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {TRIGGER_CATEGORIES.map((cat) => (
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

        {/* Intensity */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Intensity Level</Text>
          <View style={styles.intensityRow}>
            {INTENSITY_LABELS.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.intensityButton,
                  intensity === level.value && { backgroundColor: level.color },
                ]}
                onPress={() => setIntensity(level.value)}
              >
                <Text
                  style={[
                    styles.intensityButtonText,
                    intensity === level.value && styles.intensityButtonTextSelected,
                  ]}
                >
                  {level.value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.intensityLabel}>
            {INTENSITY_LABELS.find((i) => i.value === intensity)?.label}
          </Text>
        </View>

        {/* Situation */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Situation (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={situation}
            onChangeText={setSituation}
            placeholder="What was happening when this trigger occurred?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={2}
            maxLength={500}
          />
        </View>

        {/* Coping Strategies */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Coping Strategies Used</Text>
          {Object.entries(strategiesByCategory).map(([cat, strategies]) => (
            <View key={cat} style={styles.strategyCategory}>
              <Text style={styles.strategyCategoryTitle}>{cat}</Text>
              <View style={styles.strategiesGrid}>
                {strategies.map((strategy) => (
                  <TouchableOpacity
                    key={strategy.id}
                    style={[
                      styles.strategyChip,
                      selectedStrategies.includes(strategy.name) && styles.strategyChipSelected,
                    ]}
                    onPress={() => handleToggleStrategy(strategy.name)}
                  >
                    <Text
                      style={[
                        styles.strategyChipText,
                        selectedStrategies.includes(strategy.name) && styles.strategyChipTextSelected,
                      ]}
                    >
                      {strategy.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Outcome */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Outcome</Text>
          <View style={styles.outcomeRow}>
            <TouchableOpacity
              style={[styles.outcomeButton, outcome === 'resisted' && styles.outcomeResisted]}
              onPress={() => setOutcome(outcome === 'resisted' ? null : 'resisted')}
            >
              <Text
                style={[
                  styles.outcomeText,
                  outcome === 'resisted' && styles.outcomeTextSelected,
                ]}
              >
                Resisted
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.outcomeButton,
                outcome === 'partially_resisted' && styles.outcomePartial,
              ]}
              onPress={() => setOutcome(outcome === 'partially_resisted' ? null : 'partially_resisted')}
            >
              <Text
                style={[
                  styles.outcomeText,
                  outcome === 'partially_resisted' && styles.outcomeTextSelected,
                ]}
              >
                Partially
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.outcomeButton, outcome === 'gave_in' && styles.outcomeGaveIn]}
              onPress={() => setOutcome(outcome === 'gave_in' ? null : 'gave_in')}
            >
              <Text
                style={[
                  styles.outcomeText,
                  outcome === 'gave_in' && styles.outcomeTextSelected,
                ]}
              >
                Gave In
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional thoughts or reflections..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            maxLength={1000}
          />
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
          <Text style={styles.saveButtonText}>{isSubmitting ? 'Saving...' : 'Log Trigger'}</Text>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  commonTriggerChip: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  commonTriggerChipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  commonTriggerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  commonTriggerTextSelected: {
    color: '#4F46E5',
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
    minHeight: 60,
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
    fontSize: 13,
    color: '#6B7280',
  },
  categoryLabelSelected: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  intensityButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  intensityButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  intensityButtonTextSelected: {
    color: '#ffffff',
  },
  intensityLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  strategyCategory: {
    marginBottom: 12,
  },
  strategyCategoryTitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  strategiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  strategyChip: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  strategyChipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  strategyChipText: {
    fontSize: 13,
    color: '#6B7280',
  },
  strategyChipTextSelected: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  outcomeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  outcomeResisted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  outcomePartial: {
    backgroundColor: '#FEF3C7',
    borderColor: '#EAB308',
  },
  outcomeGaveIn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  outcomeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  outcomeTextSelected: {
    color: '#1F2937',
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
