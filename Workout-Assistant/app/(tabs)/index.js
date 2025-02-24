import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, Image, Platform, View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router'
import Workout from '@/components/Workout'
import { saveWorkouts, getWorkouts } from '@/utils/storage';
import WorkoutCalendar from '@/components/Calendar'



export default function logWorkout() {
    const router = useRouter()
    

    const pressHandler = (workout) => {
        setTimeout(() => {
            router.push({
                pathname: '../modal',
                params: { key: workout.key, name: workout.name },
            });
        }, 0);
      }

      const [workouts, setWorkouts] = useState([]);
        

    //Load stored workouts when the component mounts
    useFocusEffect(
        useCallback(() => {
            const loadWorkouts = async () => {
                const storedWorkouts = await getWorkouts();
                //console.log('Raw JSON:', JSON.stringify(storedWorkouts, null, 2));
                setWorkouts(storedWorkouts);
            };
            loadWorkouts();
        }, [])
    );

    const addWorkout = () => {
        const newWorkout = {
            key: Date.now().toString(),
            name: '',
            //date: new Date().toLocaleDateString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        
        const updatedWorkouts = [newWorkout, ...workouts,];
        setWorkouts(updatedWorkouts);
        saveWorkouts(updatedWorkouts);
        pressHandler(newWorkout)
    };

    const editWorkout = (key, newText) => {
        const updatedWorkouts = workouts.map(workout => 
            workout.key === key ? { ...workout, text: newText } : workout
        );
        setWorkouts(updatedWorkouts);
        saveWorkouts(updatedWorkouts);
    };

    const removeWorkout = (key) => {
        const updatedWorkouts = workouts.filter(workout => workout.key !== key);
        setWorkouts(updatedWorkouts);
        saveWorkouts(updatedWorkouts);
    };

    
  return (
    
    <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.calendarWrapper}>
            <WorkoutCalendar style={styles.calendar} workoutData={workouts} setWorkouts={setWorkouts} saveWorkouts={saveWorkouts} />
        </ThemedView>
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTxt}>Recent Sessions</ThemedText>
          
      </View>
      
        <View style={styles.list}>
        <FlatList 
            data = {workouts.slice(0,10)}
            renderItem={({ item }) => (
                <Workout item={item} pressHandler={() => pressHandler(item)}/>
            )} />
        </View>
        <TouchableOpacity style={styles.button} onPress={() => addWorkout()}>
            <ThemedView style={styles.start}>
                <ThemedText style={styles.startTxt}>Start A New Session</ThemedText>
            </ThemedView>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        marginBottom: 100,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    headerContainer: {
        width: '70%',
        backgroundColor: 'fff',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(85,85,85,.2)',
        
      },
      headerTxt: {
        padding: 6,
        color: '#4A90E2',
        fontSize: 24,
        fontWeight: 'bold',
      },
    list: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start',
        marginTop: 5
    },
    button: {
        width: '80%', // Set width to 80% of the screen
      },
    start: {
        backgroundColor: '#4A90E2', // Blue button
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        
    
    },
    startTxt: {
        fontSize: 20,
        color: '#fff', // White text
        fontWeight: 'bold'
        
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
      },
      calendarWrapper: {
        width: '90%',
        borderRadius: 20, // Adjust the roundness
        overflow: 'hidden', // Ensures corners stay rounded
        margin: 15, // Space around the calendar
        backgroundColor: 'white', // Keeps it clean and neutral
        elevation: 4,
        borderColor: '#DDD',
        borderWidth: 1,
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        padding: 0, // Ensures inner content isn’t too close to the edges
      },
      calendar: {
        padding: 10, // Add padding inside to prevent cut-off text
      },
});
