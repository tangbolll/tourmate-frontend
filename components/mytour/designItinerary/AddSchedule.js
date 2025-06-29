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

    const categories = [
        { key: '숙소', label: '숙소', icon: 'home' },
        { key: '식사', label: '식사', icon: 'coffee' },
        { key: '관광', label: '관광', icon: 'camera' },
        { key: '휴식', label: '휴식', icon: 'pause-circle' }
    ];

    const isEditMode = !!existingSchedule;
    const popupTitle = isEditMode ? '일정 수정' : '일정 추가';

    // 기존 일정 데이터로 초기화
    useEffect(() => {
        if (existingSchedule) {
            setCategory(existingSchedule.category || '숙소');
            setTitle(existingSchedule.title || '');
            setStartTime(existingSchedule.startTime || '07:30');
            setEndTime(existingSchedule.endTime || '08:30');
            setLocation(existingSchedule.location || '');
            setMemo(existingSchedule.memo || '');
        } else {
            // 새 일정 추가시 기본값 설정
            setCategory('숙소');
            setTitle('');
            setStartTime(selectedTime ? `${selectedTime.toString().padStart(2, '0')}:00` : '07:30');
            setEndTime(selectedTime ? `${(selectedTime + 1).toString().padStart(2, '0')}:00` : '08:30');
            setLocation('');
            setMemo('');
        }
    }, [existingSchedule, selectedTime, visible]);

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('알림', '일정 제목을 입력해주세요.');
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
            timeSlot: selectedTime
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
            style={[
                styles.categoryButton,
                category === categoryItem.key && styles.categoryButtonActive
            ]}
            onPress={() => setCategory(categoryItem.key)}
        >
            <View style={[
                styles.categoryIcon,
                category === categoryItem.key && styles.categoryIconActive
            ]}>
                <Feather 
                    name={categoryItem.icon} 
                    size={16} 
                    color={category === categoryItem.key ? '#fff' : '#666'} 
                />
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
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{popupTitle}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    {/* 콘텐츠 */}
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* 날짜 정보 */}
                        <View style={styles.dateInfo}>
                            <Text style={styles.dateText}>{formatDateDisplay()}</Text>
                        </View>

                        {/* 카테고리 선택 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>카테고리</Text>
                            <View style={styles.categoryContainer}>
                                {categories.map(renderCategoryButton)}
                            </View>
                        </View>

                        {/* 일정 제목 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>일정 제목 *</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="일정 제목을 입력하세요"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* 시간 설정 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>시간</Text>
                            <View style={styles.timeContainer}>
                                <View style={styles.timeInputContainer}>
                                    <Text style={styles.timeLabel}>시작</Text>
                                    <TextInput
                                        style={styles.timeInput}
                                        value={startTime}
                                        onChangeText={setStartTime}
                                        placeholder="07:30"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                                <Text style={styles.timeSeparator}>~</Text>
                                <View style={styles.timeInputContainer}>
                                    <Text style={styles.timeLabel}>종료</Text>
                                    <TextInput
                                        style={styles.timeInput}
                                        value={endTime}
                                        onChangeText={setEndTime}
                                        placeholder="08:30"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* 장소 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>장소</Text>
                            <TextInput
                                style={styles.input}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="장소를 입력하세요"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* 메모 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>메모</Text>
                            <TextInput
                                style={[styles.input, styles.memoInput]}
                                value={memo}
                                onChangeText={setMemo}
                                placeholder="메모를 입력하세요"
                                placeholderTextColor="#999"
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
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
                            style={[styles.saveButton, isEditMode && styles.saveButtonWithDelete]} 
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>
                                {isEditMode ? '수정' : '저장'}
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
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    dateInfo: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    categoryButton: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 4,
        paddingVertical: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    categoryButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    categoryIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    categoryIconActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    categoryText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    categoryTextActive: {
        color: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeInputContainer: {
        flex: 1,
        alignItems: 'center',
    },
    timeLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    timeInput: {
        borderWidth: 1,
        borderColor: '#e9ecef',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        backgroundColor: '#fff',
        textAlign: 'center',
        width: '100%',
    },
    timeSeparator: {
        fontSize: 18,
        color: '#666',
        marginHorizontal: 16,
        marginTop: 24,
    },
    memoInput: {
        height: 100,
        paddingTop: 14,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 12,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: '#ff3b30',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonWithDelete: {
        flex: 1,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddSchedule;