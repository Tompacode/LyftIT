import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Modal() {
  const { id } = useLocalSearchParams();

  const [exercise, setExercise] = React.useState<string>('');
  const [muscleGroup, setMuscleGroup] = React.useState<string>('');
  const [editMode, setEditMode] = React.useState(false);

  // get the database context
  const database = useSQLiteContext();

  React.useEffect(() => {
    if (id) {
      // if id is present, then we are in edit mode
      setEditMode(true);
      loadData();
    } else {
      setEditMode(false);
      setExercise('');
      setMuscleGroup('');
    }
  }, [id]);

const loadData = async () => {
    try {
        const result = await database.getFirstAsync<{
            id: number;
            name: string;
            muscle_group: string;
        }>(`SELECT * FROM exercises WHERE id = ?`, [parseInt(id as string)]);
        setExercise(result?.name ?? '');
        setMuscleGroup(result?.muscle_group ?? '');
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
        router.back();
    } catch (error: any) {
        // handle unique constraint violation more clearly if desired
        console.error('Error saving item:', error);
    }
};

const handleUpdate = async () => {
    try {
        const response = await database.runAsync(
            `UPDATE exercises SET name = ?, muscle_group = ? WHERE id = ?`,
            [exercise, muscleGroup, parseInt(id as string)]
        );
        console.log('Item updated successfully:', response?.changes);
        router.back();
    } catch (error) {
        console.error('Error updating item:', error);
    }
};

const handleDelete = async () => {
    try {
        await database.runAsync(`DELETE FROM exercises WHERE id = ?`, [parseInt(id as string)]);
        console.log('Item deleted successfully');
        router.back();
    } catch (error) {
        console.error('Error deleting item:', error);
    }
};

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Item Modal' }} />
      <View
        style={{
          gap: 20,
          marginVertical: 20,
        }}
      >
        <TextInput
          placeholder="Exercise Name"
          value={exercise}
          onChangeText={(text) => setExercise(text)}
          style={styles.textInput}
        />
        <TextInput
          placeholder="Muscle Group"
          value={muscleGroup}
          onChangeText={(text) => setMuscleGroup(text)}
          style={styles.textInput}
        />
      </View>
      <View style={{ flex: 1, flexDirection: 'row', gap: 20 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.button, { backgroundColor: 'grey' }]}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete()}
          style={[styles.button, { backgroundColor: 'red' }]}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            editMode ? handleUpdate() : handleSave();
          }}
          style={[styles.button, { backgroundColor: 'blue' }]}
        >
          <Text style={styles.buttonText}>{editMode ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
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
});
