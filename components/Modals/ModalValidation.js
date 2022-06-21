import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import Button from '../Buttons/Button';

export default function ({ value, onClose, title, message }) {

    return (
        <View>
            <Modal
                animationType="none"
                transparent={true}
                visible={value}
                onRequestClose={() => {
                    onClose(!value);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>{title}</Text>
                        <View style={styles.message}>
                            <Text style={styles.message}>{message}</Text>
                        </View>
                        <Button
                            onPress={() => onClose(!value)}
                            color='#2B44FF'
                            colorLabel='#FFFFFF'
                            label='Ok'
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    centeredViewModal: {
        justifyContent: "center",
        alignItems: "center"
    },
    message: {
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 10,
        alignItems: "flex-start"
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center"
    }
});