import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, ActivityIndicator } from 'react-native';

export default function ({ loading, onClose, title, message }) {

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={loading}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.message}>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                    <ActivityIndicator size="large" color="black" />
                </View>
            </View>
        </Modal>
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