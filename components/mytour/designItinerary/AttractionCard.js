import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AttractionCard = ({
    attraction,
    isSelected,
    isExpanded,
    onToggle,
    onExpand
}) => {
    // '더보기' 기능을 위한 상태 변수
    const [isTextExpanded, setIsTextExpanded] = useState(false);
    const [isTruncated, setIsTruncated] = useState(false);

    // attraction 데이터가 없으면 렌더링하지 않음
    if (!attraction) {
        return null;
    }

    // 텍스트가 4줄을 넘는지 확인하는 함수
    const handleTextLayout = useCallback(e => {
        if (e.nativeEvent.lines.length > 4 && !isTruncated) {
            setIsTruncated(true);
        }
    }, [isTruncated]);


    return (
        <View style={styles.attractionContainer}>
            {/* + 버튼 */}
            <TouchableOpacity
                style={[
                    styles.addButton,
                    isSelected && styles.selectedAddButton
                ]}
                onPress={() => onToggle(attraction)}
            >
                {isSelected ? (
                    <Ionicons name="checkmark-sharp" size={18} color="#666" />
                ) : (
                    <Ionicons name="add-sharp" size={18} color="#fff" />
                )}
            </TouchableOpacity>

            <View style={styles.attractionCard}>
                {/* 제목 + 펼치기 버튼 */}
                <View style={styles.attractionHeader}>
                    <View style={styles.attractionInfo}>
                        <Text style={styles.attractionName}>{attraction?.name || '이름 없음'}</Text>                        
                    </View>
                    
                    <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => onExpand(attraction.id)}
                    >
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
                
                {/* 펼침 상태 */}
                {isExpanded && attraction?.detailInfo && (
                <View style={styles.attractionDetails}>
                    <View style={styles.detailsContent}>
                    <View style={styles.textContent}>
                    
                    {/* --- 소개글 및 더보기 기능 --- */}
                    {attraction.detailInfo.overview ? (
                        <View>
                            <Text
                                style={styles.attractionDescription}
                                numberOfLines={isTextExpanded ? undefined : 4}
                                onTextLayout={handleTextLayout}
                            >
                                {attraction.detailInfo.overview}
                            </Text>
                            
                            {isTruncated && (
                                <TouchableOpacity onPress={() => setIsTextExpanded(!isTextExpanded)}>
                                    <Text style={styles.readMoreText}>
                                        {isTextExpanded ? '접기' : '더보기'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : null}

                    {/* --- 주소 및 기타 정보 --- */}
                    {attraction.detailInfo.addr && (
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={16} color="#666" style={{marginTop:1}}/>
                            <Text style={styles.infoText}>{attraction.detailInfo.addr}</Text>
                        </View>
                    )}
                    {/* (다른 infoRow들도 여기에 위치) */}
                    </View>

                    {/* 오른쪽 이미지 */}
                    <View style={styles.imageContainer}>
                        <Image
                        source={{
                            uri: attraction.detailInfo.firstimage || attraction.image ||
                                "https://via.placeholder.com/120x80/E0E0E0/666666?text=이미지"
                        }}
                        style={styles.attractionImage}
                        resizeMode="cover"
                        />
                    </View>
                    </View>
                </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    attractionContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 8,
    },
    selectedAddButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    attractionCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    attractionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    attractionInfo: { 
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginRight: 8,
    },
    attractionName: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#333' 
    },
    expandButton: { 
        padding: 4 
    },
    attractionDetails: { 
        paddingHorizontal: 16, 
        paddingBottom: 16 
    },
    detailsContent: { 
        flexDirection: 'row', 
        gap: 12, 
        paddingTop: 12 
    },
    textContent: { 
        flex: 1 
    },
    attractionDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 20,
        marginBottom: 5,
    },
    infoRow: { 
        flexDirection: 'row', // 아이콘과 텍스트를 나란히 배치하기 위해 추가
        alignItems: 'flex-start',
        marginBottom: 8 
    },
    infoText: { 
        fontSize: 12, 
        color: '#666', 
        flex: 1, 
        marginLeft: 6 // 아이콘과의 간격
    },
    imageContainer: { 
        width: 120, 
        height: 80 
    },
    attractionImage: { 
        width: '100%', 
        height: '100%', 
        borderRadius: 8 
    },
    // '더보기' 텍스트 스타일
    readMoreText: {
        color: '#6B7280',
        fontWeight: '500',
        fontSize: 12,
        marginTop: 8,
        alignSelf: 'flex-end',
        textDecorationLine: 'underline',
    },
});

export default AttractionCard;

