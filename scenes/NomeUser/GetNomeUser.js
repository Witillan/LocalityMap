import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import UserDao from '../../db/User';

export default function GetNomeUser() {
    const navigation = useNavigation()

    const [nomeUser, setNomeUser] = useState('');

    useEffect(useCallback(() => {
        const get = async () => {
            const user = await UserDao.GetUser()
            console.log(user)
        }
        get()
    }, []))

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.titleTest}>Sign in</Text>
                <View style={styles.marginView}>
                    <View>
                        <TextInput
                            style={styles.input}
                            onChangeText={setNomeUser}
                            value={nomeUser}
                            placeholder="Seu apelido"
                            keyboardType="default"
                        />
                    </View>
                </View>
                <View style={{ marginTop: 20, width: '100%' }}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("Contatos")}
                    >
                        <Text style={{ color: 'white' }}>ENTRAR</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    titleTest: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: 'bold'
    },
    input: {
        backgroundColor: 'transparent',
        color: 'black',
        height: 35,
        paddingHorizontal: 20,
        borderColor: 10,
        borderWidth: 0.7,
        borderRadius: 50
    },
    marginView: {
        paddingHorizontal: 10,
        marginVertical: 20
    },
    viewButton: {
        marginTop: 10
    },
    button: {
        borderRadius: 20,
        backgroundColor: '#2B44FF',
        borderColor: '#1820C0',
        '&:focus': {
            borderColor: '#1820C0'
        },
        color: 'white',
        padding: 10,
        width: '100%',
        alignItems: 'center'
    }
})