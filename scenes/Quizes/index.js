import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';

import Fundo from '../../assets/FundoTelaUser.png';
import QuizzesDao from '../../db/QuizzesDao'

export default function Quizzes() {
    const navigation = useNavigation()

    const [refreshing, setRefreshing] = useState(false)
    const [listQuizzes, setListQuizzes] = useState([])
    const [modalError, setModalError] = useState(false)

    const Item = ({ item }) => {
        return (
            <TouchableOpacity style={{ padding: 20, backgroundColor: '#DDDDDD33', borderRadius: 10 }}>
                <Text>{item.nome || '---'}</Text>
                <Text>{item.descricao || '---'}</Text>
            </TouchableOpacity>
        )
    }

    const renderItem = ({ item }) => (
        <Item item={item} />
    )

    useEffect(() => {
        let inseriu = 'false'
        const inserir = async () => {
            inseriu = await AsyncStorage.getItem('@insertQuizz')
        }
        inserir()

        if (!inseriu || inseriu != 'true') {
            const get = async () => {
                await AsyncStorage.setItem('@insertQuizz', 'true')
            }
            get()

            const insertQuizzes = async () => {
                await QuizzesDao.Insert({
                    id: 0,
                    numQuizz: 1,
                    nome: "Quizz Cidades",
                    descricao: "Neste quizz você precisa descobrir quais são as cidades pertencentes ao estado escolhido."
                })
                    .catch((e) => alert(e))
            }
            insertQuizzes()
        }

        const getQuizzes = async () => {
            await QuizzesDao.GetQuizzes()
                .then((e) => setListQuizzes(e))
                .catch((e) => alert(e))
        }
        getQuizzes()
    }, [])

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground source={Fundo} style={{ flex: 1, padding: 10 }}>
                <Text style={styles.titleTest}>QUIZZES</Text>
                <FlatList
                    refreshing={refreshing}
                    data={listQuizzes}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => `${index}`}
                    ListEmptyComponent={() => <Text style={{ color: 'white' }}>{'Não há Quizzes para exibir'}</Text>}
                    ListFooterComponent={() => refreshing && (
                        <View>
                            <Text style={{ color: 'white' }}>Carregando Quizzes...</Text>
                        </View>
                    )}
                />
            </ImageBackground>
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
        marginTop: 30,
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white',
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
        color: 'white',
        backgroundColor: '#2196f3',
        padding: 10,
        width: '100%',
        alignItems: 'center'
    }
})