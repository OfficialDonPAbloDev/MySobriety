import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { JournalEntry } from '../services/journalService';
import { MOOD_OPTIONS } from '../../check-in/services/checkInService';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export function JournalEntryCard({ entry, onPress, onToggleFavorite }: JournalEntryCardProps) {
  const moodOption = entry.mood_rating
    ? MOOD_OPTIONS.find((m) => m.value === entry.mood_rating)
    : null;

  const formattedDate = new Date(entry.entry_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const truncatedContent =
    entry.content.length > 120 ? entry.content.substring(0, 120) + '...' : entry.content;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={styles.date}>{formattedDate}</Text>
          {moodOption && <Text style={styles.mood}>{moodOption.emoji}</Text>}
        </View>
        <TouchableOpacity onPress={onToggleFavorite} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.favorite}>{entry.is_favorite ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {entry.title && <Text style={styles.title}>{entry.title}</Text>}

      <Text style={styles.content}>{truncatedContent}</Text>

      {entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {entry.tags.length > 3 && (
            <Text style={styles.moreTags}>+{entry.tags.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 13,
    color: '#6B7280',
  },
  mood: {
    fontSize: 16,
  },
  favorite: {
    fontSize: 20,
    color: '#F59E0B',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  content: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#4F46E5',
  },
  moreTags: {
    fontSize: 11,
    color: '#9CA3AF',
    alignSelf: 'center',
  },
});
