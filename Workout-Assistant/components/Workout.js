import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Workout({ item, pressHandler }) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity 
      onPress={() => pressHandler(item)} 
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={styles.button}
      activeOpacity={0.8}
    >
      <ThemedView style={[styles.card, isPressed && styles.cardPressed]}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{item.name}</ThemedText>
          <MaterialIcons name="fitness-center" size={24} color="#555" style={{ marginRight: -13, marginTop: -6 }}/>
        </View>
        <View style={styles.details}>
          <View style={styles.dateTimeGroup}>
            <View style={styles.infoRow}>
              <MaterialIcons name="date-range" size={18} color="#555"/>
              <ThemedText style={styles.text}> {item.date}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              {item.time && <MaterialIcons name="access-time-filled" size={18} color="#555" />}
              <ThemedText style={styles.text}> {item.time}</ThemedText>
            </View>
          </View>
          <View style={styles.tapHintContainer}>
            <ThemedText style={styles.tapHint}>Tap to edit</ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '90%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    transition: 'all 0.2s ease-in-out',
  },
  cardPressed: {
    backgroundColor: '#F0F0F0',
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  tapHintContainer: {
    marginLeft: 'auto',
    justifyContent: 'center',
    margin: -5,
    marginBottom: -15,
  },
  tapHint: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
});
