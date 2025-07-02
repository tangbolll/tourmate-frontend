import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// 목 데이터
const mockFolderData = [
    {
        id: '1',
        folderName: 'Busan',
        startDate: '2024-01-01',
        endDate: '2024-01-07',
    },
    {
        id: '2',
        folderName: 'Seoul',
        startDate: '2024-02-10',
        endDate: '2024-02-15',
    },
    {
        id: '3',
        folderName: 'Jeju',
        startDate: '2024-03-20',
        endDate: '2024-03-25',
    },
    {
        id: '4',
        folderName: 'Gangneung',
        startDate: '2024-04-05',
        endDate: '2024-04-10',
    },
    {
        id: '5',
        folderName: 'Gyeongju',
        startDate: '2024-05-12',
        endDate: '2024-05-18',
    },
];

const SelectPostDirectoryPopup = ({ visible, onClose, onSelect, selectedFolder }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentSelected, setCurrentSelected] = useState(selectedFolder || mockFolderData[0]);

    const handleFolderSelect = (folder) => {
        setCurrentSelected(folder);
        setIsDropdownOpen(false);
    };

    const handleConfirm = () => {
        if (currentSelected) {
            onSelect(currentSelected);
        }
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const renderFolderItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.dropdownItem,
                currentSelected?.id === item.id && styles.selectedItem
            ]}
            onPress={() => handleFolderSelect(item)}
        >
            <Text style={[
                styles.dropdownItemText,
                currentSelected?.id === item.id && styles.selectedItemText
            ]}>
                {item.folderName}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <Text style={styles.title}>폴더 선택</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>×</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 설명 텍스트 */}
                    <Text style={styles.description}>
                        여행 엽서를 생성할 여행 폴더를 선택하세요.
                    </Text>

                    {/* 폴더 선택 드롭다운 */}
                    <View style={styles.inputContainer}>
                        <View style={styles.iconContainer}>
                            <Feather name="folder" size={20} color="#666" />
                        </View>
                        <View style={styles.dropdownWrapper}>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <Text style={styles.dropdownText}>
                                    {currentSelected?.folderName || '폴더를 선택하세요'}
                                </Text>
                                <Text style={styles.dropdownArrow}>
                                    {isDropdownOpen ? '▲' : '▼'}
                                </Text>
                            </TouchableOpacity>

                            {/* 드롭다운 리스트 */}
                            {isDropdownOpen && (
                                <View style={styles.dropdownList}>
                                    <FlatList
                                        data={mockFolderData}
                                        renderItem={renderFolderItem}
                                        keyExtractor={(item) => item.id}
                                        showsVerticalScrollIndicator={false}
                                        style={styles.flatList}
                                    />
                                </View>
                            )}
                        </View>
                    </View>

                    {/* 버튼 영역 */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Text style={styles.cancelButtonText}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>생성</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    closeText: {
        fontSize: 24,
        color: '#999',
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 25,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 30,
        position: 'relative',
        zIndex: 1000,
    },
    iconContainer: {
        width: 30,
        marginRight: 10,
        alignItems: 'center',
        paddingTop: 12,
    },
    dropdownWrapper: {
        flex: 1,
        position: 'relative',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    dropdownText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#999',
        marginLeft: 10,
    },
    dropdownList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ddd',
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        maxHeight: 200,
        zIndex: 1001,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    flatList: {
        maxHeight: 200,
    },
    dropdownItem: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
    },
    selectedItem: {
        backgroundColor: '#f0f8ff',
    },
    selectedItemText: {
        color: '#007AFF',
        fontWeight: '500',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
    },
    confirmButton: {
        flex: 1,
        backgroundColor: '#000',
        borderRadius: 25,
        paddingVertical: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default SelectPostDirectoryPopup;