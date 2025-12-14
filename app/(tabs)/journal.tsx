import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useJournal, JournalEntryCard, JournalEditor } from '../../src/features/journal';

export default function JournalScreen() {
  const {
    entries,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    loadMore,
    hasMore,
  } = useJournal();

  const [showEditor, setShowEditor] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const handleSave = async (input: Parameters<typeof createEntry>[0]) => {
    await createEntry(input);
    setShowEditor(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(id);
        },
      },
    ]);
  };

  if (showEditor) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <JournalEditor
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Journal</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowEditor(true)}>
          <Text style={styles.addButtonText}>+ New Entry</Text>
        </TouchableOpacity>
      </View>

      {isLoading && entries.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyTitle}>No journal entries yet</Text>
          <Text style={styles.emptyText}>
            Start journaling to track your thoughts and feelings throughout your recovery journey.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => setShowEditor(true)}>
            <Text style={styles.emptyButtonText}>Write Your First Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JournalEntryCard
              entry={item}
              onPress={() => setSelectedEntryId(item.id)}
              onFavorite={() => toggleFavorite(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          onEndReached={hasMore ? loadMore : undefined}
          onEndReachedThreshold={0.5}
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
