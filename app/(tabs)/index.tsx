import { router, Stack, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ExerciseType = {
  id: number;
  name: string;
  muscle_group: string;
};

export default function TabHome() {
  const [data, setData] = React.useState<ExerciseType[]>([]);

  const database = useSQLiteContext();

  const loadData = async () => {
    try {
      const response = await database.getAllAsync<any>(`SELECT * FROM exercises`);
      // Many expo-sqlite wrappers return an array-of-result-sets (ExerciseType[][]).
      // Flatten into a single ExerciseType[] before setting state.
      const rows: ExerciseType[] = Array.isArray(response) ? (response.flat() as ExerciseType[]) : [];
      setData(rows);
    } catch (err) {
      console.error("Failed to load exercises", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );


  const headerRight = () => {
    return (
      <TouchableOpacity style={{ marginRight: 10 }} onPress={() => router.push('/modal')}>
        <Text style={{ color: 'blue' }}>Info</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <Stack.Screen options={{ headerRight }} />
      <View>
        <FlatList<ExerciseType>
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({
            item,
          }: {
            item: ExerciseType;
          }) => (
            <View style={{ padding: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text>{item.name}</Text>
                  <Text>{item.muscle_group}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    router.push(`/modal?id=${item.id}`);
                  }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </View>
  );
}
    
const styles = StyleSheet.create({
  button: {
    height: 30,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "blue",
    alignContent: "flex-end",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
});