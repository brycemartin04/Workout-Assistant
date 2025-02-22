import React from 'react'
import { StyleSheet, TouchableOpacity, View} from 'react-native'
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import {MaterialIcons} from '@expo/vector-icons'

export default function Workout({ item, pressHandler}) {
    return (
        <TouchableOpacity onPress={() => pressHandler(item)} style={styles.button}>
            <ThemedView style={styles.item}>
                <ThemedText style={styles.txt}>{item.name}</ThemedText>
                <ThemedText style={styles.txt}>{item.date}</ThemedText>
                <ThemedText style={styles.txt}>{item.time}</ThemedText>
            </ThemedView>
        </TouchableOpacity>
           
    )
}

const styles = StyleSheet.create({
    button: {
        width: '80%',
        alignSelf: 'center',
    },
    item: {
        flexDirection: 'column',
        padding: 16,
        marginTop: 16,
        borderColor: '#bbb',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 10,
        width: '100%',
        
    },
    txt: {
        marginLeft: 10,
    }
})
 
