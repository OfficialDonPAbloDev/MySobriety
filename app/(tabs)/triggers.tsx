import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTriggers,
  TriggerLogCard,
  TriggerLogEditor,
  TriggerStats,
} from '../../src/features/triggers';

type ViewMode = 'list' | 'editor';

export default function TriggersScreen() {
  const {
    triggerLogs,
    copingStrategies,
    isLoading,
    stats,
    logTrigger,
    deleteTriggerLog,
    loadMore,
    hasMore,
  } = useTriggers();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogTrigger = async (input: Parameters<typeof logTrigger>[0]) => {
    setIsSubmitting(true);
    try {
      await logTrigger(input);
      setViewMode('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = (id: string) => {
    Alert.alert('Delete Trigger Log', 'Are you sure you want to delete this log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTriggerLog(id);
        },
      },
    ]);
  };

  if (viewMode === 'editor') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.editorHeader}>
          <Text style={styles.editorTitle}>Log a Trigger</Text>
        </View>
        <TriggerLogEditor
          copingStrategies={copingStrategies}
          onSave={handleLogTrigger}
          onCancel={() => setViewMode('list')}
          isSubmitting={isSubmitting}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Triggers</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setViewMode('editor')}>
          <Text style={styles.addButtonText}>+ Log Trigger</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={triggerLogs}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<TriggerStats stats={stats} />}
        renderItem={({ item }) => (
          <TriggerLogCard
            log={item}
            onDelete={() => handleDeleteLog(item.id)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🎯</Text>
              <Text style={styles.emptyTitle}>No triggers logged yet</Text>
              <Text style={styles.emptyText}>
                Tracking your triggers helps you understand patterns and develop better coping strategies.
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => setViewMode('editor')}>
                <Text style={styles.emptyButtonText}>Log Your First Trigger</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
      />
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
  editorHeader: {
    padding: 20,
    paddingBottom: 0,
  },
  editorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 32,
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
