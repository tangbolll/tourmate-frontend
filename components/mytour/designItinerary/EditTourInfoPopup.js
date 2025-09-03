import { React, useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import DayPicker from '../createItinerary/DayPicker';

const EditTourInfoPopup = ({
    visible,
    onClose,
    onSave,
    existingData,
    periodType,
}) => {
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [nights, setNights] = useState('');
    const [days, setDays] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectingDateType, setSelectingDateType] = useState('start');

    useEffect(() => {
        if (visible && existingData) {
            setTitle(existingData.title || '');
            if (periodType === 'date') {
                setStartDate(existingData.startDate ? new Date(existingData.startDate) : new Date());
                setEndDate(existingData.endDate ? new Date(existingData.endDate) : new Date());
            } else {
                setNights(String(existingData.nights || ''));
                setDays(String(existingData.days || ''));
            }
        }
    }, [visible, existingData, periodType]);

    const formatDateForDisplay = (date) => {
        if (!date) return '날짜 선택';
        return dayjs(date).format('M월 D일 (ddd)');
    };

    const openCalendar = (dateType) => {
        setSelectingDateType(dateType);
        setShowCalendar(true);
    };

    const handleDateSelect = (selectedDate) => {
        if (selectingDateType === 'start') {
            setStartDate(selectedDate);
            if (endDate && selectedDate > endDate) {
                setEndDate(selectedDate);
            }
        } else {
            if (startDate && selectedDate < startDate) {
                Alert.alert("잘못된 날짜", "종료일은 시작일보다 빠를 수 없습니다.");
                return;
            }
            setEndDate(selectedDate);
        }
        setShowCalendar(false);
    };

    const renderPeriodInputs = () => {
        if (periodType === 'date') {
            return (
                <View style={styles.dateInputsContainer}>
                    <TouchableOpacity style={styles.dateInput} onPress={() => openCalendar('start')}>
                        <Text style={styles.dateText}>{startDate ? formatDateForDisplay(startDate) : '여행 시작일'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.dateSeparator}>—</Text>
                    <TouchableOpacity style={styles.dateInput} onPress={() => openCalendar('end')}>
                        <Text style={styles.dateText}>{endDate ? formatDateForDisplay(endDate) : '여행 종료일'}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <View style={styles.dateInputsContainer}>
                <TextInput
                    style={styles.durationInput}
                    value={nights}
                    onChangeText={setNights}
                    placeholder="박"
                    keyboardType="number-pad"
                />
                <Text style={styles.durationText}>박</Text>
                <TextInput
                    style={styles.durationInput}
                    value={days}
                    onChangeText={setDays}
                    placeholder="일"
                    keyboardType="number-pad"
                />
                <Text style={styles.durationText}>일</Text>
            </View>
        );
    };

    const handlePressSave = () => {
        if (!title.trim()) {
            Alert.alert('오류', '제목을 입력해주세요.');
            return;
        }
        let updatedData = { title };
        if (periodType === 'date') {
            updatedData = {
                ...updatedData,
                startDate: dayjs(startDate).format('YYYY-MM-DD'),
                endDate: dayjs(endDate).format('YYYY-MM-DD'),
                nights: null, days: null,
            };
        } else {
            const numNights = parseInt(nights, 10);
            const numDays = parseInt(days, 10);
            if (isNaN(numNights) || isNaN(numDays)) {
                Alert.alert("오류", "여행 기간을 숫자로 입력해주세요.");
                return;
            }
            if (numDays <= numNights) {
                Alert.alert("기간 오류", "'일'은 '박'보다 커야 합니다. (예: 1박 2일)");
                return;
            }
            updatedData = {
                ...updatedData,
                startDate: null, endDate: null,
                nights: numNights, days: numDays,
            };
        }
        onSave(updatedData);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>여행 정보 수정</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>×</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.inputContainer}>
                        <View style={styles.iconContainer}>
                            <Feather name="edit-2" size={20} color="#666" />
                        </View>
                        <TextInput
                            style={styles.textInput}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="제목을 입력하세요"
                        />
                    </View>
                    <View style={styles.dateContainer}>
                        <View style={styles.iconContainer}>
                            <Feather name="calendar" size={20} color="#666" />
                        </View>
                        {renderPeriodInputs()}
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handlePressSave}>
                            <Text style={styles.saveButtonText}>저장</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {periodType === 'date' && (
                    <DayPicker
                        visible={showCalendar}
                        onClose={() => setShowCalendar(false)}
                        onDateSelect={handleDateSelect}
                        selectedStartDate={startDate}
                        selectedEndDate={endDate}
                        selectingDateType={selectingDateType}
                        title={selectingDateType === 'start' ? '여행 시작일 선택' : '여행 종료일 선택'}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, },
    container: { backgroundColor: 'white', borderRadius: 12, padding: 20, width: '100%', maxWidth: 400, },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333', },
    closeButton: { padding: 5, },
    closeText: { fontSize: 24, color: '#999', fontWeight: 'bold', },
    inputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, },
    dateContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, },
    iconContainer: { width: 30, marginRight: 10, alignItems: 'center', },
    textInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, backgroundColor: '#fff', },
    dateInputsContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', },
    dateInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fff', },
    dateText: { fontSize: 14, color: '#333', textAlign: 'center', },
    dateSeparator: { fontSize: 16, color: '#999', marginHorizontal: 10, },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, },
    cancelButton: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingVertical: 12, alignItems: 'center', },
    cancelButtonText: { fontSize: 16, color: '#666', },
    saveButton: { flex: 1, backgroundColor: '#000', borderRadius: 25, paddingVertical: 12, alignItems: 'center', },
    saveButtonText: { fontSize: 16, color: '#fff', fontWeight: 'bold', },
    durationInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 12, fontSize: 14, color: '#333', textAlign: 'center', },
    durationText: { fontSize: 14, color: '#333', marginHorizontal: 8, },
});

export default EditTourInfoPopup;