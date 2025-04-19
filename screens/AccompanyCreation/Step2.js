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
import Calendar from '../../components/Calendar';
import { formatDate, getDayOfWeek } from '../../utils/dateUtils';

const Step2 = ({ 
    maxPeople, setMaxPeople,
    recruitDateRange, setRecruitDateRange,
    selectedGenders, setSelectedGenders,
    selectedAges, setSelectedAges,
    selectedCategories, setSelectedCategories,
    tagInput, setTagInput,
    tags, setTags
}) => {
    const [recruitDateVisible, setRecruitDateVisible] = useState(false);
    const [isTagButtonEnabled, setIsTagButtonEnabled] = useState(false);
    
    useEffect(() => {
        setIsTagButtonEnabled(tagInput.trim().length > 0);
    }, [tagInput]);

    const handleRecruitDateSelect = (startDate, endDate) => {
        setRecruitDateRange({ 
            startDate, 
            endDate,
            startDay: getDayOfWeek(startDate),
            endDay: getDayOfWeek(endDate)
        });
        setRecruitDateVisible(false);
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
        <View style={styles.form}>
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
                />
                <Text style={styles.unitText}>명</Text>
            </View>
            
            <Text style={styles.label}>모집 기간</Text>
            <TouchableOpacity 
                onPress={() => setRecruitDateVisible(true)} 
                style={styles.dateInputRow}
            >
                <View style={styles.iconContainer}>
                    <FontAwesome6 name="calendar-check" size={14} color="black" />
                </View>
                <View style={styles.dateRangeContainer}>
                    <Text style={styles.dateText}>
                        {`${recruitDateRange.startDate} (${recruitDateRange.startDay || getDayOfWeek(recruitDateRange.startDate)})`}
                    </Text>
                    <Text style={styles.dateSeparator}>~</Text>
                    <Text style={styles.dateText}>
                        {`${recruitDateRange.endDate} (${recruitDateRange.endDay || getDayOfWeek(recruitDateRange.endDate)})`}
                    </Text>
                </View>
            </TouchableOpacity>
            
            {recruitDateVisible && (
                <Calendar 
                    visible={recruitDateVisible}
                    onSelect={handleRecruitDateSelect}
                    startDate={new Date(recruitDateRange.startDate)}
                    endDate={new Date(recruitDateRange.endDate)}
                />
            )}
            
            <Text style={styles.label}>동행 조건</Text>
            
            <View style={styles.conditionRow}>
                <Text style={styles.conditionLabelInline}> 성별</Text>
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
                <Text style={styles.conditionLabelInline}>연령대</Text>
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
                {tags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                        <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                            <Ionicons name="close-circle" size={16} color="#555" />
                        </TouchableOpacity>
                    </View>
                ))}
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
    },
    unitText: {
        fontSize: 14,
        color: '#000',
        marginLeft: 5,
    },
    dateInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
        width: '100%',
    },
    dateRangeContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 14,
        color: '#000',
    },
    dateSeparator: {
        fontSize: 14,
        color: '#000',
        marginHorizontal: 8,
    },
    conditionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    conditionLabelInline: {
        fontSize: 15,
        color: '#555',
        width: 50,
        marginTop: 6,
        marginLeft: 10
    },
    inlineChipContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    titleWithNoteContainer: {
        flexDirection: 'row',
        alignItems: 'center', 
        marginBottom: 8,
    },
    noteText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 10,
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
        marginRight: 8,
        marginBottom: 7,
    },
    chipSelected: {
        backgroundColor: '#222',
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
        color: 'FFF',
        marginRight: 5,
    },
});

export default Step2;