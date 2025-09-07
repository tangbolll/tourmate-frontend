import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ShowSchedule = ({ 
    schedule, 
    onDelete,
    categoryColor = '#4A90E2',
    isAiSuggestion = false, // AI 제안 여부
    onSelect,               // 카드 클릭 시 호출될 함수
}) => {
    const [isExpanded, setIsExpanded] = useState(false); // 메모 확장 여부
    const [isTruncated, setIsTruncated] = useState(false); // 텍스트가 2줄을 넘어가는지 여부

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

    const handleTextLayout = (event) => {
        // 텍스트의 실제 줄 수가 2줄을 초과하면 isTruncated 상태를 true로 설정합니다.
        if (event.nativeEvent.lines.length > 2 && !isTruncated) {
            setIsTruncated(true);
        }
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
        <View 
            style={styles.container}
            onPress={() => onSelect && onSelect(safeSchedule)}
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
            
            {/* 일정 내용 */}
            <View style={styles.content}>
                {/* AI 제안 텍스트 */}
                {isAiSuggestion && (
                    <Text style={styles.aiLabel}>AI 제안</Text>
                )}
                
                <View style={styles.header}>
                    <View style={styles.timeContainer}>
                        <Text style={[styles.timeText, isAiSuggestion && styles.grayText]}>
                            {safeSchedule.startTime} - {safeSchedule.endTime}
                        </Text>
                    </View>
                </View>
                
                <Text style={[styles.title, isAiSuggestion && styles.grayText]}>
                    {safeSchedule.title}
                </Text>
                
                {safeSchedule.location && (
                    <View style={styles.locationContainer}>
                        <Ionicons 
                            name="location-outline" 
                            size={12} 
                            color={isAiSuggestion ? "#999" : "#666"} 
                        />
                        <Text style={[styles.locationText, isAiSuggestion && styles.grayText]}>
                            {safeSchedule.location}
                        </Text>
                    </View>
                )}
                
                {/* 위치와 메모 사이 구분선 */}
                {safeSchedule.location && safeSchedule.memo && (
                    <View style={styles.divider} />
                )}
                
                {safeSchedule.memo && (
                    <View style={styles.memoContainer}>
                        <Ionicons
                            name="document-text-outline"
                            size={12}
                            color={isAiSuggestion ? "#999" : "#666"}
                            style={styles.memoIcon}
                        />
                        <View style={styles.memoTextWrapper}>
                            <TouchableOpacity
                                onPress={() => isTruncated ? setIsExpanded(!isExpanded) : null}
                                disabled={!isTruncated}
                                activeOpacity={isTruncated ? 0.7 : 1}
                            >
                                <Text
                                    style={[styles.memoText, isAiSuggestion && styles.grayText]}
                                    onTextLayout={handleTextLayout}
                                    numberOfLines={isExpanded ? undefined : 2}
                                >
                                    {safeSchedule.memo}
                                    {isTruncated && !isExpanded && (
                                        <Text style={styles.inlineMore}> 더보기</Text>
                                    )}
                                </Text>
                            </TouchableOpacity>
                            
                            {isTruncated && isExpanded && (
                                <TouchableOpacity
                                    onPress={() => setIsExpanded(!isExpanded)}
                                    style={styles.seeMoreButton}
                                    hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                                >
                                    <Ionicons
                                        name="chevron-up"
                                        size={14}
                                        color="#888"
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 4,
        alignItems: 'stretch',
        minHeight: 80,
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
        position: 'relative',
    },
    aiLabel: {
        position: 'absolute',
        top: 8,
        right: 0,
        fontSize: 10,
        color: '#0091ea',
        fontWeight: '500',
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
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 8,
    },
    memoContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    memoIcon: {
        marginTop: 2,
        marginRight: 4,
    },
    memoTextWrapper: {
        flex: 1,
    },
    memoText: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        lineHeight: 16,
    },
    inlineMore: {
        color: '#0091ea',
        fontWeight: '500',
    },
    seeMoreButton: {
        marginLeft: 4,
        paddingHorizontal: 2,
        marginTop: 4,
    },
    grayText: {
        color: '#999',
    },
});

export default ShowSchedule;