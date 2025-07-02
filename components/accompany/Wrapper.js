import React from 'react';
import { View, StyleSheet } from 'react-native';

function Wrapper({ children }) {
    return (
        <View style={styles.container}>
        {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        paddingLeft: 12,
        borderRadius: 8,
        backgroundColor: 'white',
    },
});


export default Wrapper;