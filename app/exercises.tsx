import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ExerciseItem = {
  id: number;
  name: string;
  muscle_group: string;
};

export default function Exercises() {
  const params = useLocalSearchParams();
  const { id, add } = params as { id?: string; add?: string };
  const database = useSQLiteContext();

  const [exercise, setExercise] = React.useState<string>('');
  const [muscleGroup, setMuscleGroup] = React.useState<string>('');
  const [editMode, setEditMode] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [exercisesList, setExercisesList] = React.useState<ExerciseItem[]>([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalItem, setModalItem] = React.useState<ExerciseItem | null>(null);
  const [modalExercise, setModalExercise] = React.useState<string>('');
  const [modalMuscle, setModalMuscle] = React.useState<string>('');
  const [modalMode, setModalMode] = React.useState<'add' | 'edit'>('edit');
  const [modalError, setModalError] = React.useState<string>('');

  React.useEffect(() => {
    // load list on mount
    loadList();
  }, []);

  React.useEffect(() => {
    if (id) {
      setEditMode(true);
      setEditingId(parseInt(id as string));
      loadData(parseInt(id as string));
    } else {
      // clear only when no route id and no local selection
      if (!editingId) {
        setEditMode(false);
        setExercise('');
        setMuscleGroup('');
      }
    }
    // if add param present, clear form for creating a new exercise
    if (add) {
      setEditMode(false);
      setEditingId(null);
      setExercise('');
      setMuscleGroup('');
    }
  }, [id]);

  const loadList = async () => {
    try {
      const rows = await database.getAllAsync<ExerciseItem>(
        `SELECT * FROM exercises ORDER BY id DESC`
      );
      setExercisesList(rows ?? []);
    } catch (error) {
      console.error('Error loading exercises list:', error);
    }
  };

  const loadData = async (itemId?: number) => {
    const useId = itemId ?? (id ? parseInt(id as string) : editingId ?? null);
    if (!useId) return;
    try {
      const result = await database.getFirstAsync<ExerciseItem>(
        `SELECT * FROM exercises WHERE id = ?`,
        [useId]
      );
      setExercise(result?.name ?? '');
      setMuscleGroup(result?.muscle_group ?? '');
      setEditMode(true);
      setEditingId(useId);
    } catch (error) {
      console.error('Error loading item:', error);
    }
  };

  const handleSave = async () => {
    try {
      const response = await database.runAsync(
        `INSERT INTO exercises (name, muscle_group) VALUES (?, ?)`,
        [exercise, muscleGroup]
      );
      console.log('Item saved successfully:', response?.changes);
      // refresh list and clear form
      await loadList();
      setExercise('');
      setMuscleGroup('');
      setEditMode(false);
      setEditingId(null);
    } catch (error: any) {
      console.error('Error saving item:', error);
    }
  };

  const handleUpdate = async () => {
    const useId = editingId ?? (id ? parseInt(id as string) : null);
    if (!useId) return;
    try {
      const response = await database.runAsync(
        `UPDATE exercises SET name = ?, muscle_group = ? WHERE id = ?`,
        [exercise, muscleGroup, useId]
      );
      console.log('Item updated successfully:', response?.changes);
      await loadList();
      // remain in edit mode with updated values
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async () => {
    const useId = editingId ?? (id ? parseInt(id as string) : null);
    if (!useId) return;
    try {
      await database.runAsync(`DELETE FROM exercises WHERE id = ?`, [useId]);
      console.log('Item deleted successfully');
      await loadList();
      // clear form after delete
      setExercise('');
      setMuscleGroup('');
      setEditMode(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const onSelectItem = async (item: ExerciseItem) => {
    // load into form for editing without navigating
    setExercise(item.name);
    setMuscleGroup(item.muscle_group);
    setEditMode(true);
    setEditingId(item.id);
  };

  const renderItem = ({ item }: { item: ExerciseItem }) => (
    <TouchableOpacity
      onPress={() => onSelectItem(item)}
      style={styles.listItem}
    >
      <View>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSubtitle}>{item.muscle_group}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          // open edit/delete popup
          setModalMode('edit');
          setModalItem(item);
          setModalExercise(item.name);
          setModalMuscle(item.muscle_group);
          setModalError('');
          setModalVisible(true);
        }}
        style={styles.openButton}
      >
        <Text style={styles.openButtonText}>Edit</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Exercises',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                // open modal in add mode
                setModalMode('add');
                setModalItem(null);
                setModalExercise('');
                setModalMuscle('');
                setModalVisible(true);
              }}
              style={{ marginRight: 12 }}
            >
              <Text style={{ fontSize: 20, fontWeight: '700' }}>＋</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={{ width: '100%', paddingHorizontal: 20 }}>
        <Text style={styles.sectionTitle}>All Exercises</Text>
        <FlatList
          data={exercisesList}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListEmptyComponent={() => <Text style={{ color: 'gray' }}>No exercises yet</Text>}
          style={{ maxHeight: 300, marginBottom: 20 }}
        />
      </View>
      {/* Edit/Delete modal popup */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ width: 320, backgroundColor: 'white', padding: 16, borderRadius: 8 }}>
            <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 8 }}>Edit Exercise</Text>
            <TextInput
              placeholder="Exercise Name"
              value={modalExercise}
              onChangeText={(t) => setModalExercise(t)}
              style={[styles.textInput, { width: '100%' }]}
            />
            <View style={{ height: 8 }} />
            <TextInput
              placeholder="Muscle Group"
              value={modalMuscle}
              onChangeText={(t) => setModalMuscle(t)}
              style={[styles.textInput, { width: '100%' }]}
            />
            {modalError ? (
              <Text style={{ color: 'crimson', marginTop: 8 }}>{modalError}</Text>
            ) : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, gap: 8 }}>
              {/* Primary action: Save (add) or Update (edit) */}
              <Pressable
                onPress={async () => {
                  setModalError('');
                  const name = modalExercise?.trim();
                  if (!name) {
                    setModalError('Please enter an exercise name.');
                    return;
                  }

                  if (modalMode === 'add') {
                    // INSERT
                    try {
                      await database.runAsync(
                        `INSERT INTO exercises (name, muscle_group) VALUES (?, ?)`,
                        [name, modalMuscle]
                      );
                      await loadList();
                      setModalVisible(false);
                    } catch (err: any) {
                      // Detect UNIQUE constraint failure and show friendly message
                      const msg = String(err?.message ?? err);
                      if (msg.includes('UNIQUE constraint failed') || msg.toLowerCase().includes('unique')) {
                        setModalError('An exercise with that name already exists.');
                      } else {
                        console.error('Error inserting from modal:', err);
                        setModalError('Failed to save exercise.');
                      }
                    }
                    return;
                  }

                  // edit mode -> UPDATE
                  if (!modalItem) return;
                  try {
                    await database.runAsync(
                      `UPDATE exercises SET name = ?, muscle_group = ? WHERE id = ?`,
                      [modalExercise.trim(), modalMuscle, modalItem.id]
                    );
                    await loadList();
                    setModalVisible(false);
                  } catch (err: any) {
                    const msg = String(err?.message ?? err);
                    if (msg.includes('UNIQUE constraint failed') || msg.toLowerCase().includes('unique')) {
                      setModalError('An exercise with that name already exists.');
                    } else {
                      console.error('Error updating from modal:', err);
                      setModalError('Failed to update exercise.');
                    }
                  }
                }}
                style={[styles.button, { backgroundColor: 'blue', flex: 1 }]}
              >
                <Text style={styles.buttonText}>{modalMode === 'add' ? 'Save' : 'Update'}</Text>
              </Pressable>
              <View style={{ width: 8 }} />
              {/* Show Delete only in edit mode */}
              {modalMode === 'edit' ? (
                <Pressable
                  onPress={async () => {
                    if (!modalItem) return;
                    try {
                      await database.runAsync(`DELETE FROM exercises WHERE id = ?`, [modalItem.id]);
                      await loadList();
                      setModalVisible(false);
                    } catch (err) {
                      console.error('Error deleting from modal:', err);
                    }
                  }}
                  style={[styles.button, { backgroundColor: 'red', flex: 1 }]}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </Pressable>
              ) : (
                <View style={{ flex: 1 }} />
              )}
            </View>
            <View style={{ height: 8 }} />
            <Pressable onPress={() => setModalVisible(false)} style={{ alignSelf: 'flex-end', padding: 6 }}>
              <Text style={{ color: '#007AFF', fontWeight: '600' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    padding: 10,
    width: 300,
    borderRadius: 5,
    borderColor: 'slategray',
  },
  button: {
    height: 40,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    color: 'white',
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 16,
  },
  listItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontWeight: '600',
  },
  itemSubtitle: {
    color: 'gray',
    marginTop: 2,
  },
  openButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  openButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
