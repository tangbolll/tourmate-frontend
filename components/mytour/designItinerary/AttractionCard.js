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
            {/* + 버튼을 상자 외부 왼쪽에 배치 */}
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
                <View style={styles.attractionHeader}>
                    <View style={styles.attractionInfo}>
                        <Text style={styles.attractionName}>{attraction.name}</Text>
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
                
                {isExpanded && (
                    <View style={styles.attractionDetails}>
                        <View style={styles.detailsContent}>
                            <View style={styles.textContent}>
                                <Text style={styles.attractionDescription}>{attraction.description}</Text>
                                
                                <View style={styles.infoRow}>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="location-outline" size={16} color="#666" />
                                        <Text style={styles.infoText}>{attraction.location}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.infoRow}>
                                    <View style={styles.infoItem}>
                                        <Ionicons name="time-outline" size={16} color="#666" />
                                        <Text style={styles.infoText}>{attraction.hours}</Text>
                                    </View>
                                </View>
                            </View>
                            
                            <View style={styles.imageContainer}>
                                <Image 
                                    source={{ uri: attraction.image || "https://via.placeholder.com/120x80/E0E0E0/666666?text=이미지" }}
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
        marginTop: 16,
    },
    selectedAddButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    attractionCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    attractionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        // 아래에 선추가
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    attractionInfo: {
        flex: 1,
    },
    attractionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    expandButton: {
        padding: 4,
    },
    attractionDetails: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    detailsContent: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 12,
    },
    textContent: {
        flex: 1,
    },
    attractionDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    infoRow: {
        marginBottom: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    imageContainer: {
        width: 120,
        height: 80,
    },
    attractionImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
});

export default AttractionCard;