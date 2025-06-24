import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import CalendarPopup from './CalendarPopup';
import dayjs from 'dayjs';

const FilterPopup = ({ visible, onClose = () => {}, onApply, filters, setFilters, onOpenCalendar }) => {
    const { travelPeriod, travelLocation } = filters;
    const [calendarVisible, setCalendarVisible] = useState(false);

    // FilterPopup이 닫힐 때 CalendarPopup도 닫기
    useEffect(() => {
        if (!visible) {
            setCalendarVisible(false);
        }
    }, [visible]);

    const setTravelPeriod = (value) => setFilters({ ...filters, travelPeriod: value });
    const setTravelLocation = (value) => setFilters({ ...filters, travelLocation: value });

    const applyFilters = () => {
        if (onApply) onApply(filters);
        onClose();
    };

    const openCalendar = () => {
        console.log('Opening calendar...'); // 디버깅용
        setCalendarVisible(true);
    };

    const closeCalendar = () => {
        console.log('Closing calendar...'); // 디버깅용
        setCalendarVisible(false);
    };

    const handleCalendarSelect = ({ startDate, endDate }) => {
        console.log('Calendar dates selected:', { startDate, endDate }); // 디버깅용
        if (startDate && endDate) {
            const formatted = `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`;
            setFilters({ ...filters, travelPeriod: formatted });
        }
        closeCalendar();
    };

    const handleClose = () => {
        setCalendarVisible(false);
        onClose();
    };

    return (
        <>
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.centeredView}>
                <View style={styles.modalView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>필터</Text>
                    <TouchableOpacity 
                        onPress={handleClose}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                    <Icon name="close" size={18} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Travel Period */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>여행기간</Text>
                    <TouchableOpacity 
                        onPress={openCalendar} 
                        activeOpacity={0.7}
                        style={styles.inputContainer}
                    >
                        <Icon name="calendar-check" size={18} color="black" style={styles.inputIcon} />
                        <Text style={[styles.input, !travelPeriod && styles.placeholder]}>
                            {travelPeriod || "여행기간을 선택해주세요."}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Location */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>여행장소</Text>
                    <View style={styles.inputContainer}>
                    <Icon2 name="location-on" size={18} color="black" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="여행장소를 입력해주세요."
                        placeholderTextColor="#777"
                        value={travelLocation}
                        onChangeText={setTravelLocation}
                    />
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.applyButton} 
                    onPress={applyFilters}
                    activeOpacity={0.7}
                >
                    <Text style={styles.applyButtonText}>적용하기</Text>
                </TouchableOpacity>
                </View>
            </View>
            </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>

        {/* 캘린더 팝업 - FilterPopup이 열려있을 때만 렌더링 */}
        {visible && (
            <CalendarPopup
                visible={calendarVisible}
                onClose={closeCalendar}
                onSelectDates={handleCalendarSelect}
            />
        )}
        </>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    sectionContainer: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#adb5bd',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: '#000',
        fontSize: 14,
    },
    placeholder: {
        color: '#777',
    },
    applyButton: {
        backgroundColor: 'black',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default FilterPopup;