import { Image, StyleSheet, Platform, Text, View, FlatList, Button, Modal, } from 'react-native';
import { Link } from 'expo-router'
import { useState, useCallback } from 'react'
import { saveWorkouts, getWorkouts } from '@/utils/storage';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import WorkoutCalendar from '@/components/Calendar'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState([]);
    
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

  return (
    <SafeAreaView style={styles.safeArea}>
    <ThemedView style={styles.calendarWrapper}>
      <WorkoutCalendar style={styles.calendar} workoutData={workouts} setWorkouts={setWorkouts} saveWorkouts={saveWorkouts} />
    </ThemedView>
  </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light background to make calendar pop
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarWrapper: {
    width: '90%',
    borderRadius: 20, // Adjust the roundness
    overflow: 'hidden', // Ensures corners stay rounded
    margin: 15, // Space around the calendar
    backgroundColor: 'white', // Keeps it clean and neutral
    elevation: 4,
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 10, // Ensures inner content isn’t too close to the edges
  },
  calendar: {
    padding: 10, // Add padding inside to prevent cut-off text
  },
});
