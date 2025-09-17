import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ScheduleLocationInput = React.memo(({ location, setLocation, onChangeText }) => {
    console.log('ScheduleLocationInput props:', { location, hasOnChangeText: !!onChangeText });

    return (
        <View style={commonStyles.section}>
            <View style={commonStyles.inputRow}>
                <View style={commonStyles.iconContainer}>
                    <Feather name="map-pin" size={16} color="#666" />
                </View>
                <TextInput
                    style={commonStyles.input}
                    value={location}
                    onChangeText={(text) => {
                        console.log('TextInput onChange:', text);
                        // onChangeText가 있으면 검색 실행, 없으면 setLocation만 실행
                        if (onChangeText) {
                            onChangeText(text); // 이게 handleLocationSearch 호출
                        } else if (setLocation) {
                            setLocation(text);
                        }
                    }}
                    placeholder="위치 추가 *"
                    placeholderTextColor="#CCCCCC"
                />
            </View>
        </View>
    );
});

const commonStyles = StyleSheet.create({
    section: {
        marginBottom: 16,
        position: 'relative',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
        marginRight: 12,
        marginTop: 12,
    },
    input: {
        flex: 1,
        fontSize: 14,
        height: 40,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
});

export default ScheduleLocationInput;