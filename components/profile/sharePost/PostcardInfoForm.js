import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PostcardInfoForm = ({ 
    postcardDetails, 
    onUpdateDetail, 
    onOpenDateModal 
}) => {
    const formatDate = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <View style={styles.inputSection}>
            {/* 엽서 제목 */}
            <View style={styles.inputGroup}>
                <TextInput
                    style={styles.titleInput}
                    placeholder="엽서 제목 (최대 20자)"
                    placeholderTextColor="#999"
                    value={postcardDetails.title || ''}
                    onChangeText={(text) => onUpdateDetail('title', text)}
                    maxLength={20}
                />
            </View>

            {/* 여행 장소와 날짜 */}
            <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                    <View style={styles.inputWithIcon}>
                        <Feather name="map-pin" size={16} color="#000" style={styles.inputIcon} />
                        <TextInput
                            style={styles.textInputWithIcon}
                            placeholder="여행장소"
                            placeholderTextColor="#999"
                            value={postcardDetails.location || ''}
                            onChangeText={(text) => onUpdateDetail('location', text)}
                        />
                    </View>
                </View>
                
                <View style={styles.inputHalf}>
                    <TouchableOpacity
                        style={styles.dateSelector}
                        onPress={onOpenDateModal}
                    >
                        <View style={styles.dateSelectorContent}>
                            <Feather name="calendar" size={16} color="#000" style={styles.inputIcon} />
                            <Text style={[
                                styles.dateText,
                                !postcardDetails.date && styles.placeholder
                            ]}>
                                {postcardDetails.date ? formatDate(postcardDetails.date) : '여행날짜'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputSection: {
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 12,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputHalf: {
        flex: 1,
    },
    titleInput: {
        marginHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: '#000',
        padding: 12,
        fontSize: 18,
        backgroundColor: '#fff',
        textAlign: 'center'
    },
    inputWithIcon: {
        height: 42,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
    },
    textInputWithIcon: {
        flex: 1,
        height: 42,
        fontSize: 16,
        padding: 8,
        paddingLeft: 8,
    },
    inputIcon: {
        marginRight: 0,
    },
    dateSelector: {
        height: 42,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
    },
    dateSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
    },
    placeholder: {
        color: '#999',
    },
});

export default PostcardInfoForm;