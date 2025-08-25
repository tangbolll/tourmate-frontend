import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    ScrollView,
    Keyboard,
    Dimensions,
    TextInput
} from 'react-native';
import ScheduleHeader from './ScheduleHeader';
import ScheduleCategorySelector from './ScheduleCategorySelector';
import ScheduleDateInput from './ScheduleDateInput';
import ScheduleTimeInput from './ScheduleTimeInput';
import ScheduleLocationInput from './ScheduleLocationInput';
import ScheduleMemoInput from './ScheduleMemoInput';
import ScheduleActions from './ScheduleActions';

const { height: screenHeight } = Dimensions.get('window');

const AddSchedule = ({
    visible,
    onClose,
    onScheduleAdded,
    selectedDay,
    selectedDate,
    // --- 💡 1. Props 이름 변경 ---
    hour,      // 기존: selectedHour
    minute,    // minute 추가
    // ---------------------------
    periodType,
    startDate,
    endDate,
    days,
    existingSchedule,
    onScheduleDelete,
    currentTourId
}) => {
    const [category, setCategory] = useState('숙소');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('07:30');
    const [endTime, setEndTime] = useState('08:30');
    const [location, setLocation] = useState('');
    const [memo, setMemo] = useState('');
    const [currentSelectedDate, setCurrentSelectedDate] = useState('');
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [memoHeight, setMemoHeight] = useState(40);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [memoFocused, setMemoFocused] = useState(false);
    const scrollViewRef = useRef(null);

    const categories = [
        { key: '숙소', label: '숙소', icon: 'home', color: '#FFD965' },
        { key: '식사', label: '식사', icon: 'coffee', color: '#FF9E6D' },
        { key: '관광', label: '관광', icon: 'camera', color: '#A3C8E9' },
        { key: '휴식', label: '휴식', icon: 'pause-circle', color: '#C6D6C3' }
    ];

    const isEditMode = !!existingSchedule;
    const popupTitle = isEditMode ? '일정 수정' : '일정 추가';
    const isSaveEnabled = title.trim() && location.trim() && currentSelectedDate;

    // 키보드 관련 로직 (변경 없음)
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

    useEffect(() => {
        if (memoFocused && keyboardHeight > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [memoFocused, keyboardHeight]);

    // 날짜 계산 로직 (변경 없음)
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
                dateList.push({ value: dateString, label: `${year}-${month}-${day} (${dayName})` });
            }
        } else if (periodType === 'duration' && days) {
            for (let i = 1; i <= days; i++) {
                dateList.push({ value: `${i}일차`, label: `${i}일차` });
            }
        }
        return dateList;
    }, [periodType, startDate, endDate, days]);

    // --- 💡 2. 컴포넌트 상태 초기화 로직 수정 ---
    useEffect(() => {
        if (visible) {
            if (existingSchedule) {
                // 수정 모드 로직 (timeSlot 파싱 추가)
                setCategory(existingSchedule.tag || '숙소');
                setTitle(existingSchedule.title || '');
                if (existingSchedule.timeSlot) {
                    const [start, end] = existingSchedule.timeSlot.split(' ~ ');
                    setStartTime(start || '07:30');
                    setEndTime(end || '08:30');
                }
                setLocation(existingSchedule.location || '');
                setMemo(existingSchedule.memo || '');
                setCurrentSelectedDate(existingSchedule.date || '');
                setMemoHeight(existingSchedule.memo ? Math.max(40, existingSchedule.memo.split('\n').length * 20 + 20) : 40);
            } else {
                // 추가 모드 로직
                setCategory('숙소');
                setTitle('');
                setLocation('');
                setMemo('');
                setMemoHeight(40);

                // 날짜 설정 로직
                if (selectedDate) {
                    setCurrentSelectedDate(selectedDate);
                } else if (selectedDay && availableDates.length > 0) {
                    const dayIndex = selectedDay - 1;
                    if (dayIndex >= 0 && dayIndex < availableDates.length) {
                        setCurrentSelectedDate(availableDates[dayIndex].value);
                    }
                } else if (availableDates.length > 0) {
                    setCurrentSelectedDate(availableDates[0].value);
                }
                
                // ⭐ 핵심 수정: hour와 minute Props를 사용하여 시간 상태 설정
                if (hour !== undefined && minute !== undefined) {
                    const initialHour = String(hour).padStart(2, '0');
                    const initialMinute = String(minute).padStart(2, '0');
                    const endHour = (hour + 1) % 24;
                    const endHourString = String(endHour).padStart(2, '0');
                    
                    setStartTime(`${initialHour}:${initialMinute}`);
                    setEndTime(`${endHourString}:${initialMinute}`);
                } else {
                    setStartTime('07:30');
                    setEndTime('08:30');
                }
            }
        }
    // --- 💡 3. 의존성 배열 수정 ---
    }, [visible, existingSchedule, selectedDay, selectedDate, hour, minute, availableDates]);

    // ... 나머지 핸들러 및 렌더링 로직은 기존과 동일합니다 ...
    
    useEffect(() => {
        if (!visible) {
            setShowDateDropdown(false);
            setMemoHeight(40);
            setKeyboardHeight(0);
            setMemoFocused(false);
        }
    }, [visible]);

    const handleSave = () => {
        if (!title.trim() || !location.trim() || !currentSelectedDate) {
            Alert.alert('알림', '제목, 위치, 날짜는 필수 입력 항목입니다.');
            return;
        }

        const scheduleData = {
            id: existingSchedule?.id || null, // 새 일정은 id를 null로 보냄
            category,
            title: title.trim(),
            startTime,
            endTime,
            location: location.trim(),
            memo: memo.trim(),
            date: currentSelectedDate,
            travelId: currentTourId
        };
        onScheduleAdded(scheduleData);
        onClose();
    };

    const handleDelete = () => {
        if (!existingSchedule) return;
        Alert.alert(
            '일정 삭제', '정말로 이 일정을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제', style: 'destructive',
                    onPress: () => {
                        onScheduleDelete(existingSchedule.id);
                        onClose();
                    }
                }
            ]
        );
    };

    const handleMemoFocus = () => setMemoFocused(true);
    const handleMemoBlur = () => setMemoFocused(false);

    const handleOverlayPress = () => {
        if (showDateDropdown) {
            setShowDateDropdown(false);
        } else {
            onClose();
        }
    };
    
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={commonStyles.overlay}
                activeOpacity={1}
                onPress={handleOverlayPress}
            >
                <TouchableOpacity
                    style={[
                        commonStyles.container,
                        memoFocused && keyboardHeight > 0 && {
                            transform: [{ translateY: -keyboardHeight * 0.3 }]
                        }
                    ]}
                    activeOpacity={1}
                >
                    <ScheduleHeader
                        title={popupTitle}
                        onClose={onClose}
                    />
                    <ScrollView
                        ref={scrollViewRef}
                        style={commonStyles.content}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={commonStyles.section}>
                            <TextInput
                                style={commonStyles.titleInput}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="일정 제목 입력 *"
                                placeholderTextColor="#CCCCCC"
                            />
                        </View>
                        <ScheduleCategorySelector
                            categories={categories}
                            selectedCategory={category}
                            onSelectCategory={setCategory}
                        />
                        <ScheduleDateInput
                            currentSelectedDate={currentSelectedDate}
                            availableDates={availableDates}
                            showDateDropdown={showDateDropdown}
                            setShowDateDropdown={setShowDateDropdown}
                            handleDateSelect={setCurrentSelectedDate}
                        />
                        <ScheduleTimeInput
                            startTime={startTime}
                            setStartTime={setStartTime}
                            endTime={endTime}
                            setEndTime={setEndTime}
                        />
                        <ScheduleLocationInput
                            location={location}
                            setLocation={setLocation}
                        />
                        <ScheduleMemoInput
                            memo={memo}
                            setMemo={setMemo}
                            memoHeight={memoHeight}
                            setMemoHeight={setMemoHeight}
                            onFocus={handleMemoFocus}
                            onBlur={handleMemoBlur}
                        />
                    </ScrollView>
                    <ScheduleActions
                        isEditMode={isEditMode}
                        isSaveEnabled={isSaveEnabled}
                        onDelete={handleDelete}
                        onSave={handleSave}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};


const commonStyles = StyleSheet.create({
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
        maxHeight: '70%', // 높이 제한 추가
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 20,
        flexGrow: 1, // ScrollView가 content를 채우도록
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
});

export default AddSchedule;