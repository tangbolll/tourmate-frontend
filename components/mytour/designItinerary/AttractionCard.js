import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AttractionCard = ({
    attraction,
    isSelected,
    isExpanded,
    onToggle,
    onExpand
}) => {
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
                        <Text style={styles.attractionName}>{attraction.name}</Text>
                        {/* 제목 옆에 관광타입 표시 */}
                        {attraction.typeName && (
                            <Text style={styles.attractionType}>{attraction.typeName}</Text>
                        )}
                    
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
                {isExpanded && attraction.detailInfo && (
                <View style={styles.attractionDetails}>
                    {/* 카드 내부 최상단에 관광타입 표시 */}
                    {attraction.typeName && (
                        <Text style={styles.detailsType}>{attraction.typeName}</Text>
                    )}
                    <View style={styles.detailsContent}>
                    <View style={styles.textContent}>
                    {/* 소개글 */}
                    {attraction.detailInfo.overview ? (
                    <Text style={styles.attractionDescription}>
                        {attraction.detailInfo.overview}
                    </Text>
                    ) : null}

                    {/* 주소 */}
                    {attraction.detailInfo.addr ? (
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{attraction.detailInfo.addr}</Text>
                    </View>
                    ) : null}

                    {/* 전화번호 */}
                    {attraction.detailInfo.tel ? (
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{attraction.detailInfo.tel}</Text>
                    </View>
                    ) : null}

                    {/* 운영시간 */}
                    {attraction.detailInfo.usetime ? (
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{attraction.detailInfo.usetime}</Text>
                    </View>
                    ) : null}

                    {/* 휴무일 */}
                    {attraction.detailInfo.restdate ? (
                    <View style={styles.infoRow}>
                        <Ionicons name="close-circle-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{attraction.detailInfo.restdate}</Text>
                    </View>
                    ) : null}

                    {/* 개장일 */}
                    {attraction.detailInfo.opendate ? (
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{attraction.detailInfo.opendate}</Text>
                    </View>
                    ) : null}

                    {/* 주차 */}
                    {attraction.detailInfo.parking ? (
                    <View style={styles.infoRow}>
                        <Ionicons name="car-outline" size={16} color="#666" />
                        <Text style={styles.infoText}>{attraction.detailInfo.parking}</Text>
                    </View>
                    ) : null}
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
    
    attractionInfo: { flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // 이름과 타입 사이 간격
        marginRight: 8, },
    attractionName: { fontSize: 16, fontWeight: '600', color: '#333' },
    expandButton: { padding: 4 },
    attractionDetails: { paddingHorizontal: 16, paddingBottom: 16 },
    detailsContent: { flexDirection: 'row', gap: 12, paddingTop: 12 },
    textContent: { flex: 1 },
    attractionDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    infoRow: { marginBottom: 8 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 12, color: '#666', flex: 1 },
    imageContainer: { width: 120, height: 80 },
    attractionImage: { width: '100%', height: '100%', borderRadius: 8 },
});

export default AttractionCard;
