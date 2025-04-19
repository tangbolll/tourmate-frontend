import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity,
    StyleSheet,
    ScrollView
} from 'react-native';
import { MaterialIcons } from 'react-native-vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Calendar from '../../components/Calendar';
import ImageSelector from '../../components/ImageSelector';
import { formatDate, getDayOfWeek } from '../../utils/dateUtils';

const Step1 = ({ 
    title, setTitle, 
    location, setLocation, 
    dateRange, setDateRange, 
    description, setDescription, 
    meetLocation, setMeetLocation, 
    images, setImages, 
    thumbnailIndex, setThumbnailIndex
}) => {
    const [dateVisible, setDateVisible] = useState(false);
    
    const handleDateSelect = (startDate, endDate) => {
        setDateRange({ 
            startDate, 
            endDate,
            startDay: getDayOfWeek(startDate),
            endDay: getDayOfWeek(endDate)
        });
        setDateVisible(false);
    };
    
    return (
        <View style={styles.form}>
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
                <MaterialIcons name="location-pin" size={20} color="#555" />
                <TextInput
                    style={styles.inputWithIcon}
                    placeholder="여행장소를 입력해주세요."
                    placeholderTextColor="#555"
                    value={location}
                    onChangeText={setLocation}
                />
            </View>
            
            <Text style={styles.label}>여행기간</Text>
            <TouchableOpacity onPress={() => setDateVisible(true)} style={styles.inputWrapper}>
                <FontAwesome6 name="calendar-check" size={16} color="black" style={styles.icon} />
                <Text style={[styles.inputWithIcon, { color: dateRange.startDate ? '#000' : '#888' }]}>
                    {dateRange.startDate 
                        ? `${dateRange.startDate} (${dateRange.startDay}) ~ ${dateRange.endDate} (${dateRange.endDay})` 
                        : '여행기간을 선택해주세요.'}
                </Text>
            </TouchableOpacity>
            
            {dateVisible && (
                <Calendar 
                    visible={dateVisible}
                    onSelect={handleDateSelect}
                    startDate={dateRange.startDate ? new Date(dateRange.startDate) : null}
                    endDate={dateRange.endDate ? new Date(dateRange.endDate) : null}
                />
            )}

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
                <MaterialIcons name="location-pin" size={20} color="#555" />
                <TextInput
                    style={styles.inputWithIcon}
                    placeholder="위치 추가"
                    placeholderTextColor="#888"
                    value={meetLocation}
                    onChangeText={setMeetLocation}
                />
            </View>
        </View>
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
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 12,
        color: '#000',
    },
    inputWithIcon: {
        flex: 1,
        fontSize: 16,
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