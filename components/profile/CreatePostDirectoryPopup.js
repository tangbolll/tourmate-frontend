import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
    Dimensions,
    ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import DayPicker from './DayPicker';

const CreatePostDirectoryPopup = ({
    visible,
    onClose,
    onSave,
    onDelete,
    mode = 'create', // 'create' 또는 'edit'
    existingData = null, // 수정 시 기존 데이터
}) => {
    const [folderName, setFolderName] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectingDateType, setSelectingDateType] = useState('start'); // 'start' or 'end'
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // 컴포넌트가 열릴 때마다 초기화
    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && existingData) {
                setFolderName(existingData.name || '');
                setStartDate(existingData.startDate ? new Date(existingData.startDate) : new Date());
                setEndDate(existingData.endDate ? new Date(existingData.endDate) : new Date());
            } else {
                // 생성 모드일 때 초기화
                setFolderName('');
                setStartDate(new Date());
                setEndDate(new Date());
            }
        }
    }, [visible, mode, existingData]);

    const formatDateToString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateForDisplay = (date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekday = weekdays[date.getDay()];
        return `${month}월 ${day}일 (${weekday})`;
    };

    const handleDateSelect = (day) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        
        if (selectingDateType === 'start') {
            setStartDate(selectedDate);
            // 시작일이 끝일보다 늦으면 끝일을 시작일과 같게 설정
            if (endDate && selectedDate > endDate) {
                setEndDate(selectedDate);
            }
        } else {
            // 끝일 선택 시 시작일보다 이른 날짜는 선택 불가
            if (startDate && selectedDate < startDate) {
                return; // 선택 불가
            }
            setEndDate(selectedDate);
        }
        
        setShowCalendar(false);
    };

    const openCalendar = (dateType) => {
        setSelectingDateType(dateType);
        setShowCalendar(true);
    };

    const handleSave = () => {
        if (!folderName.trim()) {
            Alert.alert('알림', '폴더명을 입력해주세요.');
            return;
        }

        if (!startDate || !endDate) {
            Alert.alert('알림', '날짜를 선택해주세요.');
            return;
        }

        const folderData = {
            name: folderName.trim(),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };

        if (mode === 'edit' && existingData) {
            folderData.id = existingData.id;
        }

        onSave(folderData);
        onClose();
    };

    const handleDelete = () => {
        Alert.alert(
            '폴더 삭제',
            '정말로 이 폴더를 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => {
                        onDelete(existingData.id);
                        onClose();
                    },
                },
            ]
        );
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {mode === 'create' ? '폴더 생성' : '폴더 수정/삭제'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>×</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 폴더명 입력 */}
                    <View style={styles.inputContainer}>
                        <View style={styles.iconContainer}>
                            <Feather name="folder" size={20} color="#666" />
                        </View>
                        <TextInput
                            style={styles.textInput}
                            value={folderName}
                            onChangeText={setFolderName}
                            placeholder="폴더명을 입력하세요"
                            placeholderTextColor="#999"
                        />
                    </View>

                    {/* 날짜 선택 */}
                    <View style={styles.dateContainer}>
                        <View style={styles.iconContainer}>
                            <Feather name="calendar" size={20} color="#666" />
                        </View>
                        <View style={styles.dateInputsContainer}>
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => openCalendar('start')}
                            >
                                <Text style={[styles.dateText, !startDate && styles.placeholderText]}>
                                    {startDate ? formatDateForDisplay(startDate) : '여행 시작일'}
                                </Text>
                            </TouchableOpacity>
                            
                            <Text style={styles.dateSeparator}>—</Text>
                            
                            <TouchableOpacity
                                style={styles.dateInput}
                                onPress={() => openCalendar('end')}
                            >
                                <Text style={[styles.dateText, !endDate && styles.placeholderText]}>
                                    {endDate ? formatDateForDisplay(endDate) : '여행 종료일'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 버튼 영역 */}
                    <View style={styles.buttonContainer}>
                        {mode === 'edit' ? (
                            <>
                                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                    <Text style={styles.deleteButtonText}>삭제</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                    <Text style={styles.saveButtonText}>저장</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                    <Text style={styles.cancelButtonText}>취소</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.createButton} onPress={handleSave}>
                                    <Text style={styles.createButtonText}>생성</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* DayPicker 컴포넌트 */}
                <DayPicker
                    visible={showCalendar}
                    onClose={() => setShowCalendar(false)}
                    onDateSelect={handleDateSelect}
                    selectedStartDate={startDate}
                    selectedEndDate={endDate}
                    selectingDateType={selectingDateType}
                    title={selectingDateType === 'start' ? '여행 시작일 선택' : '여행 종료일 선택'}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    closeText: {
        fontSize: 24,
        color: '#999',
        fontWeight: 'bold',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    iconContainer: {
        width: 30,
        marginRight: 10,
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    dateInputsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    dateText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
    dateSeparator: {
        fontSize: 16,
        color: '#999',
        marginHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
    },
    createButton: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
    },
    createButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    deleteButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 16,
        color: '#666',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
    placeholderText: {
        color: '#999',
    },
});

export default CreatePostDirectoryPopup;