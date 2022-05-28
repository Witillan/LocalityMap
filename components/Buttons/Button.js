import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function ({ onPress, label, color, colorLabel }) {

    return (
        <TouchableOpacity
            style={[styles.button, { color: colorLabel, backgroundColor: color, borderColor: colorLabel }]}
            onPress={onPress}
        >
            <Text style={{ color: 'white' }}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 20,
        padding: 10,
        width: 200,
        alignItems: 'center'
    }
})