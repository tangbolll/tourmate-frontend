import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ScheduleActions = ({ isEditMode, isSaveEnabled, onDelete, onSave }) => {
    return (
        <View style={commonStyles.buttonContainer}>
            {isEditMode && (
                <TouchableOpacity 
                    style={commonStyles.deleteButton}
                    onPress={onDelete}
                >
                    <Text style={commonStyles.deleteButtonText}>삭제</Text>
                </TouchableOpacity>
            )}
            
            <TouchableOpacity 
                style={[
                    commonStyles.saveButton,
                    !isSaveEnabled && commonStyles.saveButtonDisabled,
                    isEditMode && commonStyles.saveButtonWithDelete
                ]} 
                onPress={onSave}
                disabled={!isSaveEnabled}
            >
                <Text style={[
                    commonStyles.saveButtonText,
                    !isSaveEnabled && commonStyles.saveButtonTextDisabled
                ]}>
                    저장
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const commonStyles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 12,
    },
    deleteButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#000',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonWithDelete: {
        flex: 2,
    },
    saveButtonDisabled: {
        backgroundColor: '#CCCCCC',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButtonTextDisabled: {
        color: '#999',
    },
});

export default ScheduleActions;