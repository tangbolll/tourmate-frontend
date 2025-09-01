import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';

const CUSTOM_LOCALE = {
    months: [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월',
    ],
    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
};

export default function CalendarPopup({ visible, onClose = () => {}, onSelectDates = () => {} }) {
    const [range, setRange] = useState({ startDate: null, endDate: null });
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const [displayedMonthYear, setDisplayedMonthYear] = useState('');

    useEffect(() => {
        setDisplayedMonthYear(`${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`);
    }, [currentMonth.getFullYear(), currentMonth.getMonth()]);

    useEffect(() => {
        if (visible) {
            setCurrentMonth(new Date()); // 모달이 열릴 때: 현재 날짜로 초기화
            setRange({ startDate: null, endDate: null }); // 모달이 열릴 때: 선택 초기화
        }
    }, [visible]);

    const applyFilters = () => {
        if (range.startDate && range.endDate) {
            try {
                onSelectDates(range);
            } catch (error) {
                console.error('Error in onSelectDates:', error);
            }
            closeModal();
        }
    };

    const closeModal = () => {
        try {
            setTimeout(() => { onClose(); }, 100); // 콜백 실행 전 약간의 지연
        } catch (error) {
            console.error('Error in closeModal:', error);
        }
    };

    const resetSelection = () => {
        setRange({ startDate: null, endDate: null });
    };

    const handleDateChange = (date) => {
        if (!range.startDate || (range.startDate && range.endDate)) {
            // 시작 날짜가 없거나, 범위가 이미 완성된 경우 새로운 시작 날짜 설정
            setRange({ startDate: date, endDate: null });
        } else {
            // 시작 날짜만 있는 경우, 끝 날짜 설정 (순서 보장)
            const newEnd = date < range.startDate ? range.startDate : date;
            const newStart = date < range.startDate ? date : range.startDate;
            setRange({ startDate: newStart, endDate: newEnd });
        }
    };

    const goToPrevMonth = () => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
            return newMonth;
        });
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
            return newMonth;
        });
    };

    const displayYear = currentMonth.getFullYear();
    const displayMonth = currentMonth.getMonth() + 1;

    return (
        <Modal 
            animationType="slide" 
            transparent 
            visible={visible} 
            onRequestClose={closeModal}
            statusBarTranslucent
            presentationStyle="overFullScreen" 
        >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                {/* Header */}
                <View style={styles.header}>
                <TouchableOpacity 
                    onPress={resetSelection}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <View style={styles.row}>
                    <Icon name="reload" size={15} color="gray" />
                    <Text style={styles.resetText}> 재설정</Text>
                    </View>
                </TouchableOpacity>
                <Text style={styles.title}>날짜 선택</Text>
                <TouchableOpacity 
                    onPress={closeModal}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Icon name="close" size={22} color="black" />
                </TouchableOpacity>
                </View>

                {/* Navigation Buttons */}
                <View key={currentMonth.toISOString()} style={styles.monthNav}>
                    <TouchableOpacity 
                        onPress={goToPrevMonth}
                        style={styles.arrowButton}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                    <Text style={styles.arrow}>{'<'}</Text>
                    </TouchableOpacity>

                    <Text key={displayedMonthYear} style={styles.monthTitle}>
                        {displayedMonthYear}
                    </Text>

                    <TouchableOpacity 
                        onPress={goToNextMonth}
                        style={styles.arrowButton}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                    <Text style={styles.arrow}>{'>'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Calendar */}
                <CalendarPicker
                    key={currentMonth.toString()}
                    month={currentMonth.getMonth()}
                    year={currentMonth.getFullYear()}
                    customDatesStyles={null}
                    monthYearHeaderWrapperStyle={{ display: 'none' }}
                    allowRangeSelection
                    minDate={new Date()}
                    disabledBeforeToday={true} 
                    disabledDatesTextStyle={{ color: '#ccc' }}
                    selectedStartDate={range.startDate}
                    selectedEndDate={range.endDate}
                    onDateChange={handleDateChange}
                    previousTitle=""
                    nextTitle=""
                    todayBackgroundColor="#228be6"
                    todayTextStyle={{ color: '#fff' }}
                    selectedDayBackgroundColor="black"
                    selectedDayColor="black"
                    selectedDayTextColor="#fff"
                    textStyle={{ color: '#000' }}
                    weekdays={CUSTOM_LOCALE.weekdays}
                    months={CUSTOM_LOCALE.months}
                    initialDate={currentMonth}
                    width={Platform.OS === 'ios' ? 360 : 340}
                    // 💡 여기에 CalendarPicker와 monthNav 사이의 간격을 좁히기 위해 marginTop 추가
                    containerStyle={styles.calendarContainer} 
                />

                {/* Apply Button */}
                <TouchableOpacity 
                style={[
                    styles.applyButton, 
                    (!range.startDate || !range.endDate) && styles.disabledButton
                ]} 
                onPress={applyFilters}
                disabled={!range.startDate || !range.endDate}
                activeOpacity={0.7}
                >
                <Text style={styles.applyButtonText}>적용하기</Text>
                </TouchableOpacity>
            </View>
            </View>
        </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 25,
        maxHeight: '90%',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        paddingHorizontal: 5,
    },
    resetText: {
        color: '#999',
        fontSize: 14,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: -10,
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    arrowButton: {
        paddingHorizontal: 15,
    },
    arrow: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    calendarContainer: {
        marginTop: -20,
    },
    applyButton: {
        backgroundColor: 'black',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#cccccc',
    },
});