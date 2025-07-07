import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

const DayPicker = ({
    visible,
    onClose,
    onDateSelect,
    selectedStartDate,
    selectedEndDate,
    selectingDateType, // 'start' or 'end'
    title,
}) => {
    const [currentMonth, setCurrentMonth] = useState(() => {
        // 선택된 날짜가 있으면 해당 날짜 기준으로, 없으면 현재 날짜 기준으로
        const targetDate = selectingDateType === 'start' 
            ? (selectedStartDate || new Date()) 
            : (selectedEndDate || selectedStartDate || new Date());
        return new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    });

    // visible이 변경될 때마다 currentMonth를 업데이트
    useEffect(() => {
        if (visible) {
            const targetDate = selectingDateType === 'start' 
                ? (selectedStartDate || new Date()) 
                : (selectedEndDate || selectedStartDate || new Date());
            setCurrentMonth(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
        }
    }, [visible, selectingDateType, selectedStartDate, selectedEndDate]);

    const formatDateToString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const days = [];
        
        // 이전 달의 빈 날짜들
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }
        
        // 현재 달의 날짜들
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        
        return days;
    };

    const navigateMonth = (direction) => {
        const newMonth = new Date(currentMonth);
        newMonth.setMonth(newMonth.getMonth() + direction);
        setCurrentMonth(newMonth);
    };

    // Add the missing isDisabled function
    const isDisabled = (day) => {
        if (!day) return true;
        
        // If selecting end date, disable dates before start date
        if (selectingDateType === 'end' && selectedStartDate) {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            return date < selectedStartDate;
        }
        
        return false;
    };

    const isSelectedDate = (day) => {
        if (!day || !selectedStartDate || !selectedEndDate) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateString = formatDateToString(date);
        const startString = formatDateToString(selectedStartDate);
        const endString = formatDateToString(selectedEndDate);
        
        return dateString === startString || dateString === endString;
    };

    const isStartDate = (day) => {
        if (!day || !selectedStartDate) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateString = formatDateToString(date);
        const startString = formatDateToString(selectedStartDate);
        return dateString === startString;
    };

    const isEndDate = (day) => {
        if (!day || !selectedEndDate) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateString = formatDateToString(date);
        const endString = formatDateToString(selectedEndDate);
        return dateString === endString;
    };

    const isInRange = (day) => {
        if (!day || !selectedStartDate || !selectedEndDate) return false;
        
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateTime = date.getTime();
        const startTime = selectedStartDate.getTime();
        const endTime = selectedEndDate.getTime();
        
        // 시작일과 끝일이 같은 경우 범위 없음
        if (startTime === endTime) return false;
        
        // 시작일과 끝일 사이에 있는 날짜인지 확인
        const minTime = Math.min(startTime, endTime);
        const maxTime = Math.max(startTime, endTime);
        
        return dateTime > minTime && dateTime < maxTime;
    };

    const isToday = (day) => {
        if (!day) return false;
        const today = new Date();
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return formatDateToString(date) === formatDateToString(today);
    };

    const handleDateSelect = (day) => {
        if (!day || isDisabled(day)) return;
        
        // 부모 컴포넌트에서 기대하는 형식으로 날짜 전달
        // CreatePostDirectoryPopup에서는 day(숫자)를 받아서 Date 객체를 생성함
        onDateSelect(day);
    };

    const getDayStyle = (day, index) => {
        if (!day) return [styles.dayCell];
        
        const selected = isSelectedDate(day);
        const start = isStartDate(day);
        const end = isEndDate(day);
        const inRange = isInRange(day);
        const today = isToday(day);
        const disabled = isDisabled(day);

        const dayStyles = [styles.dayCell];

        if (disabled) {
            dayStyles.push(styles.disabledDay);
        } else if (selected) {
            if (start && end) {
                // 시작일과 종료일이 같은 경우
                dayStyles.push(styles.selectedDay);
            } else if (start) {
                dayStyles.push(styles.startDay);
            } else if (end) {
                dayStyles.push(styles.endDay);
            } else {
                dayStyles.push(styles.selectedDay);
            }
        } else if (inRange) {
            dayStyles.push(styles.rangeDay);
        } else if (today) {
            dayStyles.push(styles.todayDay);
        }

        return dayStyles;
    };

    const getDayTextStyle = (day, index) => {
        if (!day) return [styles.dayText];
        
        const selected = isSelectedDate(day);
        const inRange = isInRange(day);
        const today = isToday(day);
        const disabled = isDisabled(day);
        const isSunday = index % 7 === 0;

        const textStyles = [styles.dayText];

        if (disabled) {
            textStyles.push(styles.disabledText);
        } else if (selected) {
            textStyles.push(styles.selectedDayText);
        } else if (inRange) {
            textStyles.push(styles.rangeDayText);
        } else if (today) {
            textStyles.push(styles.todayText);
        } else if (isSunday) {
            textStyles.push(styles.sundayText);
        }

        return textStyles;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.calendarOverlay}>
                <View style={styles.calendarContainer}>
                    <View style={styles.calendarHeader}>
                        <Text style={styles.calendarTitle}>{title}</Text>
                        <TouchableOpacity 
                            onPress={onClose}
                            style={styles.calendarCloseButton}
                        >
                            <FontAwesome6 name="xmark" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* 월 네비게이션 */}
                    <View style={styles.monthNavigation}>
                        <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
                            <FontAwesome6 name="chevron-left" size={20} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.monthText}>
                            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                        </Text>
                        <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
                            <FontAwesome6 name="chevron-right" size={20} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* 요일 헤더 */}
                    <View style={styles.weekHeader}>
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                            <View key={index} style={styles.weekDayContainer}>
                                <Text style={[styles.weekDay, index === 0 && styles.sunday]}>
                                    {day}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* 달력 그리드 */}
                    <View style={styles.calendarGrid}>
                        {generateCalendarDays().map((day, index) => {
                            const isEmpty = day === null;
                            
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={getDayStyle(day, index)}
                                    onPress={() => handleDateSelect(day)}
                                    disabled={isEmpty || isDisabled(day)}
                                    activeOpacity={isEmpty || isDisabled(day) ? 1 : 0.7}
                                >
                                    {!isEmpty && (
                                        <Text style={getDayTextStyle(day, index)}>
                                            {day}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    calendarOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 350,
        height: '50%'
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    calendarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    calendarCloseButton: {
        padding: 5,
    },
    monthNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    navButton: {
        padding: 10,
        borderRadius: 20,
    },
    monthText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    weekHeader: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    weekDayContainer: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    weekDay: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    sunday: {
        color: '#FF6B6B',
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28571%', // 7분의 1
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        marginVertical: 2,
    },
    selectedDay: {
        backgroundColor: '#666',
    },
    startDay: {
        backgroundColor: '#666',
        borderRadius: 20,
    },
    endDay: {
        backgroundColor: '#666',
        borderRadius: 20,
    },
    rangeDay: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 0,
    },
    todayDay: {
        borderWidth: 2,
        borderColor: '#666',
    },
    dayText: {
        fontSize: 16,
        color: '#333',
    },
    selectedDayText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    rangeDayText: {
        color: '#333',
        fontWeight: '600',
    },
    todayText: {
        color: '#000',
        fontWeight: 'bold',
    },
    sundayText: {
        color: '#FF6B6B',
    },
    disabledDay: {
        backgroundColor: 'transparent',
    },
    disabledText: {
        color: '#ccc',
    },
});

export default DayPicker;