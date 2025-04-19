import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';

// 단일 칩 컴포넌트
export const Chip = ({ label, selected, onPress, disabled = false }) => (
    <TouchableOpacity 
        style={[
            styles.chip, 
            selected && styles.chipSelected,
            disabled && styles.chipDisabled
        ]}
        onPress={onPress}
        disabled={disabled}
    >
        <Text style={[
            styles.chipText, 
            selected && styles.chipTextSelected,
            disabled && styles.chipTextDisabled
        ]}>
            {label}
        </Text>
    </TouchableOpacity>
);

// 칩 그룹 컴포넌트 (성별, 연령대, 카테고리 등에 사용)
export const ChipGroup = ({ 
    title, 
    items, 
    selectedItems, 
    onToggleItem, 
    maxSelection = null,
    row = true,
    rightLabel = null
}) => {
    const handleToggle = (item) => {
        // 이미 선택된 항목이면 선택 해제
        if (selectedItems.includes(item)) {
            onToggleItem(selectedItems.filter(i => i !== item));
            return;
        }
        
        // 최대 선택 가능 개수 체크
        if (maxSelection && selectedItems.length >= maxSelection) {
            Alert.alert("알림", `최대 ${maxSelection}개까지 선택할 수 있습니다.`);
            return;
        }
        
        onToggleItem([...selectedItems, item]);
    };

    return (
        <View style={styles.chipGroupContainer}>
            {title && (
                <View style={styles.chipGroupHeader}>
                    <Text style={styles.chipGroupTitle}>{title}</Text>
                    {rightLabel && <Text style={styles.chipGroupRightLabel}>{rightLabel}</Text>}
                </View>
            )}
            <View style={[
                styles.chipList,
                row ? styles.chipListRow : styles.chipListGrid
            ]}>
                {items.map((item, index) => (
                    <Chip
                        key={index}
                        label={item}
                        selected={selectedItems.includes(item)}
                        onPress={() => handleToggle(item)}
                    />
                ))}
            </View>
        </View>
    );
};

// 태그 입력 및 표시 컴포넌트
export const TagInput = ({ 
    tags, 
    setTags, 
    tagInput, 
    setTagInput, 
    maxTagCount = 5 
}) => {
    const handleAddTags = () => {
        if (!tagInput.trim()) return;
        
        // 쉼표로 구분된 태그들을 배열로 변환
        const newTags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        
        // 최대 태그 개수 제한
        if (tags.length + newTags.length > maxTagCount) {
            Alert.alert("알림", `태그는 최대 ${maxTagCount}개까지 추가할 수 있습니다.`);
            return;
        }
        
        setTags([...tags, ...newTags]);
        setTagInput('');
    };
    
    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const renderTag = ({ item, index }) => (
        <View style={styles.tagChip}>
            <Text style={styles.tagText}>{item}</Text>
            <TouchableOpacity onPress={() => removeTag(index)}>
                <Text style={styles.tagRemove}>×</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View>
            <View style={styles.tagInputContainer}>
                <TextInput
                    style={styles.tagInput}
                    placeholder="태그를 입력하고 등록 (쉼표로 구분)"
                    placeholderTextColor="#888"
                    value={tagInput}
                    onChangeText={setTagInput}
                />
                <TouchableOpacity style={styles.tagAddButton} onPress={handleAddTags}>
                    <Text style={styles.tagAddButtonText}>등록</Text>
                </TouchableOpacity>
            </View>
            
            {tags.length > 0 && (
                <FlatList
                    data={tags}
                    horizontal
                    renderItem={renderTag}
                    keyExtractor={(item, index) => index.toString()}
                    style={styles.tagList}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8
    },
    chipSelected: {
        backgroundColor: '#000'
    },
    chipDisabled: {
        backgroundColor: '#e0e0e0',
        opacity: 0.6
    },
    chipText: {
        fontSize: 14,
        color: '#555'
    },
    chipTextSelected: {
        color: '#fff'
    },
    chipTextDisabled: {
        color: '#999'
    },
    chipGroupContainer: {
        marginBottom: 15
    },
    chipGroupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    chipGroupTitle: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    chipGroupRightLabel: {
        fontSize: 12,
        color: '#888'
    },
    chipList: {
        marginBottom: 5
    },
    chipListRow: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    chipListGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    tagInputContainer: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        height: 48,
        marginBottom: 12,
    },
    tagInput: {
        flex: 1,
        paddingHorizontal: 12,
        fontSize: 14,
    },
    tagAddButton: {
        backgroundColor: '#3366ff',
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
    tagAddButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    tagList: {
        marginBottom: 15
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 8
    },
    tagText: {
        fontSize: 14,
        marginRight: 5
    },
    tagRemove: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555'
    }
});

export default { Chip, ChipGroup, TagInput };