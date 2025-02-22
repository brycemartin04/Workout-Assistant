import { Image, StyleSheet, Platform, Text, View, FlatList, Button, Modal, } from 'react-native';
import { Link } from 'expo-router'
import { useState } from 'react'

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import WorkoutCalendar from '@/components/Calendar'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView>
        <WorkoutCalendar />
        <Link href="../modal" asChild>
          <Button title="Import Workout" />
        </Link>

      </ThemedView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
