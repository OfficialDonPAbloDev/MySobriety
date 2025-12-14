import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MoodSelector } from './MoodSelector';
import { CravingSliderFallback } from './CravingSlider';
import {
  CreateCheckInInput,
  MoodRating,
  COMMON_TRIGGERS,
  COPING_STRATEGIES,
} from '../services/checkInService';

interface CheckInFormProps {
  onSubmit: (input: CreateCheckInInput) => Promise<void>;
  isSubmitting?: boolean;
  initialValues?: Partial<CreateCheckInInput>;
}

interface TagSelectorProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function TagSelector({ label, options, selected, onChange }: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <View style={styles.tagContainer}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.tagGrid}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.tag, selected.includes(option) && styles.tagSelected]}
            onPress={() => toggleTag(option)}
          >
            <Text
              style={[styles.tagText, selected.includes(option) && styles.tagTextSelected]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function CheckInForm({ onSubmit, isSubmitting, initialValues }: CheckInFormProps) {
  const [mood, setMood] = useState<MoodRating | null>(
    initialValues?.mood_rating || null
  );
  const [cravingLevel, setCravingLevel] = useState(initialValues?.craving_level || 0);
  const [notes, setNotes] = useState(initialValues?.notes || '');
  const [triggers, setTriggers] = useState<string[]>(initialValues?.triggers || []);
  const [copingStrategies, setCopingStrategies] = useState<string[]>(
    initialValues?.coping_strategies_used || []
  );
  const [isSober, setIsSober] = useState(initialValues?.is_sober ?? true);

  const handleSubmit = async () => {
    if (!mood) {
      Alert.alert('Required', 'Please select your mood');
      return;
    }

    try {
      await onSubmit({
        mood_rating: mood,
        craving_level: cravingLevel,
        notes: notes.trim() || undefined,
        triggers: triggers.length > 0 ? triggers : undefined,
        coping_strategies_used: copingStrategies.length > 0 ? copingStrategies : undefined,
        is_sober: isSober,
      });
    } catch {
      Alert.alert('Error', 'Failed to submit check-in. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Mood Selection */}
      <MoodSelector value={mood} onChange={setMood} />

      {/* Craving Level */}
      <CravingSliderFallback value={cravingLevel} onChange={setCravingLevel} />

      {/* Sobriety Confirmation */}
      <View style={styles.sobrietyContainer}>
        <Text style={styles.sectionLabel}>Are you staying sober today?</Text>
        <View style={styles.sobrietyButtons}>
          <TouchableOpacity
            style={[styles.sobrietyButton, isSober && styles.sobrietyButtonYes]}
            onPress={() => setIsSober(true)}
          >
            <Text style={[styles.sobrietyButtonText, isSober && styles.sobrietyButtonTextSelected]}>
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sobrietyButton, !isSober && styles.sobrietyButtonNo]}
            onPress={() => setIsSober(false)}
          >
            <Text style={[styles.sobrietyButtonText, !isSober && styles.sobrietyButtonTextSelected]}>
              No
            </Text>
          </TouchableOpacity>
        </View>
        {!isSober && (
          <Text style={styles.slipMessage}>
            It's okay. Recovery isn't perfect. What matters is that you're here and trying.
          </Text>
        )}
      </View>

      {/* Triggers */}
      {cravingLevel > 0 && (
        <TagSelector
          label="What triggered you? (optional)"
          options={COMMON_TRIGGERS}
          selected={triggers}
          onChange={setTriggers}
        />
      )}

      {/* Coping Strategies */}
      <TagSelector
        label="What helped today? (optional)"
        options={COPING_STRATEGIES}
        selected={copingStrategies}
        onChange={setCopingStrategies}
      />

      {/* Notes */}
      <View style={styles.notesContainer}>
        <Text style={styles.sectionLabel}>Additional notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="How was your day? Any thoughts to share..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitButtonText}>Complete Check-In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  sobrietyContainer: {
    marginBottom: 24,
  },
  sobrietyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sobrietyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  sobrietyButtonYes: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  sobrietyButtonNo: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  sobrietyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  sobrietyButtonTextSelected: {
    color: '#1F2937',
  },
  slipMessage: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  tagContainer: {
    marginBottom: 24,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  tagText: {
    fontSize: 13,
    color: '#6B7280',
  },
  tagTextSelected: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomSpacing: {
    height: 40,
  },
});
