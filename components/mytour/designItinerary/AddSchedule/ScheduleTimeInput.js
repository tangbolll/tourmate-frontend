// E:\dev\Tourmate_new\tourmate-frontend\components\mytour\designItinerary\AddSchedule\ScheduleTimeInput.js

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const ScheduleTimeInput = ({ startTime, setStartTime, endTime, setEndTime }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('start'); // 'start' 또는 'end'

    const parseTimeToDate = useCallback((timeString) => {
        const date = new Date();
        if (!timeString) {
            date.setHours(7, 0, 0, 0);
            return date;
        }
        const [hours, minutes] = timeString.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
        return date;
    }, []);

    const onTimeChange = useCallback((event, selectedDate) => {
        setShowPicker(false);
        if (event.type === 'dismissed') {
            return;
        }

        if (selectedDate) {
            let hour = selectedDate.getHours();
            let minute = selectedDate.getMinutes();

            // --- 핵심 수정: 단순하고 명확한 반올림 로직 ---
            if (minute >= 1 && minute <= 29) {
                minute = 30;
            } else if (minute >= 31 && minute <= 59) {
                minute = 0;
                hour += 1;
            }
            // 분이 0 또는 30이면 그대로 유지

            // 시간 범위 조정 (7시 ~ 24시)
            if (hour < 7) {
                hour = 7;
                minute = 0;
            } else if (hour >= 24) {
                // 24시 이상이 될 경우, 안전하게 23:30으로 설정
                hour = 23;
                minute = 30;
            }
            // -----------------------------------------

            const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

            if (pickerMode === 'start') {
                setStartTime(formattedTime);
            } else {
                setEndTime(formattedTime);
            }
        }
    }, [pickerMode, setStartTime, setEndTime]);

    const showDateTimePicker = useCallback((mode) => {
        setPickerMode(mode);
        setShowPicker(true);
    }, []);

    const initialDate = useMemo(() => {
        return pickerMode === 'start' ? parseTimeToDate(startTime) : parseTimeToDate(endTime);
    }, [pickerMode, startTime, endTime, parseTimeToDate]);

    return (
        <View style={commonStyles.section}>
            <View style={commonStyles.inputRow}>
                <View style={commonStyles.iconContainer}>
                    <Feather name="clock" size={16} color="#666" />
                </View>
                <View style={commonStyles.timeInputRow}>
                    <TouchableOpacity
                        style={commonStyles.timeInputContainer}
                        onPress={() => showDateTimePicker('start')}
                    >
                        <Text style={commonStyles.timeInputText}>
                            {startTime || "시작시간"}
                        </Text>
                        <Feather name="chevron-down" size={14} color="#666" />
                    </TouchableOpacity>

                    <Text style={commonStyles.timeSeparator}>—</Text>

                    <TouchableOpacity
                        style={commonStyles.timeInputContainer}
                        onPress={() => showDateTimePicker('end')}
                    >
                        <Text style={commonStyles.timeInputText}>
                            {endTime || "종료시간"}
                        </Text>
                        <Feather name="chevron-down" size={14} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {showPicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={initialDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onTimeChange}
                    minuteInterval={30}
                />
            )}
        </View>
    );
};

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
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timeInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 40,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    timeInputText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        flex: 1,
    },
    timeSeparator: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 16,
    },
});

export default ScheduleTimeInput;
