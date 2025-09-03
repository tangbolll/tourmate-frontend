import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ShowSchedule = ({ 
    schedule, 
    onDelete,
    categoryColor = '#4A90E2',
    isAiSuggestion = false, // AI 제안 여부
    onSelect,               // 카드 클릭 시 호출될 함수
}) => {
    // 더 강력한 방어 코드
    if (!schedule || typeof schedule !== 'object') {
        console.warn('ShowSchedule: schedule prop is missing or invalid:', schedule);
        return null;
    }

    // 필수 속성들에 대한 기본값 설정
    const safeSchedule = {
        id: schedule.id || 'no-id',
        title: schedule.title || '제목 없음',
        startTime: schedule.startTime || '00:00',
        endTime: schedule.endTime || '00:00',
        location: schedule.location || '',
        memo: schedule.memo || ''
    };

    const handleDelete = () => {
        if (onDelete && safeSchedule.id && safeSchedule.id !== 'no-id') {
            const deleteAction = () => {
                onDelete(safeSchedule.id);
            };

            if (Platform.OS === 'web') {
                const isConfirmed = window.confirm('정말로 이 일정을 삭제하시겠습니까?');
                if (isConfirmed) {
                    deleteAction();
                }
            } else {
                Alert.alert(
                    '일정 삭제',
                    '정말로 이 일정을 삭제하시겠습니까?',
                    [
                        { text: '취소', style: 'cancel' },
                        { text: '삭제', style: 'destructive', onPress: deleteAction }
                    ]
                );
            }
        }
    };

    return (
        // --- 💡 2. View를 TouchableOpacity로 변경하고, 조건부 스타일과 onPress 이벤트 추가 ---
        <TouchableOpacity 
            style={[styles.container, isAiSuggestion && styles.aiCard]} // AI 제안일 경우 aiCard 스타일 적용
            onPress={() => onSelect && onSelect(safeSchedule)} // 클릭 시 onSelect 호출
            activeOpacity={0.8}
        >
            {/* 왼쪽 삭제 버튼 */}
            <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDelete}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="close" size={16} color="#999" />
            </TouchableOpacity>
            
            {/* 둥근 컬러바 */}
            <View style={[styles.colorBar, { backgroundColor: categoryColor }]} />
            
            {/* 일정 내용 (기존과 동일) */}
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>
                            {safeSchedule.startTime} - {safeSchedule.endTime}
                        </Text>
                    </View>
                </View>
                
                <Text style={styles.title}>{safeSchedule.title}</Text>
                
                {safeSchedule.location && (
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={12} color="#666" />
                        <Text style={styles.locationText}>{safeSchedule.location}</Text>
                    </View>
                )}
                
                {/* 💡 참고: 팁(memo) 표시는 여기서 하지 않습니다.
                  부모 컴포넌트(ItineraryScreen)의 모달에서 
                  isAiSuggestion이 true일 때만 이 memo 값을 보여주게 됩니다.
                */}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 4,
        alignItems: 'stretch',
        minHeight: 80,
    },
    aiCard: {
    borderWidth: 2,
    borderColor: '#007BFF',
    borderStyle: 'dashed',
    },
    deleteButton: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 8,
        marginRight: 8,
    },
    colorBar: {
        width: 4,
        borderRadius: 2,
        marginRight: 12,
    },
    content: {
        flex: 1,
        paddingVertical: 8,
    },
    header: {
        marginBottom: 4,
    },
    timeContainer: {
        flex: 1,
    },
    timeText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    memoText: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        marginBottom: 4,
    },
});

export default ShowSchedule;