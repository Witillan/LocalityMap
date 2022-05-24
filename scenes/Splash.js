import * as React from 'react'
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function Splash() {
    const navigation = useNavigation()

    return (
        <SafeAreaView  style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.titleTest}>CONTATOS APP</Text>
                <View style={styles.marginView}>
                    <AntDesign style={styles.icon} name="contacts" size={80} color="black" />
                </View>
                <View style={{ marginTop: 40, width: '100%' }}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={{ color: 'white' }}>Sign in</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20
    },
    titleTest: {
        fontSize: 15,
        fontWeight: 'bold'
    },
    icon: {
        borderWidth: 5,
        borderColor: 'black',
        borderRadius: 100,
        padding: 10,
        textAlign: 'center'
    },
    marginView: {
        marginTop: 20
    },
    button: {
        borderRadius: 20,
        backgroundColor: '#2196f3',
        color: 'white',
        padding: 10,
        width: '100%'
    }
})