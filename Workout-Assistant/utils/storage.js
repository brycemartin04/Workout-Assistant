import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native'


// Key for storing workout data
const STORAGE_KEY = 'workouts';

// Save workouts to AsyncStorage
export const saveWorkouts = async (workouts) => {
    try {
        const jsonValue = JSON.stringify(workouts);
        await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
        console.error('Error saving workouts:', error);
    }
};

// Get workouts from AsyncStorage
export const getWorkouts = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error retrieving workouts:', error);
        return [];
    }
};

// Clear all workouts (for debugging or reset)
export const clearWorkouts = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing workouts:', error);
    }
};

export const getWorkoutSummary = async () => {
    try {
      const workouts = await getWorkouts();
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
      // Filter workouts that occurred in the last two weeks
      const recentWorkouts = workouts.filter((workout) => {
        // Assumes workout.date is a valid date string
        const workoutDate = new Date(workout.date);
        return workoutDate >= twoWeeksAgo;
      });
  
      // Create a summary (you can extend this to include aggregates like total duration, etc.)
      const summary = {
        totalWorkouts: recentWorkouts.length,
        workouts: recentWorkouts,
      };
  
      return summary;
    } catch (error) {
      console.error('Error getting workout summary:', error);
      return { totalWorkouts: 0, workouts: [] };
    }
  };

const CHAT_LOG_KEY = 'chatLogs';

// Save the provided chat log (an array of messages) to AsyncStorage
export const saveChatLog = async (log) => {
  try {
    // Append the new conversation to any existing logs
    const existingLogsJson = await AsyncStorage.getItem(CHAT_LOG_KEY);
    const existingLogs = existingLogsJson ? JSON.parse(existingLogsJson) : [];
    existingLogs.unshift(log);
    await AsyncStorage.setItem(CHAT_LOG_KEY, JSON.stringify(existingLogs));
    Alert.alert('Success', 'Conversation saved.');
  } catch (error) {
    console.error('Error saving conversation:', error);
    Alert.alert('Error', 'Failed to save conversation.');
  }
};

// Retrieve saved chat logs from AsyncStorage
export const getChatLogs = async () => {
  try {
    const logsJson = await AsyncStorage.getItem(CHAT_LOG_KEY);
    return logsJson ? JSON.parse(logsJson) : [];
  } catch (error) {
    console.error('Error retrieving conversation logs:', error);
    return [];
  }
};

export const deleteChatLog = async (index) => {
    try {
      const logs = await getChatLogs();
      const updatedLogs = logs.filter((_, i) => i !== index);
      await AsyncStorage.setItem(CHAT_LOG_KEY, JSON.stringify(updatedLogs));
      return updatedLogs;
    } catch (e) {
      console.error('Error deleting chat log:', e);
      return null;
    }
  };