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

// 각 탭별 이미지 파일 경로를 매핑하는 객체
const designImages = {
    Line: [
        require('../../assets/postcardType/1.png'),
        require('../../assets/postcardType/2.png'),
        require('../../assets/postcardType/3.png'),
        require('../../assets/postcardType/4.png'),
        // require('../../assets/postcardType/5.png'),
    ],
    Plain: [
        require('../../assets/postcardType/6.png'),
        require('../../assets/postcardType/7.png'),
        require('../../assets/postcardType/8.png'),
        require('../../assets/postcardType/9.png'),
        require('../../assets/postcardType/10.png'),
    ],
    // Image: [
    //     require('../../assets/postcardType/11.png'),
    //     require('../../assets/postcardType/12.png'),
    //     require('../../assets/postcardType/13.png'),
    //     require('../../assets/postcardType/14.png'),
    //     require('../../assets/postcardType/15.png'),
    // ],
};

const SelectPostDesign = ({ onPostcardSelect, onClose }) => {
    const tabs = {
        Line: 1,
        Plain: 2,
        // Image: 3,
    };
    const [selectedTab, setSelectedTab] = useState('Line');
    const [selectedDesign, setSelectedDesign] = useState(null);

    const handleDesignSelect = (designId) => {
        setSelectedDesign(designId);
    };

    const handleSavePress = () => {
        if (selectedDesign && onPostcardSelect) {
            onPostcardSelect(selectedDesign);
            console.log('선택된 엽서 디자인 번호:', selectedDesign);
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const getDesignData = () => {
    const designs = [];
    const startIndex = (tabs[selectedTab] - 1) * 5 + 1;
    const imageCount = designImages[selectedTab].length; // 실제 이미지 개수
    const endIndex = startIndex + imageCount - 1; // 개수에 맞춰 조정

    for (let i = startIndex; i <= endIndex; i++) {
        designs.push({ id: i });
    }

    return designs;
};

    // 엽서 이미지 렌더링 함수 수정
    const renderPostcardDesign = (design) => {
        const isSelected = selectedDesign === design.id;

        // 현재 탭의 디자인 배열을 가져오고, 디자인 ID에 따라 올바른 인덱스를 계산
        const tabDesigns = designImages[selectedTab];
        const imageIndex = (design.id - 1) % 5;
        const imageSource = tabDesigns[imageIndex];

        return (
            <View key={design.id} style={styles.postcardContainer}>
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

                <TouchableOpacity
                    style={[styles.postcardDesign, isSelected && styles.postcardDesignSelected]}
                    onPress={() => handleDesignSelect(design.id)}
                >
                    <Image
                        source={imageSource} // 수정된 부분: 동적으로 이미지 소스 설정
                        style={styles.postcardImage}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>엽서 선택</Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                >
                    <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
            </View>

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
                            setSelectedDesign(null);
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

            <ScrollView
                style={styles.designList}
                showsVerticalScrollIndicator={false}
            >
                {getDesignData().map((design) => renderPostcardDesign(design))}
            </ScrollView>

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