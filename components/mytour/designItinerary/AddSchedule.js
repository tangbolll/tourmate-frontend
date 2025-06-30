import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Alert,
    Modal,
    ScrollView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const AddSchedule = ({ 
    visible, 
    onClose, 
    onSave, 
    onDelete,
    selectedDate, 
    selectedTime, 
    existingSchedule
}) => {
    const [category, setCategory] = useState('숙소');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('07:30');
    const [endTime, setEndTime] = useState('08:30');
    const [location, setLocation] = useState('');
    const [memo, setMemo] = useState('');
    const [dateText, setDateText] = useState(''); // 날짜 텍스트 편집 가능

    const categories = [
        { key: '숙소', label: '숙소', icon: 'home', color: '#FFD965' },
        { key: '식사', label: '식사', icon: 'coffee', color: '#FF9E6D' },
        { key: '관광', label: '관광', icon: 'camera', color: '#A3C8E9' },
        { key: '휴식', label: '휴식', icon: 'pause-circle', color: '#C6D6C3' }
    ];

    const isEditMode = !!existingSchedule;
    const popupTitle = isEditMode ? '일정 수정' : '일정 추가';

    // 저장 버튼 활성화 조건 체크
    const isSaveEnabled = title.trim() && location.trim();

    // 기존 일정 데이터로 초기화
    useEffect(() => {
        if (existingSchedule) {
            setCategory(existingSchedule.category || '숙소');
            setTitle(existingSchedule.title || '');
            setStartTime(existingSchedule.startTime || '');
            setEndTime(existingSchedule.endTime || '');
            setLocation(existingSchedule.location || '');
            setMemo(existingSchedule.memo || '');
            setDateText(existingSchedule.dateText || selectedDate || '');
        } else {
            // 새 일정 추가시 기본값 설정
            setCategory('숙소');
            setTitle('');
            setStartTime(selectedTime ? `${selectedTime.toString().padStart(2, '0')}:00` : '');
            setEndTime(selectedTime ? `${(selectedTime + 1).toString().padStart(2, '0')}:00` : '');
            setLocation('');
            setMemo('');
            setDateText(selectedDate || '');
        }
    }, [existingSchedule, selectedTime, selectedDate, visible]);

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('알림', '일정 제목을 입력해주세요.');
            return;
        }

        if (!location.trim()) {
            Alert.alert('알림', '위치를 입력해주세요.');
            return;
        }

        const scheduleData = {
            id: existingSchedule?.id || Date.now().toString(),
            category,
            title: title.trim(),
            startTime,
            endTime,
            location: location.trim(),
            memo: memo.trim(),
            date: selectedDate,
            timeSlot: selectedTime,
            dateText: dateText.trim() // 날짜 텍스트 저장
        };

        onSave && onSave(scheduleData);
        onClose();
    };

    const handleDelete = () => {
        if (!isEditMode) return;

        Alert.alert(
            '일정 삭제',
            '이 일정을 삭제하시겠습니까?',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => {
                        onDelete && onDelete(existingSchedule.id);
                        onClose();
                    },
                },
            ]
        );
    };

    const renderCategoryButton = (categoryItem) => (
        <TouchableOpacity
            key={categoryItem.key}
            style={styles.categoryButton}
            onPress={() => setCategory(categoryItem.key)}
        >
            <View style={[
                styles.radioButton,
                category === categoryItem.key && {
                    backgroundColor: categoryItem.color,
                    borderColor: categoryItem.color
                }
            ]}>
                {category === categoryItem.key && (
                    <View style={styles.radioInner} />
                )}
            </View>
            <Text style={[
                styles.categoryText,
                category === categoryItem.key && styles.categoryTextActive
            ]}>
                {categoryItem.label}
            </Text>
        </TouchableOpacity>
    );

    const formatDateDisplay = () => {
        if (!selectedDate) return '';
        
        if (typeof selectedDate === 'string') {
            const date = new Date(selectedDate);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
            const dayName = dayNames[date.getDay()];
            return `${month}월 ${day}일 ${dayName}요일`;
        }
        
        return selectedDate;
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{popupTitle}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* 콘텐츠 */}
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* 일정 제목 */}
                        <View style={styles.section}>
                            <TextInput
                                style={styles.titleInput}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="일정 제목 입력 *"
                                placeholderTextColor="#CCCCCC"
                            />
                        </View>

                        {/* 카테고리 선택 */}
                        <View style={styles.section}>
                            <View style={styles.categoryContainer}>
                                {categories.map(renderCategoryButton)}
                            </View>
                        </View>

                        {/* 날짜와 시간 */}
                        <View style={styles.dateTimeSection}>
                            <View style={styles.dateTimeRow}>
                                <View style={styles.iconContainer}>
                                    <Feather name="calendar" size={16} color="#666" />
                                </View>
                                <TextInput
                                    style={styles.dateTextInput}
                                    value={dateText}
                                    onChangeText={setDateText}
                                    placeholder="날짜 입력"
                                    placeholderTextColor="#CCCCCC"
                                />
                            </View>
                            
                            <View style={styles.dateTimeRow}>
                                <View style={styles.iconContainer}>
                                    <Feather name="clock" size={16} color="#666" />
                                </View>
                                <View style={styles.timeInputRow}>
                                    <TextInput
                                        style={styles.timeInput}
                                        value={startTime}
                                        onChangeText={setStartTime}
                                        placeholder="07:30"
                                        placeholderTextColor="#CCCCCC"
                                    />
                                    <Text style={styles.timeSeparator}>—</Text>
                                    <TextInput
                                        style={styles.timeInput}
                                        value={endTime}
                                        onChangeText={setEndTime}
                                        placeholder="08:30"
                                        placeholderTextColor="#CCCCCC"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* 장소 */}
                        <View style={styles.section}>
                            <View style={styles.inputRow}>
                                <View style={styles.iconContainer}>
                                    <Feather name="map-pin" size={16} color="#666" />
                                </View>
                                <TextInput
                                    style={styles.input}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="위치 추가 *"
                                    placeholderTextColor="#CCCCCC"
                                />
                            </View>
                        </View>

                        {/* 메모 */}
                        <View style={styles.section}>
                            <View style={styles.inputRow}>
                                <View style={styles.iconContainer}>
                                    <Feather name="file-text" size={16} color="#666" />
                                </View>
                                <TextInput
                                    style={styles.memoInput}
                                    value={memo}
                                    onChangeText={setMemo}
                                    placeholder="메모 추가"
                                    placeholderTextColor="#CCCCCC"
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* 하단 버튼 */}
                    <View style={styles.buttonContainer}>
                        {isEditMode && (
                            <TouchableOpacity 
                                style={styles.deleteButton} 
                                onPress={handleDelete}
                            >
                                <Text style={styles.deleteButtonText}>삭제</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={[
                                styles.saveButton, 
                                isEditMode && styles.saveButtonWithDelete,
                                !isSaveEnabled && styles.saveButtonDisabled
                            ]} 
                            onPress={handleSave}
                            disabled={!isSaveEnabled}
                        >
                            <Text style={[
                                styles.saveButtonText,
                                !isSaveEnabled && styles.saveButtonTextDisabled
                            ]}>
                                저장
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        paddingHorizontal: 40,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxHeight: '55%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        // borderBottomWidth: 1,
        // borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        height: '100%',
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    section: {
        marginBottom: 12,
    },
    titleInput: {
        fontSize: 16,
        height: 36, // 높이 고정
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
        textAlign: 'center',
    },
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    categoryButton: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        minWidth: 60,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    radioInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    categoryText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    categoryTextActive: {
        color: '#333',
        fontWeight: '600',
    },
    dateTimeSection: {
        marginBottom: 12,
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 24,
        alignItems: 'center',
        marginRight: 12,
    },
    dateTimeText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    dateTextInput: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        height: 32, // 높이 고정
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        backgroundColor: '#fff',
        flex: 1,
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timeInput: {
        flex: 1,
        fontSize: 14,
        height: 32, // 높이 고정
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        backgroundColor: '#fff',
        textAlign: 'center',
    },
    timeSeparator: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 12,
    },
    input: {
        flex: 1,
        fontSize: 14,
        height: 32, // 높이 고정
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    memoInput: {
        flex: 1,
        fontSize: 14,
        height: 32,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 20,
        gap: 12,
        // borderTopWidth: 1,
        // borderTopColor: '#f0f0f0',
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    deleteButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    saveButton: {
        flex: 2,
        backgroundColor: '#000',
        paddingVertical: 12,
        borderRadius: 20,
        alignItems: 'center',
    },
    saveButtonWithDelete: {
        flex: 2,
    },
    saveButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButtonTextDisabled: {
        color: '#999',
    },
});

export default AddSchedule;