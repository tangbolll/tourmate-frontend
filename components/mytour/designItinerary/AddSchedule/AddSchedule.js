import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import ScheduleHeader from './ScheduleHeader';
import ScheduleCategorySelector from './ScheduleCategorySelector';
import ScheduleDateInput from './ScheduleDateInput';
import ScheduleTimeInput from './ScheduleTimeInput';
import ScheduleLocationInput from './ScheduleLocationInput';
import ScheduleMemoInput from './ScheduleMemoInput';
import ScheduleActions from './ScheduleActions';
import Constants from 'expo-constants';

const { height: screenHeight } = Dimensions.get('window');

const AddSchedule = ({
    visible,
    onClose,
    onScheduleAdded,
    selectedDay,
    selectedDate,
    hour,
    minute,
    startTime: propStartTime,
    endTime: propEndTime,
    periodType,
    startDate,
    endDate,
    days,
    existingSchedule,
    onScheduleDelete,
    currentTourId,
    initialTitle = '',
    initialLocation = '',
}) => {
    const [category, setCategory] = useState('숙소');
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('07:00');
    const [endTime, setEndTime] = useState('08:00');
    const [location, setLocation] = useState(() => initialLocation || '');
    const [selectedLocationObject, setSelectedLocationObject] = useState(null);
    const [memo, setMemo] = useState('');
    const [currentSelectedDate, setCurrentSelectedDate] = useState('');
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    // const [memoHeight, setMemoHeight] = useState(40);
    const [memoFocused, setMemoFocused] = useState(false);

    const scrollViewRef = useRef(null);
    const prevInitialLocationRef = useRef('');
    const isEditMode = !!existingSchedule;
    const popupTitle = isEditMode ? '일정 수정' : '일정 추가';
    const isSaveEnabled = title.trim() && location.trim() && currentSelectedDate;

    const kakaoRestApiKey = Constants.expoConfig.extra.kakaoRestApiKey;
    const KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

    const categories = [
        { key: '숙소', label: '숙소', icon: 'home', color: '#FFD965' },
        { key: '식사', label: '식사', icon: 'coffee', color: '#FF9E6D' },
        { key: '관광', label: '관광', icon: 'camera', color: '#A3C8E9' },
        { key: '휴식', label: '휴식', icon: 'pause-circle', color: '#C6D6C3' }
    ];

    const availableDates = useMemo(() => {
        const dateList = [];
        if (periodType === 'date' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
                const dayName = dayNames[date.getDay()];
                dateList.push({ value: date.toISOString().split('T')[0], label: `${year}-${month}-${day} (${dayName})` });
            }
        } else if (periodType === 'duration' && days) {
            for (let i = 1; i <= days; i++) {
                dateList.push({ value: `${i}일차`, label: `${i}일차` });
            }
        }
        return dateList;
    }, [periodType, startDate, endDate, days]);

    const performInitialSearch = useCallback(async (query) => {
        if (!query || query.trim().length === 0) return;
        try {
            const response = await fetch(`${KAKAO_API_URL}?query=${encodeURIComponent(query)}&size=1`, {
                headers: { 'Authorization': `KakaoAK ${kakaoRestApiKey}` }
            });
            if (!response.ok) throw new Error(`Kakao API search failed with status: ${response.status}`);
            const data = await response.json();
            if (data.documents && data.documents.length > 0) {
                const firstResult = data.documents[0];
                setLocation(firstResult.place_name);
                setSelectedLocationObject(firstResult);
            } else {
                setLocation(query);
                setSelectedLocationObject(null);
            }
        } catch (error) {
            console.log('Initial search error:', error);
            setLocation(query);
            setSelectedLocationObject(null);
        }
    }, [kakaoRestApiKey, KAKAO_API_URL]);

    useEffect(() => {
        if (!visible) {
            setCategory('숙소');
            setTitle('');
            setStartTime('07:00');
            setEndTime('08:00');
            setLocation('');
            setSelectedLocationObject(null);
            setMemo('');
            setCurrentSelectedDate('');
            setShowDateDropdown(false);
            setShowSearchResults(false);
            setSearchResults([]);
            return;
        }

        if (existingSchedule) {
            const locationData = existingSchedule.location;
            if (typeof locationData === 'object' && locationData !== null && locationData.place_name) {
                setLocation(locationData.place_name);
                setSelectedLocationObject(locationData);
            } else {
                setLocation(locationData || '');
                setSelectedLocationObject(null);
            }
            setTitle(existingSchedule.title || '');
            setMemo(existingSchedule.memo || '');
            setCategory(existingSchedule.tag || '숙소');
            setStartTime(existingSchedule.startTime || '07:00');
            setEndTime(existingSchedule.endTime || '08:00');
            setCurrentSelectedDate(existingSchedule.date || existingSchedule.dayDescription || '');
        } else {
            const defaultStartTime = propStartTime || (hour !== undefined && minute !== undefined ? `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}` : '07:00');
            const defaultEndTime = propEndTime || (hour !== undefined && minute !== undefined ? `${String((hour + 1) % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}` : '08:00');
            const defaultDate = selectedDate || (selectedDay && availableDates[selectedDay - 1] ? availableDates[selectedDay - 1].value : (availableDates.length > 0 ? availableDates[0].value : ''));

            setTitle(initialTitle);
            setMemo('');
            setCategory('숙소');
            setStartTime(defaultStartTime);
            setEndTime(defaultEndTime);
            setCurrentSelectedDate(defaultDate);

            if (initialLocation && initialLocation.trim() && prevInitialLocationRef.current !== initialLocation) {
                prevInitialLocationRef.current = initialLocation;
                performInitialSearch(initialLocation);
            }
        }
    }, [visible, existingSchedule, initialLocation, performInitialSearch, propStartTime, propEndTime, selectedDate, selectedDay, availableDates, hour, minute]);

    // 키보드가 올라올 때 항상 맨 아래로 스크롤
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        });
        return () => keyboardDidShowListener.remove();
    }, []);

    const handleMemoFocus = useCallback(() => {
        setMemoFocused(true);
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const handleMemoBlur = useCallback(() => setMemoFocused(false), []);

    const handleLocationFocus = useCallback(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, []);

    const handleLocationSearch = useCallback(async (query) => {
        setLocation(query);
        setSelectedLocationObject(null);
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
                headers: { 'Authorization': `KakaoAK ${kakaoRestApiKey}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setSearchResults(data.documents || []);
        } catch (error) {
            console.log('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [kakaoRestApiKey, KAKAO_API_URL]);

    const handleLocationSelect = useCallback((item) => {
        setLocation(item.place_name);
        setSelectedLocationObject(item);
        setShowSearchResults(false);
        Keyboard.dismiss();
    }, []);

    const handleSave = useCallback(() => {
        if (!title.trim() || !location.trim() || !currentSelectedDate) {
            Alert.alert('알림', '제목, 위치, 날짜는 필수 입력 항목입니다.');
            return;
        }
        const timeToMinutes = (timeString) => {
            const [hours, minutes] = timeString.split(':').map(Number);
            return hours * 60 + minutes;
        };
        if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
            Alert.alert('오류', '종료 시간은 시작 시간보다 늦어야 합니다.');
            return;
        }
        const datePayload = currentSelectedDate.includes('일차')
            ? { date: null, dayDescription: currentSelectedDate }
            : { date: currentSelectedDate, dayDescription: null };

        const scheduleData = {
            id: existingSchedule?.id || null,
            tag: category,
            title: title.trim(),
            startTime,
            endTime,
            location: selectedLocationObject || location.trim(),
            memo: memo.trim(),
            travelId: currentTourId,
            ...datePayload,
        };
        onScheduleAdded(scheduleData);
        onClose();
    }, [title, location, currentSelectedDate, startTime, endTime, category, selectedLocationObject, memo, existingSchedule?.id, currentTourId, onScheduleAdded, onClose]);

    const handleDelete = useCallback(() => {
        if (onScheduleDelete && existingSchedule?.id) {
            Alert.alert('일정 삭제', '정말로 이 일정을 삭제하시겠습니까?', [
                { text: '취소', style: 'cancel' },
                { text: '삭제', style: 'destructive', onPress: () => onScheduleDelete(existingSchedule.id) }
            ]);
        } else {
            Alert.alert('오류', '삭제할 일정이 없거나 삭제 함수가 전달되지 않았습니다.');
        }
    }, [onScheduleDelete, existingSchedule?.id]);

    const handleOverlayPress = useCallback(() => {
        if (showDateDropdown || showSearchResults) {
            setShowDateDropdown(false);
            setShowSearchResults(false);
            Keyboard.dismiss();
        } else {
            onClose();
        }
    }, [showDateDropdown, showSearchResults, onClose]);

    const locationInputProps = useMemo(() => ({
        location,
        setLocation,
        onChangeText: handleLocationSearch,
        onFocus: handleLocationFocus
    }), [location, handleLocationSearch, handleLocationFocus]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <TouchableOpacity style={commonStyles.overlay} activeOpacity={1} onPress={handleOverlayPress}>
                    <TouchableOpacity style={[commonStyles.container, { maxHeight: '80%' }]} activeOpacity={1}>
                        <ScheduleHeader title={popupTitle} onClose={onClose} />
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
                            <ScheduleCategorySelector categories={categories} selectedCategory={category} onSelectCategory={setCategory} />
                            <ScheduleDateInput
                                currentSelectedDate={currentSelectedDate}
                                availableDates={availableDates}
                                showDateDropdown={showDateDropdown}
                                setShowDateDropdown={setShowDateDropdown}
                                handleDateSelect={setCurrentSelectedDate}
                            />
                            <ScheduleTimeInput startTime={startTime} setStartTime={setStartTime} endTime={endTime} setEndTime={setEndTime} />
                            <View style={{ zIndex: 1000, position: 'relative' }}>
                                <ScheduleLocationInput {...locationInputProps} />
                                {showSearchResults && (
                                    <View style={styles.searchResultsContainer}>
                                        <ScrollView
                                            nestedScrollEnabled={true} // 중첩 스크롤 허용
                                            keyboardShouldPersistTaps="handled"
                                        >
                                            {isSearching ? (
                                                <Text style={styles.infoText}>검색 중...</Text>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map((item, index) => (
                                                    <TouchableOpacity
                                                        key={item.id || index}
                                                        onPress={() => handleLocationSelect(item)}
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
                            <ScheduleMemoInput
                                memo={memo}
                                setMemo={setMemo}
                                // memoHeight={memoHeight}
                                // setMemoHeight={setMemoHeight}
                                onFocus={handleMemoFocus}
                                onBlur={handleMemoBlur}
                            />
                        </ScrollView>
                        <ScheduleActions isEditMode={isEditMode} isSaveEnabled={isSaveEnabled} onDelete={handleDelete} onSave={handleSave} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
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
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginTop: 4,
        zIndex: 10000,
        elevation: 10000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        maxHeight: 200, // 컨테이너 자체에 최대 높이 지정
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

export default AddSchedule;
