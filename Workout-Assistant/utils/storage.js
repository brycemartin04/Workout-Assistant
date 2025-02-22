import AsyncStorage from '@react-native-async-storage/async-storage';

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
