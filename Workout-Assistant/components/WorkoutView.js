import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';

const WorkoutView = ({ workoutData }) => {
  const handleWorkoutPress = (workout) => {
    Alert.alert("Workout Details", JSON.stringify(workout, null, 2));
  };

  if (!workoutData || workoutData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noWorkoutText}>No workout recorded for this day.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Workout Details</Text>
      <FlatList
        data={workoutData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => handleWorkoutPress(item)}>
            <View style={styles.workoutItem}>
              <Text style={styles.workoutTitle}>Workout {index + 1}</Text>
              <Text>{JSON.stringify(item, null, 2)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  noWorkoutText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
  workoutItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default WorkoutView;