import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import SaveButton from "../../components/profile/SaveButton";

const { width } = Dimensions.get('window');

const SelectPostDesign = () => {
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState('Line');
    const [selectedDesign, setSelectedDesign] = useState(null);

    const handleBackPress = () => {
        router.back();
    };

    const handleDesignSelect = (designId) => {
        setSelectedDesign(designId);
    };

    const handleSavePress = () => {
        if (selectedDesign) {
            // 선택된 디자인 정보를 이전 화면으로 전달
            const selectedDesignData = {
                id: selectedDesign,
                tab: selectedTab,
                color: getDesignData().find(d => d.id === selectedDesign)?.color
            };
            
            console.log('Selected design:', selectedDesignData);
            router.push({
                pathname: '/writePost',
                params: { selectedPostcard: JSON.stringify(selectedDesignData) }
            });
        }
    };

    // 각 탭별 디자인 데이터
    const getDesignData = () => {
        const baseDesigns = [
            { id: 'design1', color: '#FFE4E1' }, // 연한 핑크
            { id: 'design2', color: '#E1F5FE' }, // 연한 블루
            { id: 'design3', color: '#F3E5F5' }, // 연한 보라
            { id: 'design4', color: '#E8F5E8' }, // 연한 그린
            { id: 'design5', color: '#FFF8E1' }, // 연한 노랑
        ];
        
        return baseDesigns.map(design => ({
            ...design,
            id: `${selectedTab.toLowerCase()}_${design.id}`
        }));
    };

    const renderPostcardDesign = (design, index) => {
        const isSelected = selectedDesign === design.id;
        
        return (
            <View key={design.id} style={styles.postcardContainer}>
                {/* 선택 체크 버튼 */}
                <TouchableOpacity
                    style={[
                        styles.checkButton,
                        isSelected && styles.checkButtonSelected
                    ]}
                    onPress={() => handleDesignSelect(design.id)}
                >
                    {isSelected && (
                        <Feather name="check" size={16} color="#fff" />
                    )}
                </TouchableOpacity>
                
                {/* 엽서 디자인 */}
                <TouchableOpacity
                    style={[styles.postcardDesign, { backgroundColor: design.color }]}
                    onPress={() => handleDesignSelect(design.id)}
                >
                    <Text style={styles.postcardTitle}>Postcard</Text>
                    <View style={styles.postcardContent}>
                        <View style={styles.postcardLeft} />
                        <View style={styles.postcardRight}>
                            {selectedTab === 'Line' && (
                                <>
                                    <View style={styles.line} />
                                    <View style={styles.line} />
                                    <View style={styles.line} />
                                    <View style={styles.line} />
                                </>
                            )}
                            {selectedTab === 'Plain' && (
                                <View style={styles.plainArea} />
                            )}
                            {selectedTab === 'Image' && (
                                <View style={styles.imageArea}>
                                    <Text style={styles.imageText}>Image</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <Text style={styles.postcardBottom}>This side for message</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={handleBackPress}
                >
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>엽서 선택</Text>
                <View style={styles.headerRight} />
            </View>

            {/* 탭 메뉴 */}
            <View style={styles.tabContainer}>
                {['Line', 'Plain', 'Image'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tabButton,
                            selectedTab === tab && styles.tabButtonActive
                        ]}
                        onPress={() => {
                            setSelectedTab(tab);
                            setSelectedDesign(null); // 탭 변경 시 선택 초기화
                        }}
                    >
                        <Text style={[
                            styles.tabText,
                            selectedTab === tab && styles.tabTextActive
                        ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 엽서 디자인 목록 */}
            <ScrollView style={styles.designList} showsVerticalScrollIndicator={false}>
                {getDesignData().map((design, index) => renderPostcardDesign(design, index))}
            </ScrollView>

            {/* 저장 버튼 */}
            <View style={styles.saveButtonContainer}>
                <SaveButton
                    title="엽서 선택"
                    onPress={handleSavePress}
                    disabled={!selectedDesign}
                    style={styles.saveButton}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    headerRight: {
        width: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    tabButtonActive: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    tabText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#fff',
    },
    designList: {
        flex: 1,
        paddingHorizontal: 16,
    },
    postcardContainer: {
        position: 'relative',
        marginBottom: 16,
        marginLeft: 30,
    },
    checkButton: {
        position: 'absolute',
        top: 8,
        left: -35,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        zIndex: 1,
    },
    checkButtonSelected: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    postcardDesign: {
        width: '100%',
        height: 200, // 5:4 비율로 더 넓게 (width가 화면 너비-32px일 때 적절한 높이)
        // borderRadius: 8,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    postcardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    postcardContent: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    postcardLeft: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
    },
    postcardRight: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    line: {
        height: 1,
        backgroundColor: '#999',
        marginVertical: 2,
    },
    plainArea: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
    },
    imageArea: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageText: {
        fontSize: 10,
        color: '#666',
    },
    postcardBottom: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    saveButtonContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    saveButton: {
        width: '100%',
    },
});

export default SelectPostDesign;