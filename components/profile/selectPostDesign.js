import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import SaveButton from './SaveButton'; // SaveButton 컴포넌트 경로 확인

const { width } = Dimensions.get('window');
// 148:100 비율을 유지하기 위한 상수
const POSTCARD_RATIO = 100 / 148;

const SelectPostDesign = ({ onPostcardSelect, onClose }) => {
    // 백엔드 명세에 따라 'Line', 'Plain', 'Image' 탭을 1, 2, 3으로 매핑
    const tabs = {
        Line: 1,
        Plain: 2,
        Image: 3,
    };
    const [selectedTab, setSelectedTab] = useState('Line');
    const [selectedDesign, setSelectedDesign] = useState(null); // 선택된 디자인의 ID

    const handleDesignSelect = (designId) => {
        setSelectedDesign(designId);
    };

    const handleSavePress = () => {
        if (selectedDesign && onPostcardSelect) {
            // 선택된 디자인의 ID(번호)를 부모 컴포넌트로 전달
            onPostcardSelect(selectedDesign);
            console.log('선택된 엽서 디자인 번호:', selectedDesign);
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    // 각 탭별 디자인 데이터
    const getDesignData = () => {
        const designs = [];
        const startIndex = (tabs[selectedTab] - 1) * 5 + 1;
        const endIndex = startIndex + 4;
        
        for (let i = startIndex; i <= endIndex; i++) {
            designs.push({ id: i });
        }
        
        return designs;
    };
    
    const renderPostcardDesign = (design) => {
        const isSelected = selectedDesign === design.id;
        
        return (
            <View key={design.id} style={styles.postcardContainer}>
                {/* 선택 체크 버튼 */}
                <TouchableOpacity
                    style={[
                        styles.checkButton,
                        isSelected && styles.checkButtonSelected,
                    ]}
                    onPress={() => handleDesignSelect(design.id)}
                >
                    {isSelected && (
                        <Feather name="check" size={16} color="#fff" />
                    )}
                </TouchableOpacity>

                {/* 엽서 이미지 디자인 */}
                <TouchableOpacity
                    style={[styles.postcardDesign, isSelected && styles.postcardDesignSelected]}
                    onPress={() => handleDesignSelect(design.id)}
                >
                    <Image
                        source={require(`../../assets/postCard/1.png`)} // 일단 1.png로 통일
                        style={styles.postcardImage}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>엽서 선택</Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                >
                    <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* 탭 메뉴 */}
            <View style={styles.tabContainer}>
                {Object.keys(tabs).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tabButton,
                            selectedTab === tab && styles.tabButtonActive,
                        ]}
                        onPress={() => {
                            setSelectedTab(tab);
                            setSelectedDesign(null); // 탭 변경 시 선택 초기화
                        }}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedTab === tab && styles.tabTextActive,
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 엽서 디자인 목록 */}
            <ScrollView
                style={styles.designList}
                showsVerticalScrollIndicator={false}
            >
                {getDesignData().map((design) => renderPostcardDesign(design))}
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
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        padding: 8,
        marginRight: -8,
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
    },
    checkButton: {
        position: 'absolute',
        top: 8,
        right: 8,
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
        // 148:100 비율에 맞춰 높이 계산
        height: (width - 32) * POSTCARD_RATIO, 
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    postcardDesignSelected: {
        borderWidth: 3,
        borderColor: '#000',
    },
    postcardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
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
