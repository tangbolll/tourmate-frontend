import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const CUSTOM_LOCALE = {
    months: [
        '1월', '2월', '3월', '4월', '5월', '6월',
        '7월', '8월', '9월', '10월', '11월', '12월',
    ],
    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
};

export default function CalendarPopup({ visible, onClose = () => {}, onSelectDates = () => {} }) {
    const [selectedDates, setSelectedDates] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [displayedMonthYear, setDisplayedMonthYear] = useState('');
    const [selectionMode, setSelectionMode] = useState('single'); // 'single' or 'range'

    useEffect(() => {
        setDisplayedMonthYear(`${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`);
    }, [currentMonth.getFullYear(), currentMonth.getMonth()]);

    useEffect(() => {
        if (visible) {
            setCurrentMonth(new Date());
            setSelectedDates([]);
            setSelectionMode('single'); // 기본값을 단일 선택으로
        }
    }, [visible]);

    const applyFilters = () => {
        if (selectedDates.length === 0) {
            onSelectDates({ startDate: null, endDate: null, mode: selectionMode });
        } else if (selectionMode === 'single' || selectedDates.length === 1) {
            onSelectDates({ 
                startDate: selectedDates[0], 
                endDate: selectedDates[0], 
                mode: selectionMode 
            });
        } else {
            const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
            onSelectDates({ 
                startDate: sortedDates[0], 
                endDate: sortedDates[1], 
                mode: selectionMode 
            });
        }
        closeModal();
    };

    const closeModal = () => {
        try {
            setTimeout(() => { onClose(); }, 100);
        } catch (error) {
            console.error('Error in closeModal:', error);
        }
    };

    const resetSelection = () => {
        setSelectedDates([]);
    };

    const handleModeChange = (mode) => {
        setSelectionMode(mode);
        setSelectedDates([]); // 모드 변경 시 선택 초기화
    };

    const handleDateChange = (date) => {
        if (!date) return;

        const dateTime = date.getTime();

        if (selectionMode === 'single') {
            // 단일 모드: 하나만 선택
            setSelectedDates([date]);
        } else {
            // 범위 모드: 기존 로직 유지
            const alreadySelected = selectedDates.find(d => d.getTime() === dateTime);

            if (alreadySelected) {
                setSelectedDates(prev => prev.filter(d => d.getTime() !== dateTime));
            } else {
                if (selectedDates.length >= 2) {
                    setSelectedDates([date]);
                } else {
                    setSelectedDates(prev => [...prev, date]);
                }
            }
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

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const displayStartDate = sortedDates[0] || null;
    const displayEndDate = sortedDates.length === 2 ? sortedDates[1] :
                          (sortedDates.length === 1 ? sortedDates[0] : null);

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

                {/* Mode Selection */}
                <View style={styles.modeSelector}>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            selectionMode === 'single' && styles.activeModeButton
                        ]}
                        onPress={() => handleModeChange('single')}
                    >
                        <Text style={[
                            styles.modeButtonText,
                            selectionMode === 'single' && styles.activeModeButtonText
                        ]}>단일 선택</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            selectionMode === 'range' && styles.activeModeButton
                        ]}
                        onPress={() => handleModeChange('range')}
                    >
                        <Text style={[
                            styles.modeButtonText,
                            selectionMode === 'range' && styles.activeModeButtonText
                        ]}>범위 선택</Text>
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
                    key={`${currentMonth.toString()}-${selectionMode}`}
                    onMonthChange={(date) => setCurrentMonth(date)}
                    customDatesStyles={null}
                    monthYearHeaderWrapperStyle={{ display: 'none' }}
                    allowRangeSelection={selectionMode === 'range'}
                    minDate={new Date()}
                    disabledBeforeToday={true}
                    disabledDatesTextStyle={{ color: '#ccc' }}
                    selectedStartDate={displayStartDate}
                    selectedEndDate={selectionMode === 'range' ? displayEndDate : displayStartDate}
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
                    containerStyle={styles.calendarContainer}
                />

                {/* Apply Button */}
                <TouchableOpacity
                    style={[
                        styles.applyButton,
                        selectedDates.length === 0 && styles.disabledButton
                    ]}
                    onPress={applyFilters}
                    disabled={selectedDates.length === 0}
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
        marginBottom: 20,
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
    modeSelector: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 4,
        marginBottom: 20,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 6,
        alignItems: 'center',
    },
    activeModeButton: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    modeButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    activeModeButtonText: {
        color: '#000',
        fontWeight: '600',
    },
    monthNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 10,
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
        marginTop: 10,
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
    selectionInfo: {
        alignItems: 'center',
        marginBottom: 10,
    },
    selectionText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    }
});