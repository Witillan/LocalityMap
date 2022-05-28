import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Fundo from '../../assets/FundoTelaUser.png';
import Logo from '../../assets/MapaCirculoPNG.png';
import Button from '../../components/Buttons/Button';
import ModalValidation from '../../components/Modals/ModalValidation';
import ModalError from '../../components/Modals/ModalError';

export default function GetNomeUser() {
    const navigation = useNavigation()
    const [modalValidation, setModalValidation] = useState(false)
    const [modalError, setModalError] = useState(false)

    const [nomeUser, setNomeUser] = useState('');

    const entrar = async () => {
        if (nomeUser == '' || nomeUser == null || nomeUser == undefined) {
            setModalValidation(true)
            return
        }
        try {
            await AsyncStorage.setItem('@nomeusuario', nomeUser)
            navigation.navigate('Quizzes')
        } catch (error) {
            setModalError(true)
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={Fundo} style={{ flex: 1, backgroundColor: '#59D89E', justifyContent: 'center', alignItems: 'center' }}>
                <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <ImageBackground style={{ padding: 0, width: 100, height: 100, justifyContent: 'center', alignItems: 'center' }} source={Logo}><Text style={{ padding: 0, fontSize: 80, color: 'white' }}>?</Text></ImageBackground>
                        <Text style={styles.titleTest}>LOCALITY MAP</Text>
                    </View>
                    <View style={styles.marginView}>
                        <View>
                            <TextInput
                                focusable={false}
                                style={styles.input}
                                onChangeText={setNomeUser}
                                value={nomeUser}
                                placeholder="Seu apelido"
                                keyboardType="default"
                                placeholderTextColor='white'
                            />
                        </View>
                    </View>
                    <View style={{ marginTop: 50, width: '100%', alignItems: 'center' }}>
                        <Button
                            color='#2B44FF'
                            colorLabel='#FFFFFF'
                            label='ENTRAR'
                            onPress={entrar}
                        />
                    </View>
                    <ModalValidation
                        value={modalValidation}
                        onClose={setModalValidation}
                        title={'Ops..'}
                        message={'Você precisa colocar um nome para continuar'}
                    />
                    <ModalError
                        value={modalError}
                        onClose={setModalError}
                        message={'Ocorreu um erro com seu apelido, por favor feche o jogo e tente novamente mais tarde!'}
                    />
                </ScrollView>
            </ImageBackground>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    titleTest: {
        marginLeft: 10,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    },
    input: {
        backgroundColor: 'transparent',
        color: 'white',
        height: 35,
        paddingHorizontal: 20,
        borderColor: 10,
        borderWidth: 1,
        borderColor: '#5DA2FF',
        borderRadius: 50,
        width: 250
    },
    marginView: {
        paddingHorizontal: 10,
        marginVertical: 20
    },
    viewButton: {
        marginTop: 10
    }
})