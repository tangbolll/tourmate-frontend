import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import CalendarPopup from './CalendarPopup';
import dayjs from 'dayjs';

const FilterPopup = ({ visible, onClose = () => {}, onApply, filters, setFilters, onOpenCalendar }) => {
    const { gender, age, categories, travelPeriod, travelLocation } = filters;
    const [calendarVisible, setCalendarVisible] = useState(false);

    const toggleCategory = (category) => {
        const newCategories = categories.includes(category)
        ? categories.filter((c) => c !== category)
        : [...categories, category];
        setFilters({ ...filters, categories: newCategories });
    };

    const toggleGender = (value) => {
        setFilters({ ...filters, gender: gender === value ? '' : value });
    };

    const toggleAge = (value) => {
        setFilters({ ...filters, age: age === value ? '' : value });
    };

    const setTravelPeriod = (value) => setFilters({ ...filters, travelPeriod: value });
    const setTravelLocation = (value) => setFilters({ ...filters, travelLocation: value });

    // 날짜 삭제 함수 추가
    const clearTravelPeriod = () => {
        setFilters({ ...filters, travelPeriod: null });
    };

    const applyFilters = () => {
        if (onApply) {
            onApply({ ...filters }); // 최신값 복사
        }
        onClose();
    };

    const openCalendar = () => {
        console.log("캘린더 여는 중 ✅");
        setCalendarVisible(true);
    };

    const closeCalendar = () => {
        console.log("Closing calendar");
        setCalendarVisible(false);
    };

    const categoryList = [
        '투어', '식사', '야경', '사진', '쇼핑', '숙소', '교통', '테마파크', '스포츠 관람', '액티비티', '힐링', '역사유적', '박물관/미술관'
    ];

    const handleCalendarSelect = ({ startDate, endDate }) => {
        if (startDate && endDate) {
            // 문자열로 보여주고 싶으면 formatted 따로 만들어서 UI에만 사용
            const formatted = `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`;
            
            // filters에는 실제 Date 객체로 저장
            setFilters({ 
                ...filters, 
                travelPeriod: { startDate, endDate, formatted } 
            });
        } else {
            setFilters({ ...filters, travelPeriod: null });
        }
        setCalendarVisible(false);
    };

    return (
        <>
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
            onDismiss={() => {
            setCalendarVisible(false);
            }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>필터</Text>
                    <TouchableOpacity 
                        onPress={onClose}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                    <Icon name="close" size={18} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Travel Period */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>동행기간</Text>
                    <TouchableOpacity
                        onPress={() => setCalendarVisible(true)}
                        style={styles.inputContainer}
                    >
                        <Icon name="calendar-check" size={18} color="black" style={styles.inputIcon} />
                        <Text style={[styles.input, !travelPeriod && styles.placeholder]}>
                            {travelPeriod?.formatted || "여행기간을 선택해주세요."}
                        </Text>
                        {/* X 버튼 추가 */}
                        {travelPeriod && (
                            <TouchableOpacity 
                                onPress={clearTravelPeriod}
                                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                                style={styles.clearButton}
                            >
                                <Icon name="close" size={16} color="#777" />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    <CalendarPopup
                        visible={calendarVisible}
                        onClose={() => setCalendarVisible(false)}
                        onSelectDates={handleCalendarSelect}
                    />
                </View>

                {/* Location */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>동행장소</Text>
                    <View style={styles.inputContainer}>
                    <Icon2 name="location-on" size={18} color="black" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="동행장소를 입력해주세요."
                        placeholderTextColor="#777"
                        value={travelLocation}
                        onChangeText={setTravelLocation}
                    />
                    </View>
                </View>

                <View>
                    <Text style={styles.sectionTitle}>동행 조건</Text>
                    {/* Gender - 성별 값 매핑 수정 */}
                    <View style={styles.conditionRow}>
                        <Text style={styles.conditionLabelInline}>성별</Text>
                        <View style={styles.chipContainer}>
                        {[
                            { label: '여자만', value: '여성만' },
                            { label: '남자만', value: '남성만' }, 
                            { label: '성별무관', value: '성별무관' }
                        ].map((item) => (
                            <TouchableOpacity
                            key={item.value}
                            style={[styles.chip, gender === item.value && styles.chipSelected]}
                            onPress={() => toggleGender(item.value)}
                            activeOpacity={0.7}
                            >
                            <Text style={[styles.chipText, gender === item.value && styles.chipTextSelected]}>{item.label}</Text>
                            </TouchableOpacity>
                        ))}
                        </View>
                    </View>
                </View>

                {/* Age */}
                <View style={styles.conditionRow}>
                    <Text style={styles.conditionLabelInline}>연령</Text>
                    <View style={styles.chipContainer}>
                    {['20대', '30대', '40대', '50대 이상', '나이무관'].map((item) => (
                        <TouchableOpacity
                        key={item}
                        style={[styles.chip, age === item && styles.chipSelected]}
                        onPress={() => toggleAge(item)}
                        activeOpacity={0.7}
                        >
                        <Text style={[styles.chipText, age === item && styles.chipTextSelected]}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                    </View>
                </View>

                {/* Categories */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>카테고리</Text>
                    <View style={styles.categoriesContainer}>
                    {categoryList.map((category) => (
                        <TouchableOpacity
                        key={category}
                        style={[styles.chip, categories.includes(category) && styles.chipSelected]}
                        onPress={() => toggleCategory(category)}
                        activeOpacity={0.7}
                        >
                        <Text style={[styles.chipText, categories.includes(category) && styles.chipTextSelected]}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                    </View>
                </View>

                <TouchableOpacity 
                    style={styles.applyButton} 
                    onPress={applyFilters}
                    activeOpacity={0.7}
                >
                    <Text style={styles.applyButtonText}>적용하기</Text>
                </TouchableOpacity>
                </View>
            </View>
            </TouchableWithoutFeedback>
        </Modal>

        {/* 캘린더 팝업 */}
        <CalendarPopup
            visible={calendarVisible}
            onClose={closeCalendar}
            onSelectDates={handleCalendarSelect}
        />
        </>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalView: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    sectionContainer: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        marginTop: 5,
        marginBottom: 8
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: '#000',
        fontSize: 14,
    },
    placeholder: {
        color: '#777',
    },
    clearButton: {
        padding: 4,
    },
    conditionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    conditionLabelInline: {
        fontSize: 15,
        color: '#555',
        width: 38,
        marginTop: 6,
        marginLeft: 6
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        height: 30,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        marginRight: 5,
        marginBottom: 7,
        justifyContent: 'center', // 수직 중앙 정렬
        alignItems: 'center',     // 수평 중앙 정렬
    },
    chipSelected: {
        backgroundColor: '#222',
        borderColor: 'black'
    },
    chipText: {
        color: '#555',
    },
    chipTextSelected: {
        color: '#FFF',
    },
    categoriesContainer: {
        marginTop: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    applyButton: {
        backgroundColor: 'black',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default FilterPopup;