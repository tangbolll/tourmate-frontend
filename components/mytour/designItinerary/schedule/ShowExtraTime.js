import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ShowExtraTime = ({ 
    duration, 
    startTime, 
    endTime, 
    onAddSchedule, 
    onDelete,
    extraTimeId 
}) => {
    const handleAddPress = () => {
        onAddSchedule && onAddSchedule(startTime, endTime, extraTimeId);
    };

const handleDelete = () => {
    if (onDelete && extraTimeId) {
        if (Platform.OS === 'web') {
            // 웹 환경일 경우 window.confirm 사용
            if (window.confirm('정말로 이 여유시간을 삭제하시겠습니까?')) {
                onDelete(extraTimeId);
            }
        } else {
            // 모바일 앱 환경일 경우 기존 Alert.alert 사용
            Alert.alert(
                '여유시간 삭제',
                '정말로 이 여유시간을 삭제하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    { 
                        text: '삭제', 
                        style: 'destructive', 
                        onPress: () => onDelete(extraTimeId) 
                    }
                ]
            );
        }
    }
};

const confirmDeletion = () => {
    onDelete(extraTimeId);
    setShowConfirmModal(false);
};

    return (
        <View style={styles.container}>
            {/* 왼쪽 삭제 버튼 */}
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="close" size={16} color="#999" />
            </TouchableOpacity>
            
            {/* 점선바 */}
            <View style={styles.dashedBar} />
            
            {/* 여유시간 내용 */}
            <View style={styles.content}>
                <View style={styles.timeInfo}>
                    <Ionicons name="time-outline" size={14} color="#999" />
                    <Text style={styles.durationText}>여유시간 | {duration}</Text>
                </View>
                
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={handleAddPress}
                >
                    <Ionicons name="add" size={16} color="#666" />
                    <Text style={styles.addText}>일정 추가</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 2,
        alignItems: 'stretch',
        minHeight: 50,
    },
    deleteButton: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 8,
        marginRight: 8,
    },
    dashedBar: {
        width: 4,
        borderLeftWidth: 2,
        borderLeftColor: '#ddd',
        borderStyle: 'dashed',
        marginRight: 12,
    },
    content: {
        flex: 1,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    timeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    durationText: {
        fontSize: 12,
        color: '#999',
        marginLeft: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 4,
    },
});

export default ShowExtraTime;