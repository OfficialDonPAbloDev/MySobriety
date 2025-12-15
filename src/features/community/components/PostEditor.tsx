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
  Switch,
} from 'react-native';
import { PostCategory, CreatePostInput, POST_CATEGORIES } from '../services/communityService';

interface PostEditorProps {
  onSave: (input: CreatePostInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PostEditor({ onSave, onCancel, isSubmitting }: PostEditorProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('general');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;

    await onSave({
      content: content.trim(),
      category,
      is_anonymous: isAnonymous,
    });
  };

  const isValid = content.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {POST_CATEGORIES.map((cat) => (
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
          </ScrollView>
          <Text style={styles.categoryDescription}>
            {POST_CATEGORIES.find((c) => c.value === category)?.description}
          </Text>
        </View>

        {/* Content Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>What's on your mind? *</Text>
          <TextInput
            style={[styles.textInput, styles.contentInput]}
            value={content}
            onChangeText={setContent}
            placeholder="Share your thoughts, ask a question, or tell your story..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={5000}
          />
          <Text style={styles.charCount}>{content.length}/5000</Text>
        </View>

        {/* Anonymous Toggle */}
        <View style={styles.anonymousSection}>
          <View style={styles.anonymousInfo}>
            <Text style={styles.anonymousLabel}>Post Anonymously</Text>
            <Text style={styles.anonymousHint}>
              Your name and sobriety days won't be shown
            </Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
            thumbColor={isAnonymous ? '#4F46E5' : '#9CA3AF'}
          />
        </View>

        {/* Community Guidelines */}
        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Community Guidelines</Text>
          <Text style={styles.guidelinesText}>
            • Be respectful and supportive{'\n'}
            • No sharing of harmful content{'\n'}
            • Protect your privacy and others'{'\n'}
            • Focus on recovery and positive support
          </Text>
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
            {isSubmitting ? 'Posting...' : 'Post'}
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
  contentInput: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  categoryIcon: {
    fontSize: 14,
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
  categoryDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    fontStyle: 'italic',
  },
  anonymousSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  anonymousInfo: {
    flex: 1,
  },
  anonymousLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  anonymousHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  guidelinesCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
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
