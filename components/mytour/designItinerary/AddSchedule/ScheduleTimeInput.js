// ScheduleTimeInput.js 파일
import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    StyleSheet,
    ActionSheetIOS, // iOS 전용 ActionSheet (옵션)
    Dimensions // 화면 크기 확인용 (디버깅 목적)
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window'); // 화면 크기 가져오기

const ScheduleTimeInput = ({ startTime, setStartTime, endTime, setEndTime }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('start'); // 'start' 또는 'end'

    // DateTimePicker에 넘겨줄 Date 객체로 변환
    const parseTimeToDate = useCallback((timeString) => {
        // 기본 시작 시간 7시 00분
        const defaultDate = new Date();
        defaultDate.setHours(7, 0, 0, 0);

        if (!timeString) return defaultDate;

        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);

        // 시간을 7시 ~ 24시 범위로 강제 조정 (초기값 설정 시)
        if (date.getHours() < 7) {
            date.setHours(7, 0, 0, 0);
        } else if (date.getHours() > 24) { // 24시 초과 시 (예: 25시 입력 시)
            date.setHours(24, 0, 0, 0);
        }

        return date;
    }, []);

    // 피커에서 시간 변경 시 호출될 함수
    const onTimeChange = useCallback((event, selectedDate) => {
        // Android에서는 'set' 액션이 아니면 모달을 닫지 않음 (취소 버튼 등)
        if (Platform.OS === 'android' && event.type === 'dismissed') {
            setShowPicker(false);
            return;
        }

        setShowPicker(false); // 피커 닫기

        if (selectedDate) {
            // 시간 범위 7시 ~ 24시 및 분 단위 00분/30분 조정 로직
            let finalHour = selectedDate.getHours();
            let finalMinute = selectedDate.getMinutes();

            // 분을 00분 또는 30분으로 강제 조정
            if (finalMinute < 15) {
                finalMinute = 0;
            } else if (finalMinute < 45) {
                finalMinute = 30;
            } else {
                finalMinute = 0;
                finalHour += 1; // 45분 이상이면 다음 시간으로 넘어가서 0분으로
            }

            // 시간 범위 7시 ~ 24시 조정
            if (finalHour < 7) {
                finalHour = 7;
                finalMinute = 0;
            } else if (finalHour > 24) {
                finalHour = 24;
                finalMinute = 0;
            }

            const formattedTime = `${String(finalHour).padStart(2, '0')}:${String(finalMinute).padStart(2, '0')}`;

            if (pickerMode === 'start') {
                setStartTime(formattedTime);
            } else {
                setEndTime(formattedTime);
            }
            console.log(`[ScheduleTimeInput] Time selected (${pickerMode}): ${formattedTime}`);
        }
    }, [pickerMode, setStartTime, setEndTime]);

    // iOS에서 display='spinner' 대신 'datetime' (날짜도 함께) 또는 'compact' (팝업) 모드를 시도해볼 수 있습니다.
    // 'compact'는 iOS 14+에서 팝업 형태로 나타납니다.
    const showDateTimePicker = useCallback(() => {
        if (Platform.OS === 'ios') {
            // iOS에서는 ActionSheet를 사용하여 사용자에게 'spinner' 또는 'compact' 옵션을 제공할 수도 있습니다.
            // 여기서는 기본적으로 'compact'를 시도합니다.
            setShowPicker(true);
        } else { // Android
            setShowPicker(true);
        }
    }, []);

    const handleStartTimePress = useCallback(() => {
        setPickerMode('start');
        showDateTimePicker();
        console.log("[ScheduleTimeInput] Opening Start Time Picker");
    }, [showDateTimePicker]);

    const handleEndTimePress = useCallback(() => {
        setPickerMode('end');
        showDateTimePicker();
        console.log("[ScheduleTimeInput] Opening End Time Picker");
    }, [showDateTimePicker]);

    const initialDate = useMemo(() => {
        if (pickerMode === 'start') {
            return parseTimeToDate(startTime);
        } else {
            return parseTimeToDate(endTime);
        }
    }, [pickerMode, startTime, endTime, parseTimeToDate]);


    // DateTimePicker의 최소/최대 시간 설정
    // Date 객체이므로 날짜는 오늘로 가정하고 시간만 설정합니다.
    const minTime = useMemo(() => {
        const date = new Date();
        date.setHours(7, 0, 0, 0); // 7시 00분
        return date;
    }, []);

    const maxTime = useMemo(() => {
        const date = new Date();
        date.setHours(24, 0, 0, 0); // 24시 00분 (다음 날 00시와 동일하게 처리될 수 있음)
        return date;
    }, []);


    return (
        <View style={commonStyles.section}>
            <View style={commonStyles.inputRow}>
                <View style={commonStyles.iconContainer}>
                    <Feather name="clock" size={16} color="#666" />
                </View>
                <View style={commonStyles.timeInputRow}>
                    <TouchableOpacity
                        style={commonStyles.timeInputContainer}
                        onPress={handleStartTimePress}
                    >
                        <Text style={commonStyles.timeInputText}>
                            {startTime || "시작시간"}
                        </Text>
                        <Feather name="chevron-down" size={14} color="#666" />
                    </TouchableOpacity>

                    <Text style={commonStyles.timeSeparator}>—</Text>

                    <TouchableOpacity
                        style={commonStyles.timeInputContainer}
                        onPress={handleEndTimePress}
                    >
                        <Text style={commonStyles.timeInputText}>
                            {endTime || "종료시간"}
                        </Text>
                        <Feather name="chevron-down" size={14} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* DateTimePicker 조건부 렌더링 */}
            {showPicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={initialDate}
                    mode="time"
                    // iOS의 경우, 'spinner' 대신 'compact'를 시도해봅니다.
                    // 'compact'는 iOS 14+에서 팝업 형태로 나타나며, 일반 모달과 겹침 문제에 덜 민감할 수 있습니다.
                    // Android는 'default'가 일반적으로 적합합니다.
                    display={Platform.OS === 'ios' ? 'compact' : 'default'}
                    onChange={onTimeChange}
                    // minuteInterval={30} // iOS 14+, Android에서 분 간격을 30분으로 설정.
                                         // 이 속성을 사용하면 UI상으로 00, 30분만 선택 가능하지만,
                                         // 사용자가 스크롤을 빠르게 할 경우 중간 값이 선택될 수 있어
                                         // onTimeChange에서 강제 조정하는 로직을 유지하는 것이 더 안전합니다.
                    minimumDate={minTime} // 7시로 제한
                    maximumDate={maxTime} // 24시로 제한 (다음 날 00시로 넘어가기 전)
                />
            )}
        </View>
    );
};

// --- 스타일 시트 (이전과 동일하게 유지) ---
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