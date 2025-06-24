import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    StyleSheet,
    Dimensions 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const SortToggle = ({ onSortChange, defaultSort = 'latest' }) => {
    const [selectedSort, setSelectedSort] = useState(defaultSort);
    const [modalVisible, setModalVisible] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    const sortOptions = [
        {
            key: 'latest',
            label: '최신 여행순'
        },
        {
            key: 'oldest',
            label: '지난 여행순'
        }
    ];

    const handleSortPress = () => {
        // 버튼 위치 측정
        buttonRef.current?.measure((fx, fy, width, height, px, py) => {
            setButtonPosition({ x: px, y: py + height + 4 }); // 4px 간격 추가
            setModalVisible(true);
        });
    };

    const handleSortSelect = (key) => {
        setSelectedSort(key);
        setModalVisible(false);
        if (onSortChange) {
            onSortChange(key);
        }
    };

    return (
        <View>
            {/* 정렬 아이콘만 */}
            <TouchableOpacity 
                ref={buttonRef}
                style={styles.sortButton} 
                onPress={handleSortPress}
            >
                <MaterialIcons name="import-export" size={24} color="#666" />
            </TouchableOpacity>

            {/* 드롭다운 모달 */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[
                        styles.dropdownContainer,
                        {
                            top: buttonPosition.y,
                            left: buttonPosition.x - 50,
                        }
                    ]}>
                        {sortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.dropdownItem,
                                    // 마지막 항목의 경우 하단 테두리 제거
                                    sortOptions[sortOptions.length - 1].key === option.key && 
                                    { borderBottomWidth: 0 }
                                ]}
                                onPress={() => handleSortSelect(option.key)}
                            >
                                <Text style={[
                                    styles.dropdownText,
                                    selectedSort === option.key && styles.selectedText
                                ]}>
                                    {option.label}
                                </Text>
                                {selectedSort === option.key && (
                                    <MaterialIcons name="check" size={18} color="#007AFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

// 스타일 정의
const styles = StyleSheet.create({
    sortButton: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    dropdownContainer: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 8,
        minWidth: 120,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dropdownText: {
        fontSize: 14,
        color: '#333',
    },
    selectedText: {
        color: '#007AFF',
        fontWeight: '600',
    },
});