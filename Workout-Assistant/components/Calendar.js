import React, { useState } from 'react';
import { Calendar } from 'react-native-calendars';
import { useColorScheme, Text, StyleSheet, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

const WorkoutCalendar = ({ workoutData = [], setWorkouts, saveWorkouts }) => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return dateStr;
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const workoutMap = workoutData.reduce((acc, workout) => {
    const formattedDate = formatDate(workout.date);
    if (!acc[formattedDate]) {
      acc[formattedDate] = [];
    }
    acc[formattedDate].push(workout);
    return acc;
  }, {});

  const markedDates = workoutData.reduce((acc, workout) => {
    const formattedDate = formatDate(workout.date);
    const [year, month] = formattedDate.split('-');
    const isCurrentMonth =
      parseInt(month, 10) === currentMonth && parseInt(year, 10) === currentYear;

    acc[formattedDate] = {
      customStyles: {
        container: {
          backgroundColor: isCurrentMonth ? 'rgba(0, 100, 0,0.7)' : '#d0f0d0',
          borderRadius: 20,
        },
        text: {
          color: 'white',
          fontWeight: 'bold',
        },
      },
    };
    return acc;
  }, {});

  const calendarTheme = {
    backgroundColor: Colors[colorScheme].background,
    calendarBackground: Colors[colorScheme].background,
    arrowColor: '#4A90E2',
    monthTextColor: '#4A90E2',
    textMonthFontWeight: 'bold',
    todayTextColor: '#4CAF50',
    textSectionTitleColor: '#424242',
    dayTextColor: '#424242',
    textDisabledColor: '#BDBDBD',
    selectedDayTextColor: '#fff',
    selectedDayBackgroundColor: '#007AFF',
  };

  const handleWorkoutSelection = (day) => {
    const workouts = workoutMap[day.dateString];
    setSelectedDate(day.dateString);
    setSelectedWorkouts(workouts || []);
    setModalVisible(true);
  };

  const addWorkout = () => {
    const newWorkout = {
      key: Date.now().toString(),
      name: '',
      date: selectedDate.toLocaleString(),
      time: '',
      exercises: [
        {
          key: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
          name: '',
          sets: [
            {
              reps: '',
              weight: '',
              key: `${Date.now().toString()}-${Math.random().toString(36).substring(2, 9)}-1`,
            },
          ],
        },
      ],
    };

    const updatedWorkouts = [newWorkout, ...workoutData];
    setWorkouts(updatedWorkouts);
    saveWorkouts(updatedWorkouts);
    setTimeout(() => {
      router.push({
        pathname: '../modal',
        params: { key: newWorkout.key, name: newWorkout.name },
      });
    }, 0);
  };

  return (
    <View>
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        theme={calendarTheme}
        onDayPress={handleWorkoutSelection}
      />
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedWorkouts.length > 0 ? 'Select a Session' : 'No Workouts Found'}
            </Text>

            {selectedWorkouts.length > 0 ? (
              <ScrollView style={styles.scrollViewContainer}>
                {selectedWorkouts.map((workout) => (
                  <TouchableOpacity
                    key={workout.key}
                    style={styles.workoutItem}
                    onPress={() => {
                      setModalVisible(false);
                      router.push({
                        pathname: '../modal',
                        params: { key: workout.key, name: workout.name },
                      });
                    }}
                  >
                    <Text style={styles.workoutText}>{workout.name}</Text>
                    <Text style={styles.workoutTime}>{workout.time}</Text>
                    {workout.exercises &&
                      workout.exercises.map((exercise) => (
                        <View key={exercise.key} style={styles.exerciseContainer}>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          {exercise.sets &&
                            exercise.sets.map((set) => (
                              <Text key={set.key} style={styles.setInfo}>
                                {`Reps: ${set.reps}, Weight: ${set.weight}`}
                              </Text>
                            ))}
                        </View>
                      ))}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noWorkoutsText}>No workouts found for this date.</Text>
            )}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.createWorkoutButton, styles.buttonStyle]}
                onPress={() => {
                  setModalVisible(false);
                  addWorkout();
                }}
              >
                <Text style={styles.createWorkoutText}>Create New</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, styles.buttonStyle]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  scrollViewContainer: {
    width: '100%',
    // Adjust maxHeight as needed to control the scrollable area
    maxHeight: 500,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  workoutItem: {
    width: '100%',
    padding: 12,
    backgroundColor: 'white',
    borderColor: '#007bff',
    borderWidth: 1,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  workoutText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  workoutTime: {
    marginTop: 5,
    color: '#555',
    fontSize: 12,
  },
  exerciseContainer: {
    width: '100%',
    marginTop: 10,
    padding: 5,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  setInfo: {
    fontSize: 14,
    color: '#666',
  },
  noWorkoutsText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonStyle: {
    flex: 1,
    marginHorizontal: 5,
  },
  createWorkoutButton: {
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 5,
    alignItems: 'center',
  },
  createWorkoutText: {
    color: '#555',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  cancelText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default WorkoutCalendar
