import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const AlarmItem = ({ 
    userName, 
    userImage, 
    timeAgo, 
    message, 
    actionType, 
    actionText, 
    secondActionText 
}) => {
    const handleFirstAction = () => {
        console.log(`${actionType} 첫 번째 액션 클릭`);
        // 여기에 각 액션에 따른 로직 추가
    };

    const handleSecondAction = () => {
        console.log(`${actionType} 두 번째 액션 클릭`);
        // 여기에 각 액션에 따른 로직 추가
    };

    return (
        <View style={styles.container}>
            <View style={styles.profileSection}>
                <Image source={userImage} style={styles.profileImage} />
                <View style={styles.contentSection}>
                    <View style={styles.headerRow}>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.timeAgo}>{timeAgo}</Text>
                    </View>
                    <Text style={styles.message}>{message}</Text>
                    
                    {/* 액션 버튼들 */}
                    <View style={styles.actionSection}>
                        {actionText && (
                            <TouchableOpacity 
                                style={[
                                    styles.actionButton,
                                    actionType === 'reject' && styles.primaryButton,
                                    actionType === 'accept' && styles.primaryButton,
                                    actionType === 'request' && styles.primaryButton
                                ]}
                                onPress={handleFirstAction}
                            >
                                <Text style={[
                                    styles.actionButtonText,
                                    (actionType === 'reject' || actionType === 'accept' || actionType === 'request') 
                                        && styles.primaryButtonText
                                ]}>
                                    {actionText}
                                </Text>
                            </TouchableOpacity>
                        )}
                        
                        {secondActionText && (
                            <TouchableOpacity 
                                style={[styles.actionButton, styles.secondaryButton]}
                                onPress={handleSecondAction}
                            >
                                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                                    {secondActionText}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    profileImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 12,
    },
    contentSection: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    timeAgo: {
        fontSize: 12,
        color: '#999',
    },
    message: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 8,
    },
    actionSection: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 4,
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    primaryButton: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderColor: '#ddd',
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#666',
    },
    primaryButtonText: {
        color: '#fff',
    },
    secondaryButtonText: {
        color: '#333',
    },
});

export default AlarmItem;