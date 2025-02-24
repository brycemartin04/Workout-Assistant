import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getWorkouts, saveWorkouts } from '@/utils/storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Helper to generate unique keys
const generateUniqueKey = () =>
  Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);

export default function ModalScreen() {
  const router = useRouter();
  const { key, name } = useLocalSearchParams(); // key exists if editing an existing workout

  // State for the workout session
  const [workoutName, setWorkoutName] = useState(name || '');
  // exercises is an array of objects; each has a name and an array of sets
  const [exercises, setExercises] = useState([
    { key: generateUniqueKey(), name: '', sets: [{ key: generateUniqueKey(), reps: '', weight: '' }] },
  ]);
  const [workouts, setWorkouts] = useState([]);
  // State to keep track of which exercise is collapsed. Object keyed by exercise key.
  const [collapsedExercises, setCollapsedExercises] = useState({});

  // If editing, load the existing workout from storage
  useEffect(() => {
    const loadWorkout = async () => {
      const storedWorkouts = await getWorkouts();
      setWorkouts(storedWorkouts || []);
      if (key) {
        const existingWorkout = storedWorkouts.find(w => w.key === key);
        if (existingWorkout) {
          setWorkoutName(existingWorkout.name);
          setExercises(existingWorkout.exercises);
        }
      }
    };
    loadWorkout();
  }, [key]);

  // Toggle collapse/expand for a given exercise
  const toggleExerciseCollapse = (exerciseKey) => {
    setCollapsedExercises(prev => ({
      ...prev,
      [exerciseKey]: !prev[exerciseKey],
    }));
  };

  // Add a new exercise to the list
  const addExercise = () => {
    const newExercise = {
      key: generateUniqueKey(),
      name: '',
      sets: [{ key: generateUniqueKey(), reps: '', weight: '' }],
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (exerciseKey) => {
    setExercises(exercises.filter(exercise => exercise.key !== exerciseKey));
  };

  // Update the name of an exercise
  const updateExerciseName = (exerciseKey, newName) => {
    const updated = exercises.map(exercise =>
      exercise.key === exerciseKey ? { ...exercise, name: newName } : exercise
    );
    setExercises(updated);
  };

  // Add a new set within an exercise
  const addSetToExercise = (exerciseKey) => {
    const updated = exercises.map(exercise => {
      if (exercise.key === exerciseKey) {
        const newSet = { key: generateUniqueKey(), reps: '', weight: '' };
        return { ...exercise, sets: [...exercise.sets, newSet] };
      }
      return exercise;
    });
    setExercises(updated);
  };

  // Update a field (reps or weight) of a set within an exercise
  const updateSet = (exerciseKey, setKey, field, value) => {
    const updated = exercises.map(exercise => {
      if (exercise.key === exerciseKey) {
        const newSets = exercise.sets.map(set =>
          set.key === setKey ? { ...set, [field]: value } : set
        );
        return { ...exercise, sets: newSets };
      }
      return exercise;
    });
    setExercises(updated);
  };

  // Remove a set from an exercise
  const removeSetFromExercise = (exerciseKey, setKey) => {
    const updated = exercises.map(exercise => {
      if (exercise.key === exerciseKey) {
        const newSets = exercise.sets.filter(set => set.key !== setKey);
        return { ...exercise, sets: newSets };
      }
      return exercise;
    });
    setExercises(updated);
  };

  const deleteWorkout = async () => {
    if (!key) return; // Only allow deleting if editing an existing workout
  
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedWorkouts = workouts.filter(w => w.key !== key);
            setWorkouts(updatedWorkouts);
            await saveWorkouts(updatedWorkouts);
            router.back(); // Go back to the previous screen
          }
        }
      ]
    );
  };

  // Save the workout (either update an existing one or add a new one)
  const saveWorkout = async () => {
    const originalWorkout = workouts.find(w => w.key === key);
    
    // Build the new workout object
    const newWorkout = {
      key: key || Date.now().toString(),
      name: workoutName || 'New Training Session',
      date: originalWorkout ? originalWorkout.date : new Date().toLocaleDateString(),
      time: originalWorkout ? originalWorkout.time : new Date().toLocaleTimeString(),
      exercises: exercises.map(ex => ({
        ...ex,
        sets: ex.sets.map(s => ({
          reps: parseInt(s.reps, 10) || 0,
          weight: parseInt(s.weight, 10) || 0,
          key: s.key,
        })),
      })),
    };

    let updatedWorkouts;
    if (key) {
      // Update the existing workout in the list
      updatedWorkouts = workouts.map(w => (w.key === key ? newWorkout : w));
    } else {
      // Prepend new workout so that it appears at the start of the list
      updatedWorkouts = [newWorkout, ...workouts];
    }

    setWorkouts(updatedWorkouts);
    await saveWorkouts(updatedWorkouts);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // adjust this value as needed
    >
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView style={styles.nameView}>
          <TextInput
            style={styles.headInput}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="Session Name"
            autoFocus={workoutName === ''}
          />
        </ThemedView>

        {exercises.map((exercise, idx) => (
          <ThemedView key={exercise.key} style={styles.exerciseContainer}>
            <View style={styles.exerciseHeader}>
              <TextInput
                style={styles.nameInput}
                value={exercise.name}
                onChangeText={(text) => updateExerciseName(exercise.key, text)}
                placeholder="Add Exercise Name"
                autoFocus={workoutName != '' && !exercise.name}
              />
              <TouchableOpacity onPress={() => toggleExerciseCollapse(exercise.key)} style={{ marginBottom: 10 }}>
                <FontAwesome
                  name={collapsedExercises[exercise.key] ? "angle-down" : "angle-up"}
                  size={30}
                  color="#007AFF"
                />
              </TouchableOpacity>
            </View>
            {!collapsedExercises[exercise.key] && (
              <>
                <View style={styles.setContainer}>
                  <ThemedText>Set</ThemedText>
                  <ThemedText>Reps</ThemedText>
                  <ThemedText>Weight</ThemedText>
                  <ThemedText>Remove</ThemedText>
                </View>
                {exercise.sets.map((set, setIdx) => (
                  <View key={set.key} style={styles.setContainer}>
                    <View style={styles.set}>
                      <ThemedText style={{ fontSize: 18 }}>{setIdx + 1}</ThemedText>
                    </View>
                    <TextInput
                      style={[styles.input, styles.setInput]}
                      value={set.reps.toString()}
                      onChangeText={(text) =>
                        updateSet(exercise.key, set.key, 'reps', text.replace(/[^0-9]/g, ''))
                      }
                      placeholder="Reps"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.input, styles.setInput]}
                      value={set.weight.toString()}
                      onChangeText={(text) =>
                        updateSet(exercise.key, set.key, 'weight', text.replace(/[^0-9]/g, ''))
                      }
                      placeholder="Weight"
                      keyboardType="numeric"
                    />
                    <TouchableOpacity onPress={() => removeSetFromExercise(exercise.key, set.key)}>
                      <FontAwesome name="remove" size={24} color="#EE0606" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={{ flexDirection: 'row', flex: 1 }}>
                  <TouchableOpacity onPress={() => removeExercise(exercise.key)} style={{ alignSelf: 'flex-start' }}>
                    <FontAwesome name="trash" size={25} color="#555" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.setButton} onPress={() => addSetToExercise(exercise.key)}>
                    <ThemedView style={styles.addSet}>
                      <ThemedText style={styles.addSetTxt}>+ Add Set</ThemedText>
                    </ThemedView>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ThemedView>
        ))}

        <TouchableOpacity style={styles.exerciseButton} onPress={addExercise}>
          <ThemedView style={styles.addExercise}>
            <ThemedText style={styles.addExerciseTxt}>+ Add Exercise</ThemedText>
          </ThemedView>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={saveWorkout}>
          <ThemedView style={styles.save}>
            {key && <ThemedText style={styles.saveTxt}>Save Changes</ThemedText>}
          </ThemedView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={deleteWorkout}>
          <ThemedView style={styles.delete}>
            {key && <ThemedText style={styles.deleteTxt}>Delete Workout</ThemedText>}
          </ThemedView>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    flexGrow: 1,
  },
  nameView: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    padding: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  headInput: {
    width: '90%',
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginBottom: 10,
    color: '#4A90E2',
  },
  exerciseContainer: {
    width: '100%',
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameInput: {
    fontSize: 25,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginBottom: 10,
    flex: 1,
    color: "#4A90E2"
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  set: {
    width: '10%',
    alignItems: 'center',
  },
  input: {
    width: '30%',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    fontSize: 18
  },
  setInput: {
    width: '30%',
  },
  setButton: {
    width: '100%',
  },
  addSet: {
    backgroundColor: 'rgba(85,85,85,.3)',
    alignSelf: 'center',
    right: 20,
    paddingVertical: 1,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addSetTxt: {
    fontSize: 18,
    color: '#fff',
  },
  exerciseButton: {
    width: '100%',
    alignSelf: 'center',
  },
  addExercise: {
    width: '100%',
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  addExerciseTxt: {
    fontSize: 20,
    color: '#555',
    fontWeight: 'bold',
  },
  saveButton: {
    width: '80%',
    marginTop: 'auto',
    marginBottom: 15,
  },
  save: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  saveTxt: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    width: '40%',
    marginBottom: 30,
  },
  delete: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteTxt: {
    fontSize: 18,
    color: 'red',
    textDecorationLine: 'underline',
  },
});
