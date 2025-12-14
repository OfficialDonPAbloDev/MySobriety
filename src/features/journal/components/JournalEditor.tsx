import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { JOURNAL_TAGS, journalService } from '../services/journalService';
import { MoodSelector } from '../../check-in/components/MoodSelector';
import { MoodRating } from '../../check-in/services/checkInService';

interface JournalEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialMood?: number;
  initialTags?: string[];
  onSave: (data: {
    title: string;
    content: string;
    mood_rating?: number;
    tags: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export function JournalEditor({
  initialTitle = '',
  initialContent = '',
  initialMood,
  initialTags = [],
  onSave,
  onCancel,
  isEditing = false,
}: JournalEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [mood, setMood] = useState<MoodRating | null>(
    initialMood as MoodRating | null
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [isSaving, setIsSaving] = useState(false);
  const [showPrompt, setShowPrompt] = useState(!initialContent);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Required', 'Please write something in your journal entry.');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        title: title.trim(),
        content: content.trim(),
        mood_rating: mood || undefined,
        tags: selectedTags,
      });
    } catch {
      Alert.alert('Error', 'Failed to save journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const usePrompt = () => {
    const prompt = journalService.getRandomPrompt();
    setContent(prompt + '\n\n');
    setShowPrompt(false);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Prompt suggestion */}
      {showPrompt && !content && (
        <TouchableOpacity style={styles.promptCard} onPress={usePrompt}>
          <Text style={styles.promptLabel}>Need inspiration?</Text>
          <Text style={styles.promptText}>Tap for a writing prompt</Text>
        </TouchableOpacity>
      )}

      {/* Title input */}
      <TextInput
        style={styles.titleInput}
        placeholder="Entry title (optional)"
        placeholderTextColor="#9CA3AF"
        value={title}
        onChangeText={setTitle}
        maxLength={100}
      />

      {/* Content input */}
      <TextInput
        style={styles.contentInput}
        placeholder="Write your thoughts..."
        placeholderTextColor="#9CA3AF"
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      {/* Mood selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>How are you feeling?</Text>
        <MoodSelector value={mood} onChange={setMood} />
      </View>

      {/* Tags */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tags (optional)</Text>
        <View style={styles.tagsGrid}>
          {JOURNAL_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, selectedTags.includes(tag) && styles.tagSelected]}
              onPress={() => toggleTag(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.tagTextSelected,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save Entry'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  promptCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
  },
  promptLabel: {
    fontSize: 12,
    color: '#6366F1',
    marginBottom: 4,
  },
  promptText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  titleInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  contentInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    minHeight: 200,
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#ffffff',
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
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  bottomPadding: {
    height: 40,
  },
});
