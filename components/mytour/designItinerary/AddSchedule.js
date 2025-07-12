import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput, 
    Alert,
    Modal,
    ScrollView,
    Keyboard,
    Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window');

const AddSchedule = ({ 
    visible, 
    onClose, 
    onScheduleAdded, 
    selectedDay,
    selectedDate,
    selectedHour,
    periodType,
    startDate,
    endDate,
    nights,
    days,
    existingSchedule,
    onScheduleDelete // 삭제 핸들러 추가
}) => {
    const [category, setCategory] = useState('숙소');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('07:30');
    const [endTime, setEndTime] = useState('08:30');
    const [location, setLocation] = useState('');
    const [memo, setMemo] = useState('');
    const [currentSelectedDate, setCurrentSelectedDate] = useState('');
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [memoHeight, setMemoHeight] = useState(40); // 메모 입력란 높이 상태 추가
    const [keyboardHeight, setKeyboardHeight] = useState(0); // 키보드 높이 상태 추가
    const [memoFocused, setMemoFocused] = useState(false); // 메모 입력란 포커스 상태
    const scrollViewRef = useRef(null); // 스크롤뷰 참조

    const categories = [
        { key: '숙소', label: '숙소', icon: 'home', color: '#FFD965' },
        { key: '식사', label: '식사', icon: 'coffee', color: '#FF9E6D' },
        { key: '관광', label: '관광', icon: 'camera', color: '#A3C8E9' },
        { key: '휴식', label: '휴식', icon: 'pause-circle', color: '#C6D6C3' }
    ];

    const isEditMode = !!existingSchedule;
    const popupTitle = isEditMode ? '일정 수정' : '일정 추가';

    // 저장 버튼 활성화 조건 체크
    const isSaveEnabled = title.trim() && location.trim() && currentSelectedDate;

    // 키보드 이벤트 리스너
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
            setKeyboardHeight(event.endCoordinates.height);
        });
        
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // 메모 입력란 포커스 시 스크롤 조정
    useEffect(() => {
        if (memoFocused && keyboardHeight > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [memoFocused, keyboardHeight]);
    
    // 날짜 리스트 생성 함수 - useMemo로 메모이제이션
    const availableDates = useMemo(() => {
        const dateList = [];
        
        if (periodType === 'date' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const dateString = date.toISOString().split('T')[0];
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const dayName = dayNames[date.getDay()];
                
                dateList.push({
                    value: dateString,
                    label: `${year}-${month}-${day} (${dayName})`
                });
            }
        } else if (periodType === 'duration' && days) {
            for (let i = 1; i <= days; i++) {
                dateList.push({
                    value: `${i}일차`,
                    label: `${i}일차`
                });
            }
        }
        
        return dateList;
    }, [periodType, startDate, endDate, days]);

    // 팝업이 열릴 때만 초기값 설정
    useEffect(() => {
        if (visible) {
            console.log('AddSchedule popup opened');
            console.log('existingSchedule:', existingSchedule);
            console.log('selectedDate:', selectedDate);
            console.log('selectedHour:', selectedHour);
            console.log('selectedDay:', selectedDay);
            
            if (existingSchedule) {
                // 기존 일정 수정 모드
                console.log('Edit mode - setting existing schedule data');
                setCategory(existingSchedule.category || '숙소');
                setTitle(existingSchedule.title || '');
                setStartTime(existingSchedule.startTime || '07:30');
                setEndTime(existingSchedule.endTime || '08:30');
                setLocation(existingSchedule.location || '');
                setMemo(existingSchedule.memo || '');
                setCurrentSelectedDate(existingSchedule.date || '');
                // 메모 높이 초기화
                setMemoHeight(existingSchedule.memo ? Math.max(40, existingSchedule.memo.split('\n').length * 20 + 20) : 40);
            } else {
                // 새 일정 추가 모드
                console.log('Add mode - setting default values');
                setCategory('숙소');
                setTitle('');
                setLocation('');
                setMemo('');
                setMemoHeight(40); // 메모 높이 초기화
                
                // 날짜 설정
                if (selectedDate) {
                    setCurrentSelectedDate(selectedDate);
                    console.log('Using selectedDate:', selectedDate);
                } else if (selectedDay && availableDates.length > 0) {
                    const dayIndex = selectedDay - 1;
                    if (dayIndex >= 0 && dayIndex < availableDates.length) {
                        setCurrentSelectedDate(availableDates[dayIndex].value);
                        console.log('Using selectedDay date:', availableDates[dayIndex].value);
                    }
                } else if (availableDates.length > 0) {
                    setCurrentSelectedDate(availableDates[0].value);
                    console.log('Using first available date:', availableDates[0].value);
                }
                
                // 시간 설정
                if (selectedHour !== undefined && selectedHour !== null) {
                    const hourString = selectedHour.toString().padStart(2, '0');
                    setStartTime(`${hourString}:00`);
                    
                    const endHour = (selectedHour + 1) % 24;
                    const endHourString = endHour.toString().padStart(2, '0');
                    setEndTime(`${endHourString}:00`);
                    console.log('Using selectedHour:', `${hourString}:00 - ${endHourString}:00`);
                } else {
                    setStartTime('07:30');
                    setEndTime('08:30');
                    console.log('Using default time: 07:30 - 08:30');
                }
            }
        }
    }, [visible, existingSchedule, selectedDay, selectedDate, selectedHour]);

    // 팝업이 닫힐 때 상태 초기화
    useEffect(() => {
        if (!visible) {
            setShowDateDropdown(false);
            setMemoHeight(40); // 메모 높이도 초기화
            setKeyboardHeight(0);
            setMemoFocused(false);
        }
    }, [visible]);

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('알림', '일정 제목을 입력해주세요.');
            return;
        }

        if (!location.trim()) {
            Alert.alert('알림', '위치를 입력해주세요.');
            return;
        }

        if (!currentSelectedDate) {
            Alert.alert('알림', '날짜를 선택해주세요.');
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
            date: currentSelectedDate
        };

        console.log('저장할 일정 데이터:', scheduleData);
        onScheduleAdded && onScheduleAdded(scheduleData);
        onClose();
    };

    // 삭제 버튼 클릭 핸들러
    const handleDelete = () => {
        if (!existingSchedule) return;
        
        Alert.alert(
            '일정 삭제',
            '정말로 이 일정을 삭제하시겠습니까?',
            [
                {
                    text: '취소',
                    style: 'cancel'
                },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: () => {
                        // selectedDay가 없으면 existingSchedule.day를 사용
                        const dayToDelete = selectedDay || existingSchedule.day;
                        console.log('삭제할 일정:', existingSchedule.id, '삭제할 날짜:', dayToDelete);
                        
                        onScheduleDelete && onScheduleDelete(existingSchedule.id, dayToDelete);
                        onClose();
                    }
                }
            ]
        );
    };

    const handleDateSelect = (dateValue) => {
        console.log('날짜 선택됨:', dateValue);
        setCurrentSelectedDate(dateValue);
        setShowDateDropdown(false);
    };

    const getSelectedDateLabel = () => {
        if (!currentSelectedDate) {
            return '날짜 선택';
        }
        const selectedDateObj = availableDates.find(date => date.value === currentSelectedDate);
        const label = selectedDateObj ? selectedDateObj.label : currentSelectedDate;
        return label;
    };

    // 메모 포커스 핸들러
    const handleMemoFocus = () => {
        setMemoFocused(true);
    };

    const handleMemoBlur = () => {
        setMemoFocused(false);
    };
    
    // 메모 입력란 높이 자동 조정 함수
    const handleMemoContentSizeChange = (event) => {
        const { height } = event.nativeEvent.contentSize;
        const newHeight = Math.max(40, Math.min(height + 10, 120)); // 최소 40, 최대 120
        setMemoHeight(newHeight);
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

    const renderDateDropdown = () => (
        <View style={styles.dropdown}>
            <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {availableDates.map((date, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.dropdownItem,
                            currentSelectedDate === date.value && styles.dropdownItemSelected
                        ]}
                        onPress={() => handleDateSelect(date.value)}
                    >
                        <Text style={[
                            styles.dropdownItemText,
                            currentSelectedDate === date.value && styles.dropdownItemTextSelected
                        ]}>
                            {date.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[
                    styles.container, 
                    memoFocused && keyboardHeight > 0 && {
                        transform: [{ translateY: -keyboardHeight * 0.3 }]
                    }
                ]}>
                        {/* 헤더 */}
                        <View style={styles.header}>
                            <Text style={styles.title}>{popupTitle}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Feather name="x" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* 콘텐츠 */}
                        <ScrollView 
                            ref={scrollViewRef}
                            style={styles.content} 
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
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

                            {/* 날짜 선택 */}
                            <View style={styles.section}>
                                <View style={styles.inputRow}>
                                    <View style={styles.iconContainer}>
                                        <Feather name="calendar" size={16} color="#666" />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.dropdownButton}
                                        onPress={() => setShowDateDropdown(!showDateDropdown)}
                                    >
                                        <Text style={[
                                            styles.dropdownText,
                                            !currentSelectedDate && styles.dropdownPlaceholder
                                        ]}>
                                            {getSelectedDateLabel()}
                                        </Text>
                                        <Feather 
                                            name={showDateDropdown ? "chevron-up" : "chevron-down"} 
                                            size={16} 
                                            color="#666" 
                                        />
                                    </TouchableOpacity>
                                </View>
                                
                                {/* 날짜 드롭다운 */}
                                {showDateDropdown && renderDateDropdown()}
                            </View>

                            {/* 시간 입력 */}
                            <View style={styles.section}>
                                <View style={styles.inputRow}>
                                    <View style={styles.iconContainer}>
                                        <Feather name="clock" size={16} color="#666" />
                                    </View>
                                    <View style={styles.timeInputRow}>
                                        <TextInput
                                            style={styles.timeInput}
                                            value={startTime}
                                            onChangeText={setStartTime}
                                            placeholder="시작시간"
                                            placeholderTextColor="#CCCCCC"
                                        />
                                        <Text style={styles.timeSeparator}>—</Text>
                                        <TextInput
                                            style={styles.timeInput}
                                            value={endTime}
                                            onChangeText={setEndTime}
                                            placeholder="종료시간"
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
                                        style={[styles.memoInput, { height: Math.max(40, memoHeight) }]}
                                        value={memo}
                                        onChangeText={setMemo}
                                        placeholder="메모 추가"
                                        placeholderTextColor="#CCCCCC"
                                        multiline={true}
                                        textAlignVertical="top"
                                        onContentSizeChange={handleMemoContentSizeChange}
                                        scrollEnabled={memoHeight >= 120}
                                        onFocus={handleMemoFocus}
                                        onBlur={handleMemoBlur}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        {/* 하단 버튼 */}
                        <View style={styles.buttonContainer}>
                            {/* 수정 모드일 때만 삭제 버튼 표시 */}
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
                                    !isSaveEnabled && styles.saveButtonDisabled,
                                    isEditMode && styles.saveButtonWithDelete
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
        height: '60%',
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
        paddingVertical: 16,
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
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
        flex: 1,
    },
    section: {
        marginBottom: 16,
        position: 'relative',
    },
    titleInput: {
        fontSize: 16,
        height: 40,
        paddingVertical: 10,
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
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
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
    dropdownButton: {
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
    dropdownText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    dropdownPlaceholder: {
        color: '#CCCCCC',
    },
    dropdown: {
        position: 'absolute',
        top: 38,
        left: 36,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        zIndex: 100000,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    dropdownScroll: {
        maxHeight: 168,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownItemSelected: {
        backgroundColor: '#f8f9fa',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    },
    dropdownItemTextSelected: {
        color: '#000',
        fontWeight: '600',
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timeInput: {
        flex: 1,
        fontSize: 14,
        height: 40,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
        textAlign: 'center',
    },
    timeSeparator: {
        fontSize: 14,
        color: '#666',
        marginHorizontal: 16,
    },
    input: {
        flex: 1,
        fontSize: 14,
        height: 40,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    memoInput: {
        flex: 1,
        fontSize: 14,
        minHeight: 40,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 12,
    },
    deleteButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#000',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonWithDelete: {
        flex: 2, // 삭제 버튼이 있을 때는 저장 버튼을 더 크게
    },
    saveButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonTextDisabled: {
        color: '#999',
    },
});

export default AddSchedule;