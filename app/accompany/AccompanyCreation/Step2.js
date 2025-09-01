import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity,
    StyleSheet,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import CalendarPopup from '../../../components/accompany/CalendarPopup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import dayjs from 'dayjs';

const Step2 = ({ 
    maxPeople, setMaxPeople,
    recruitDateRange, setRecruitDateRange,
    selectedGenders, setSelectedGenders,
    selectedAges, setSelectedAges,
    selectedCategories, setSelectedCategories,
    tagInput, setTagInput,
    tags, setTags
}) => {
    const [isTagButtonEnabled, setIsTagButtonEnabled] = useState(false);
    
    // 모집 기간 관련 상태
    const [recruitStartDate, setRecruitStartDate] = useState(null);
    const [recruitEndDate, setRecruitEndDate] = useState(null);
    const [showRecruitCalendar, setShowRecruitCalendar] = useState(false);
    
    useEffect(() => {
        setIsTagButtonEnabled(tagInput.trim().length > 0);
    }, [tagInput]);

    // 모집 기간 날짜가 변경될 때마다 recruitDateRange 업데이트
    useEffect(() => {
        if (recruitStartDate && recruitEndDate) {
            const formattedStartDate = formatDateToString(recruitStartDate);
            const formattedEndDate = formatDateToString(recruitEndDate);
            setRecruitDateRange({
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                startDay: getDayOfWeek(recruitStartDate),
                endDay: getDayOfWeek(recruitEndDate)
            });
        }
    }, [recruitStartDate, recruitEndDate]);

    const formatDateToString = (date) => {
        return dayjs(date).format('YYYY-MM-DD');
    };

    const getDayOfWeek = (date) => {
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        return weekdays[dayjs(date).day()];
    };

    const formatDateForDisplay = (date) => {
        return dayjs(date).format('YYYY년 M월 D일 (dd)');
    };

    const handleRecruitDateSelect = (range) => {
        setRecruitStartDate(range.startDate);
        setRecruitEndDate(range.endDate);
        setShowRecruitCalendar(false);
    };

    const openRecruitCalendar = () => {
        setShowRecruitCalendar(true);
    };

    const getRecruitDateRangeText = () => {
        if (recruitStartDate && recruitEndDate) {
            return `${formatDateForDisplay(recruitStartDate)}   -   ${formatDateForDisplay(recruitEndDate)}`;
        } else if (recruitStartDate) {
            return `${formatDateForDisplay(recruitStartDate)} - 종료일 선택`;
        } else {
            return '모집기간을 선택해주세요.';
        }
    };
    
    // 성별 옵션
    const genderOptions = ['여자만', '남자만', '남녀무관'];
    
    // 연령대 옵션
    const ageOptions = ['20대', '30대', '40대', '50대 이상', '누구나'];
    
    // 카테고리 옵션
    const categoryOptions = ['투어', '식사', '야경', '사진', '쇼핑', '숙소', '교통', '테마파크', '액티비티', '힐링', '역사유적', '박물관/미술관'];
    
    const handleAddTag = () => {
        if (tagInput.trim()) {
            // 쉼표로 구분된 태그 처리
            const newTags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            // 현재 태그와 새 태그의 합이 5개를 초과할 경우
            if (tags.length + newTags.length > 5) {
                Alert.alert('알림', '태그는 최대 5개까지만 추가할 수 있습니다.');
                
                // 5개까지만 추가
                const tagsToAdd = newTags.slice(0, 5 - tags.length);
                setTags([...tags, ...tagsToAdd]);
            } else {
                setTags([...tags, ...newTags]);
            }
            
            setTagInput('');
        }
    };

    const handleRemoveTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };
    
    const handleGenderSelect = (gender) => {
        // 성별은 하나만 선택 가능
        setSelectedGenders([gender]);
    };
    
    const handleAgeSelect = (age) => {
        if (age === '누구나') {
            // '누구나' 선택 시 다른 모든 연령대 해제
            setSelectedAges(['누구나']);
        } else {
            // 이미 '누구나'가 선택되어 있으면 해제
            const newSelectedAges = selectedAges.filter(a => a !== '누구나');
            
            // 선택한 연령대 토글
            if (newSelectedAges.includes(age)) {
                setSelectedAges(newSelectedAges.filter(a => a !== age));
            } else {
                setSelectedAges([...newSelectedAges, age]);
            }
        }
    };
    
    const handleCategorySelect = (category) => {
        if (selectedCategories.includes(category)) {
            // 이미 선택된 카테고리면 해제
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            // 최대 3개까지만 선택 가능
            if (selectedCategories.length < 3) {
                setSelectedCategories([...selectedCategories, category]);
            } else {
                Alert.alert('알림', '카테고리는 최대 3개까지만 선택할 수 있습니다.');
            }
        }
    };
    
    return (
        <KeyboardAwareScrollView style={styles.form}>
            <Text style={styles.label}>모집 정원</Text>
            <View style={styles.splitInputRow}>
                <View style={styles.iconContainer}>
                    <Ionicons name="person" size={14} color="black" />
                </View>
                <TextInput
                    style={styles.numericInput}
                    placeholder="최대 모집인원 설정"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={maxPeople}
                    onChangeText={setMaxPeople}
                    textAlign={maxPeople ? "right" : "left"}
                />
                <Text style={styles.unitText}>명</Text>
            </View>
            
            <Text style={styles.label}>모집 기간</Text>
            <TouchableOpacity onPress={openRecruitCalendar} style={styles.inputWrapper}>
                <FontAwesome6 name="calendar-check" size={14} color="black" style={styles.icon} />
                <Text style={[styles.inputWithIcon, { 
                    color: recruitStartDate && recruitEndDate ? '#000' : '#888',
                    lineHeight: 16 
                }]}>
                    {getRecruitDateRangeText()}
                </Text>
            </TouchableOpacity>

            <CalendarPopup
                visible={showRecruitCalendar}
                onClose={() => setShowRecruitCalendar(false)}
                onSelectDates={handleRecruitDateSelect}
            />
            
            <Text style={styles.label}>동행 조건</Text>
            
            <View style={styles.conditionRow}>
                <Text style={styles.conditionLabelInline}>성별</Text>
                <View style={styles.inlineChipContainer}>
                    {genderOptions.map((gender) => (
                        <TouchableOpacity 
                            key={gender}
                            style={[
                                styles.chip, 
                                selectedGenders.includes(gender) && styles.chipSelected
                            ]}
                            onPress={() => handleGenderSelect(gender)}
                        >
                            <Text style={[
                                styles.chipText, 
                                selectedGenders.includes(gender) && styles.chipTextSelected
                            ]}>
                                {gender}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <View style={styles.conditionRow}>
                <Text style={styles.conditionLabelInline}>연령</Text>
                <View style={styles.inlineChipContainer}>
                    {ageOptions.map((age) => (
                        <TouchableOpacity 
                            key={age}
                            style={[
                                styles.chip, 
                                selectedAges.includes(age) && styles.chipSelected
                            ]}
                            onPress={() => handleAgeSelect(age)}
                        >
                            <Text style={[
                                styles.chipText, 
                                selectedAges.includes(age) && styles.chipTextSelected
                            ]}>
                                {age}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            
            <View style={styles.titleWithNoteContainer}>
                <Text style={styles.label}>카테고리</Text>
                <Text style={styles.noteText}>최대 3개까지 선택 가능</Text>
            </View>
            
            <View style={styles.chipContainer}>
                {categoryOptions.map((category) => (
                    <TouchableOpacity 
                        key={category}
                        style={[
                            styles.chip, 
                            selectedCategories.includes(category) && styles.chipSelected
                        ]}
                        onPress={() => handleCategorySelect(category)}
                    >
                        <Text style={[
                            styles.chipText, 
                            selectedCategories.includes(category) && styles.chipTextSelected
                        ]}>
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            <View style={styles.titleWithNoteContainer}>
                <Text style={styles.label}>태그(선택)</Text>
                <Text style={styles.noteText}>최대 5개까지 선택 가능</Text>
            </View>
            
            <View style={styles.tagInputRow}>
                <TextInput
                    style={styles.tagInput}
                    placeholder="키워드를 쉼표(,)로 구분하여 입력해주세요."
                    placeholderTextColor="#888"
                    value={tagInput}
                    onChangeText={setTagInput}
                />
                <TouchableOpacity 
                    style={[
                        styles.tagButton,
                        isTagButtonEnabled ? styles.tagButtonEnabled : styles.tagButtonDisabled
                    ]} 
                    onPress={handleAddTag}
                    disabled={!isTagButtonEnabled}
                >
                    <Text style={styles.tagButtonText}>등록</Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                    <View key={`${tag}-${index}`} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                            <Ionicons name="close-circle" size={16} color="#555" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </KeyboardAwareScrollView>
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
    splitInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    iconContainer: {
        paddingVertical: 12,
        marginRight: 10,
    },
    numericInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 12,
        color: '#000',
        height: 44,
    },
    unitText: {
        fontSize: 14,
        color: '#000',
        marginLeft: 5,
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
    inputWithIcon: {
        flex: 1,
        fontSize: 14,
        marginLeft: 8,
        color: '#000',
    },
    conditionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    conditionLabelInline: {
        fontSize: 15,
        color: '#555',
        width: 35,
        marginTop: 6,
        marginLeft: 6
    },
    inlineChipContainer: {
        // flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    titleWithNoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    noteText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 10,
        marginBottom: 2,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    chip: {
        height: 30,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        marginRight: 5,
        marginBottom: 7,
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
    tagInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 8,
    },
    tagInput: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 12,
        fontSize: 14,
        color: '#000',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        height: 44,
    },
    tagButton: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        width: 60,
    },
    tagButtonEnabled: {
        backgroundColor: '#222',
    },
    tagButtonDisabled: {
        backgroundColor: '#ccc',
    },
    tagButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        color: '#000',
        marginRight: 5,
    },
});

export default Step2;