import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Feathe, MaterialCommunityIcons } from '@expo/vector-icons';

import Button from '../Buttons/Button';

export default function ({ visible, onClose, message }) {

    return (
        <View>
            <Modal
                animationType="none"
                transparent={true}
                visible={visible}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <MaterialCommunityIcons name="hand-clap" size={30} color="green" />
                        <View style={styles.message}>
                            <Text style={styles.message}>{message}</Text>
                        </View>
                        <Button
                            onPress={onClose}
                            color='#2B44FF'
                            colorLabel='#FFFFFF'
                            label='Voltar'
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