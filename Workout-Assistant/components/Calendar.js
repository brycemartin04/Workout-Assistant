import React, {useState} from 'react';
import { Calendar } from 'react-native-calendars';
import { useColorScheme, Text, StyleSheet, Alert, TouchableOpacity, Platform, View, Modal } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

const WorkoutCalendar = ({ workoutData = [], setWorkouts, saveWorkouts,  }) => {
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
    const isCurrentMonth = parseInt(month, 10) === currentMonth && parseInt(year, 10) === currentYear;

    acc[formattedDate] = {
      customStyles: {
        container: {
          backgroundColor: isCurrentMonth ? 'rgba(0, 100, 0,0.7)' : '#d0f0d0', // Light green for other months
          borderRadius: 4,
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
    arrowColor: '#007bff',
    monthTextColor: '#007bff',
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
    setSelectedDate(day.dateString)
    setSelectedWorkouts(workouts || []);
    setModalVisible(true);
  };

  const addWorkout = () => {
    const newWorkout = {
        key: Date.now().toString(),
        name: '',
        //date: new Date().toLocaleDateString(),
        date: selectedDate.toLocaleString(),
        time: '',
        exercises: [
            {
                key: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
                name: '',
                sets: [
                    { reps: '', weight: '', key: `${Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9)}-1` },
                ],
            },
        ],
    };
    
    const updatedWorkouts = [newWorkout, ...workoutData,];
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
            selectedWorkouts.map((workout) => (
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
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noWorkoutsText}>
              No workouts found for this date.
            </Text>
          )}

          {/* Create New Workout Button */}
          <TouchableOpacity
            style={styles.createWorkoutButton}
            onPress={() => {
              setModalVisible(false);
              addWorkout();
            }}
          >
            <Text style={styles.createWorkoutText}>Create New Workout</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  workoutItem: {
    width: '100%',
    padding: 12,
    backgroundColor: '#007AFF',
    marginVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  workoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  workoutTime: {
    marginTop: 5,
    color: 'white',
    fontSize: 12,
  },
  cancelButton: {
    marginTop: 10,
    width: '100%',
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noWorkoutsText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 10,
  },
  createWorkoutButton: {
    width: '100%',
    padding: 12,
    backgroundColor: '#28a745', // Green color for positive action
    marginVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  createWorkoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WorkoutCalendar;
