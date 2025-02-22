import React from 'react';
import { Calendar } from 'react-native-calendars';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';


 const WorkoutCalendar = ({ workoutData }) => {
    const colorScheme = useColorScheme();

    const calendarTheme = {
        backgroundColor: 'orange',
        calendarBackground: Colors[colorScheme].background,
        textSectionTitleColor: 'red',
        dayTextColor: 'blue',
        selectedDayTextColor: 'green',
        selectedDayBackgroundColor: 'yellow',
        todayTextColor: 'pink',
        textDisabledColor: 'green'
        // Add more styling properties as needed
      };

//   const getColorForIntensity = (intensity) => {
//     if (intensity === 0) return '#eeeeee';
//     if (intensity < 2) return '#c6e48b';
//     if (intensity < 4) return '#7bc96f';
//     if (intensity < 6) return '#239a3b';
//     return '#196127';
//   };

//   const markedDates = Object.keys(workoutData).reduce((acc, date) => {
//     const intensity = workoutData[date];
//     acc[date] = {
//       customStyles: {
//         container: {
//           backgroundColor: getColorForIntensity(1),
//           borderRadius: 4,
//         },
//         text: {
//           color: intensity === 0 ? 'black' : 'white',
//         },
//       },
//     };
//     return acc;
//   }, {});

  return (
    <Calendar
      markingType="custom"

      onDayPress={(day) => {
        console.log('Workout details for:', day.dateString);
        // Optionally navigate to a detailed view
      }}
    />
  );
};

export default WorkoutCalendar;
