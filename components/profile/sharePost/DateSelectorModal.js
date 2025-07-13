import React from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const DateSelectorModal = ({ 
    isVisible, 
    onClose, 
    availableDates, 
    onSelectDate 
}) => {
    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const selectDate = (date) => {
        onSelectDate(date);
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.dateModal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>여행 날짜 선택</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Feather name="x" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={styles.dateList}>
                        {availableDates.map((date, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.dateItem}
                                onPress={() => selectDate(date)}
                            >
                                <Text style={styles.dateItemText}>
                                    {formatDate(date)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateModal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        width: '80%',
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    dateList: {
        maxHeight: 200,
    },
    dateItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dateItemText: {
        fontSize: 16,
        color: '#333',
    },
});

export default DateSelectorModal;