import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import DayPicker from '../../../components/accompany/DayPicker';
import ImageSelector from '../../../components/accompany/ImageSelector';

const Step1 = ({ 
    title, setTitle, 
    location, setLocation, 
    dateRange, setDateRange, 
    description, setDescription, 
    meetLocation, setMeetLocation, 
    images, setImages, 
    thumbnailIndex, setThumbnailIndex
}) => {
    const [locationInput, setLocationInput] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectingDateType, setSelectingDateType] = useState('start');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // 날짜가 변경될 때마다 dateRange 업데이트
    useEffect(() => {
        if (startDate && endDate) {
            const formattedStartDate = formatDateToString(startDate);
            const formattedEndDate = formatDateToString(endDate);
            setDateRange({
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                startDay: getDayOfWeek(startDate),
                endDay: getDayOfWeek(endDate)
            });
        }
    }, [startDate, endDate]);

    const formatDateToString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDayOfWeek = (date) => {
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        return weekdays[date.getDay()];
    };

    const formatDateForDisplay = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekday = weekdays[date.getDay()];
        return `${year}년 ${month}월 ${day}일 (${weekday})`;
    };

    const handleDateSelect = (day) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        
        if (selectingDateType === 'start') {
            setStartDate(selectedDate);
            // 시작일이 끝일보다 늦으면 끝일을 시작일과 같게 설정
            if (endDate && selectedDate > endDate) {
                setEndDate(selectedDate);
            }
            // 시작일 선택 후 자동으로 종료일 선택 모드로 전환
            setSelectingDateType('end');
        } else {
            // 끝일 선택 시 시작일보다 이른 날짜는 선택 불가
            if (startDate && selectedDate < startDate) {
                return; // 선택 불가
            }
            setEndDate(selectedDate);
            setShowCalendar(false);
        }
    };

    const openCalendar = () => {
        setSelectingDateType('start');
        setShowCalendar(true);
    };

    const handleLocationChange = (text) => {
        setLocationInput(text);
        setLocation(text);
    };

    const getDateRangeText = () => {
        if (startDate && endDate) {
            return `${formatDateForDisplay(startDate)}   -   ${formatDateForDisplay(endDate)}`;
        } else if (startDate) {
            return `${formatDateForDisplay(startDate)} - 종료일 선택`;
        } else {
            return '여행기간을 선택해주세요.';
        }
    };

    return (
        <ScrollView style={styles.form}>
            <Text style={styles.label}>동행 제목</Text>
            <TextInput
                style={styles.input}
                placeholder="동행명을 작성해주세요. (최소 10자, 최대 30자)"
                placeholderTextColor="#888"
                value={title}
                onChangeText={setTitle}
                maxLength={30}
            />

            <Text style={styles.label}>여행장소</Text>
            <View style={styles.inputWrapper}>
                <MaterialIcons name="location-pin" size={16} color="black" style={styles.icon} />
                <TextInput
                    style={styles.inputWithIcon}
                    placeholder="여행장소를 입력해주세요."
                    placeholderTextColor="#888"
                    value={locationInput} 
                    onChangeText={handleLocationChange}
                />
            </View>
            
            <Text style={styles.label}>여행기간</Text>
            <TouchableOpacity onPress={openCalendar} style={styles.inputWrapper}>
                <FontAwesome6 name="calendar-check" size={14} color="black" style={styles.icon} />
                <Text style={[styles.inputWithIcon, { 
                    color: startDate && endDate ? '#000' : '#888',
                    lineHeight: 16 
                }]}>
                    {getDateRangeText()}
                </Text>
            </TouchableOpacity>

            {/* DayPicker 컴포넌트 */}
            <DayPicker
                visible={showCalendar}
                onClose={() => setShowCalendar(false)}
                onDateSelect={handleDateSelect}
                selectedStartDate={startDate}
                selectedEndDate={endDate}
                selectingDateType={selectingDateType}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                title={selectingDateType === 'start' ? '여행 시작일 선택' : '여행 종료일 선택'}
            />

            <Text style={styles.label}>동행소개</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                placeholder="동행에 대한 상세 정보를 입력해주세요."
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
            />
            <Text style={styles.counter}>{description.length} / 최소 20자</Text>

            <ImageSelector 
                images={images}
                setImages={setImages}
                thumbnailIndex={thumbnailIndex}
                setThumbnailIndex={setThumbnailIndex}
                maxImgCount={10}
            />

            <Text style={styles.label}>모이는 장소</Text>
            <View style={styles.inputWrapper}>
                <MaterialIcons name="location-pin" size={14} color="#555" />
                <TextInput
                    style={styles.inputWithIcon}
                    placeholder="위치 추가"
                    placeholderTextColor="#888"
                    value={meetLocation}
                    onChangeText={setMeetLocation}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        marginTop: 5,
        marginBottom: 8
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginBottom: 12,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        fontSize: 14,
        marginBottom: 12,
        color: '#000',
    },
    inputWithIcon: {
        flex: 1,
        fontSize: 14,
        marginLeft: 8,
        color: '#000',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    counter: {
        alignSelf: 'flex-end',
        color: '#888',
        marginTop: -8
    },
});

export default Step1;