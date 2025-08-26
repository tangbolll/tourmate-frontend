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
    TextInput,
    Platform
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
    hour,
    minute,
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

    // --- 💡 1. 위치 검색 관련 State 추가 ---
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false); // 로딩 상태 관리를 위해 추가
    // ------------------------------------

    const categories = [
        { key: '숙소', label: '숙소', icon: 'home', color: '#FFD965' },
        { key: '식사', label: '식사', icon: 'coffee', color: '#FF9E6D' },
        { key: '관광', label: '관광', icon: 'camera', color: '#A3C8E9' },
        { key: '휴식', label: '휴식', icon: 'pause-circle', color: '#C6D6C3' }
    ];

    const isEditMode = !!existingSchedule;
    const popupTitle = isEditMode ? '일정 수정' : '일정 추가';
    const isSaveEnabled = title.trim() && location.trim() && currentSelectedDate;

    const kakaoRestApiKey = 'REDACTED_KAKAO_REST_API_KEY';
    const KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

    // ... (키보드 및 날짜 관련 useEffect 로직은 변경 없음) ...
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

    useEffect(() => {
        if (visible) {
            if (existingSchedule) {
                setCategory(existingSchedule.tag || '숙소');
                setTitle(existingSchedule.title || '');
                if (existingSchedule.startTime && existingSchedule.endTime) {
                    setStartTime(existingSchedule.startTime);
                    setEndTime(existingSchedule.endTime);
                } else if (existingSchedule.timeSlot) {
                    const [start, end] = existingSchedule.timeSlot.split(' ~ ');
                    setStartTime(start || '07:30');
                    setEndTime(end || '08:30');
                }
                setLocation(existingSchedule.location || '');
                setMemo(existingSchedule.memo || '');
                setCurrentSelectedDate(existingSchedule.date || '');
                setMemoHeight(existingSchedule.memo ? Math.max(40, existingSchedule.memo.split('\n').length * 20 + 20) : 40);
            } else {
                setCategory('숙소');
                setTitle('');
                setLocation('');
                setMemo('');
                setMemoHeight(40);
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
    }, [visible, existingSchedule, selectedDay, selectedDate, hour, minute, availableDates]);

    useEffect(() => {
        if (!visible) {
            setShowDateDropdown(false);
            setMemoHeight(40);
            setKeyboardHeight(0);
            setMemoFocused(false);
            // --- 💡 2. 모달이 닫힐 때 검색 결과 초기화 ---
            setShowSearchResults(false);
            setSearchResults([]);
            // ---------------------------------------
        }
    }, [visible]);

    // --- 💡 3. 위치 검색 핸들러 함수 수정 ---
    const handleMeetLocationSearch = async (query) => {
        setLocation(query); // ❌ 오류 수정: setMeetLocationInput -> setLocation

        if (query.trim().length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        setShowSearchResults(true);

        try {
            const response = await fetch(`${KAKAO_API_URL}?query=${encodeURIComponent(query)}&size=10`, {
                method: 'GET',
                headers: {
                    'Authorization': `KakaoAK ${kakaoRestApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSearchResults(data.documents || []);
        } catch (error) {
            console.error('카카오맵 API 호출 에러:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };
    // ------------------------------------

    const handleSave = () => {
        if (!title.trim() || !location.trim() || !currentSelectedDate) {
            Alert.alert('알림', '제목, 위치, 날짜는 필수 입력 항목입니다.');
            return;
        }

        const scheduleData = {
            id: existingSchedule?.id || null,
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
        const deleteAction = () => onScheduleDelete(existingSchedule.id);

        Alert.alert(
            '일정 삭제', '정말로 이 이정을 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { text: '삭제', style: 'destructive', onPress: deleteAction }
            ]
        );
    };

    const handleMemoFocus = () => setMemoFocused(true);
    const handleMemoBlur = () => setMemoFocused(false);

    const handleOverlayPress = () => {
        if (showDateDropdown || showSearchResults) { // 검색 결과 창도 닫도록 조건 추가
            setShowDateDropdown(false);
            setShowSearchResults(false);
            Keyboard.dismiss(); // 키보드도 닫기
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
                        {/* --- 💡 4. 위치 입력과 검색 결과를 View로 감싸기 --- */}
                        <View style={{ zIndex: 1000 }}>
                            <ScheduleLocationInput
                                location={location}
                                setLocation={setLocation}
                                onChangeText={handleMeetLocationSearch}
                            />
                            {showSearchResults && (
                                <View style={styles.searchResultsContainer}>
                                    <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 150 }}>
                                        {isSearching ? (
                                             <Text style={styles.infoText}>검색 중...</Text>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((item, index) => (
                                                <TouchableOpacity
                                                    key={item.id || index}
                                                    onPress={() => {
                                                        setLocation(item.place_name);
                                                        setShowSearchResults(false);
                                                        Keyboard.dismiss();
                                                    }}
                                                    style={styles.searchResultItem}
                                                >
                                                    <Text style={styles.placeName}>{item.place_name}</Text>
                                                    <Text style={styles.addressName}>{item.address_name}</Text>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={styles.infoText}>검색 결과가 없습니다.</Text>
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                        {/* ------------------------------------------- */}
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

// --- 💡 5. 스타일 코드 수정 및 추가 ---
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
        maxHeight: '70%',
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
    },
    section: {
        marginBottom: 16,
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

const styles = StyleSheet.create({
    searchResultsContainer: {
        position: 'absolute',
        top: '100%', // 입력창 바로 아래에 위치
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginTop: 4, // 입력창과의 간격
    },
    searchResultItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    placeName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    addressName: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    infoText: {
        padding: 12,
        textAlign: 'center',
        color: '#666',
    }
});
// ------------------------------------

export default AddSchedule;