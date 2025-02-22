import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, Image, Platform, View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router'
import Workout from '@/components/Workout'
import { saveWorkouts, getWorkouts } from '@/utils/storage';



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
                console.log('Raw JSON:', JSON.stringify(storedWorkouts, null, 2));
                setWorkouts(storedWorkouts);
            };
            loadWorkouts();
        }, [])
    );

    const addWorkout = () => {
        const newWorkout = {
            key: Date.now().toString(),
            name: 'New Workout',
            date: new Date().toISOString().split('T')[0], // Gets the current date in YYYY-MM-DD format
            time: new Date().toLocaleTimeString(),
            exercises: [
                {
                    key: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9),
                    name: 'Exercise 1',
                    sets: [
                        { reps: 0, weight: 0, key: `${Date.now()}-1` },
                    ],
                },
            ],
        };
    
        const updatedWorkouts = [newWorkout, ...workouts,];
        setWorkouts(updatedWorkouts);
        saveWorkouts(updatedWorkouts);
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
        <View style={styles.list}>
        <FlatList 
            data = {workouts}
            renderItem={({ item }) => (
                // <Workout item={item} pressHandler={() => removeWorkout(item.key)}/>
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
        marginBottom: 120,
        justifyContent: 'flex-end',
        alignItems: 'center',
        
    },
    list: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-start'
    },
    button: {
        width: '80%', // Set width to 80% of the screen
        
      },
    start: {
        backgroundColor: '#007bff', // Blue button
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
        
    }
});
