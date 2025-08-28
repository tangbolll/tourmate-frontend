import React, { useState, useRef, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export const SortToggle = ({ onSortChange, selectedTab = '찜' }) => {
    // getDefaultSort 함수를 먼저 정의
    const getDefaultSort = (tab) => {
        if (tab === '찜') {
            return 'closestTrip';
        } else { // 스크랩
            return 'newest';
        }
    };

    const [selectedSort, setSelectedSort] = useState(getDefaultSort(selectedTab));
    const [modalVisible, setModalVisible] = useState(false);
    const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    // 탭 변경 시 정렬 초기화
    useEffect(() => {
        const newDefaultSort = getDefaultSort(selectedTab);
        setSelectedSort(newDefaultSort);
        if (onSortChange) {
            onSortChange(newDefaultSort);
        }
    }, [selectedTab]);

    // 탭에 따라 다른 정렬 옵션 제공
    const getSortOptions = () => {
        if (selectedTab === '찜') {
            return [
                {
                    key: 'closestTrip',
                    label: '여행일 빠른순'
                },
                {
                    key: 'closestRecruitment',
                    label: '모집마감 임박순'
                },
                {
                    key: 'saved',
                    label: '저장한 동행순'
                }
            ];
        } else { // 스크랩
            return [
                {
                    key: 'newest',
                    label: '여행일 빠른 순'
                },
                {
                    key: 'oldest',
                    label: '저장한 엽서 순'
                }
            ];
        }
    };

    const sortOptions = getSortOptions();

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
                {/* TouchableWithoutFeedback 사용 */}
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={[
                            styles.dropdownContainer,
                            {
                                top: buttonPosition.y,
                                left: buttonPosition.x -90,
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
                                        <MaterialIcons name="check" size={18} color="#007AFF" style={{ marginLeft: 4 }} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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