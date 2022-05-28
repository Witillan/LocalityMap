import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const NavBarQuizzes = () => {
    const navigation = useNavigation()

    const toggleDrawer = () => {
        return navigation.goBack()
    }

    return (
        <View style={styles.nav}>
            <View style={styles.navDivider}>
                <TouchableOpacity onPress={toggleDrawer}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    nav: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Constants.statusBarHeight,
        justifyContent: 'space-between'
    },
    navDivider: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    text: {
        fontSize: 20,
        paddingLeft: 15,
        paddingTop: 7,
        paddingBottom: 7.34
    },
    button: {
        marginHorizontal: 10
    }
})

export default NavBarQuizzes
