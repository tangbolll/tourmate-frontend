import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Conditions = ({ gender, ageRange }) => {
    return (
        <View style={styles.container}>
        {/* 제목 */}
        <Text style={styles.title}>동행 조건</Text>

        {/* 성별 조건 */}
        <View style={styles.row}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.chipContainer}>
            <View style={styles.chip}>
                <Text style={styles.chipText}>{gender}</Text>
            </View>
            </View>
        </View>

        {/* 연령 조건 */}
        <View style={styles.row}>
            <Text style={styles.label}>연령</Text>
            <View style={styles.chipContainer}>
            {ageRange.map((age, index) => (
                <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{age}</Text>
                </View>
            ))}
            </View>
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 25,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 6,
        marginLeft: 16,
        marginRight: 0,
        width: 40,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        paddingLeft: 0,
    },
    chip: {
        height: 28,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    chipText: {
        fontSize: 14,
        color: '#333',
    },
});

export default Conditions;
