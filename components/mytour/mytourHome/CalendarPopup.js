import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';

const CUSTOM_LOCALE = {
    months: [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월',
    ],
    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
};

export default function CalendarPopup({ visible, onClose = () => {}, onSelectDates = () => {}, initialPeriod }) {
    const [range, setRange] = useState({ startDate: null, endDate: null });
    const [currentMonth, setCurrentMonth] = useState(dayjs());


    useEffect(() => {
        if (visible) {
            // 팝업이 열릴 때, 부모로부터 받은 initialPeriod 값이 없으면(초기화되었으면)
            // 내부 range 상태도 깨끗하게 비워줍니다.
            if (!initialPeriod) {
                setRange({ startDate: null, endDate: null });
            }
            setCurrentMonth(dayjs());
        }
    }, [visible, initialPeriod]); 

    const applyFilters = () => {
        if (range.startDate && range.endDate) {
            try {
                onSelectDates(range);
            } catch (error) {
            }
            closeModal();
        }
    };

    const closeModal = () => {
        try {
            setTimeout(() => { onClose(); }, 100); // 콜백 실행 전 약간의 지연
        } catch (error) {
        }
    };

    const resetSelection = () => {
        // 내부 상태를 초기화합니다.
        setRange({ startDate: null, endDate: null });

        onSelectDates({ startDate: null, endDate: null });
        
        closeModal();
    };


    const handleDateChange = (date) => {
        if (!range.startDate || (range.startDate && range.endDate)) {
            // 시작 날짜가 없거나, 범위가 이미 완성된 경우 새로운 시작 날짜 설정
            setRange({ startDate: date, endDate: null });
        } else {
            // 시작 날짜만 있는 경우, 끝 날짜 설정 (순서 보장)
            const newEnd = dayjs(date).isBefore(range.startDate) ? range.startDate : date;
            const newStart = dayjs(date).isBefore(range.startDate) ? date : range.startDate;
            setRange({ startDate: newStart, endDate: newEnd });
        }
    };

    const goToPrevMonth = () => {
        setCurrentMonth(prev => dayjs(prev).subtract(1, 'month'));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prev => dayjs(prev).add(1, 'month'));
    };

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
                    {/* 왼쪽 (재설정 버튼) */}
                    <View style={styles.headerSide}>
                        <TouchableOpacity 
                            onPress={resetSelection}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                            <View style={styles.row}>
                                <Icon name="reload" size={15} color="gray" />
                                <Text style={styles.resetText}> 재설정</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* 중앙 (제목) */}
                    <Text style={styles.title}>날짜 선택</Text>

                    {/* 오른쪽 (닫기 버튼) */}
                    <View style={styles.headerSide}>
                        <TouchableOpacity 
                            onPress={closeModal}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                            <Icon name="close" size={22} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Navigation Buttons */}
                <View style={styles.monthNav}>
                <Text style={styles.monthTitle}>
                    {currentMonth.format('YYYY년 M월')}
                </Text>
                
                <View style={styles.arrowContainer}>
                    <TouchableOpacity 
                        onPress={goToPrevMonth}
                        style={styles.arrowButton}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                    <Text style={styles.arrow}>{'<'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={goToNextMonth}
                        style={styles.arrowButton}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                    <Text style={styles.arrow}>{'>'}</Text>
                    </TouchableOpacity>
                </View>
                </View>

                {/* Calendar */}
                <CalendarPicker
                    customDatesStyles={null}
                    monthYearHeaderWrapperStyle={{ display: 'none' }}
                    allowRangeSelection
                     
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
                    initialDate={currentMonth.toDate()}
                    width={Platform.OS === 'ios' ? 320 : 300}
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
        marginBottom: 15,
        paddingHorizontal: 5,
    },
    // 👇 왼쪽 정렬을 위한 스타일
    headerSideLeft: {
        width: 70,
        justifyContent: 'flex-start', // 왼쪽 정렬
        flexDirection: 'row',
        alignItems: 'center',
    },
    // 👇 오른쪽 정렬을 위한 스타일 (새로 추가)
    headerSideRight: {
        width: 70,
        justifyContent: 'flex-end', // 오른쪽 끝으로 정렬
        alignItems: 'center',
    },
    resetText: {
        color: '#999',
        fontSize: 14,
    },
    title: {
        flex: 1, // 중앙 영역이 남은 공간을 모두 차지하도록 설정
        textAlign: 'center', // 차지한 공간 내에서 텍스트를 중앙 정렬
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    monthTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    arrowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    arrowButton: {
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    arrow: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    applyButton: {
        backgroundColor: 'black',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
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