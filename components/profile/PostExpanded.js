import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPostcardByIdApi } from '../../utils/PostCardApi';

const { width, height } = Dimensions.get('window');

// 로컬 템플릿 이미지 매핑
const postcardTemplates = {
    1: require('../../assets/postcardType/1.png'),
    2: require('../../assets/postcardType/2.png'),
    3: require('../../assets/postcardType/3.png'),
    4: require('../../assets/postcardType/4.png'),
    5: require('../../assets/postcardType/5.png'),
    6: require('../../assets/postcardType/6.png'),
    7: require('../../assets/postcardType/7.png'),
    8: require('../../assets/postcardType/8.png'),
    9: require('../../assets/postcardType/9.png'),
    10: require('../../assets/postcardType/10.png'),
    11: require('../../assets/postcardType/11.png'),
    12: require('../../assets/postcardType/12.png'),
    13: require('../../assets/postcardType/13.png'),
    14: require('../../assets/postcardType/14.png'),
    15: require('../../assets/postcardType/15.png'),
};

// 템플릿 이미지 가져오기 함수
const getPostcardTemplate = (typeImageUrl) => {
    if (!typeImageUrl) return postcardTemplates[1]; // 기본 템플릿
    
    try {
        const match = typeImageUrl.match(/(\d+)\.png$/);
        if (match) {
            const templateNumber = parseInt(match[1], 10);
            return postcardTemplates[templateNumber] || postcardTemplates[1];
        }
        return postcardTemplates[1];
    } catch (error) {
        console.error('템플릿 이미지 가져오기 오류:', error);
        return postcardTemplates[1];
    }
};

const PostExpanded = ({ 
    visible, 
    postData, 
    onClose, 
    onDataUpdate, 
    currentUserId 
}) => {
    // detail 데이터 상태
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // 목 데이터 (fallback용)
    const mockData = {
        postcardImage: 'https://via.placeholder.com/400x300',
        postcardContent: '엽서 내용이 없습니다',
        typeImageUrl: '../postcardType/1.png', // 기본 템플릿
        ...postData
    };

    // detail 데이터 로드 (이전 API가 없다고 했으므로 이 로직은 주석 처리)
    useEffect(() => {
        // if (visible && postData?.postcardId && !detailData) {
        //     loadDetailData();
        // }
    }, [visible, postData?.postcardId]);

    const loadDetailData = async () => {
        setDetailLoading(true);
        try {
            // 이 API 호출은 더 이상 사용되지 않음
            // const result = await getPostcardByIdApi(postData.postcardId);
            // setDetailData(result);
        } catch (error) {
            console.error('Detail 로드 오류:', error);
            // 에러가 나도 기본 데이터로 표시
        } finally {
            setDetailLoading(false);
        }
    };

    // 실제 표시할 데이터 (서버 데이터가 있으면 서버 데이터 우선)
    const displayData = {
        postcardImage: detailData?.imageUrl || postData?.imageUrl || postData?.image || mockData.postcardImage,
        postcardContent: detailData?.content || postData?.content || postData?.postcardContent || mockData.postcardContent,
        templateImage: getPostcardTemplate(detailData?.typeImageUrl || postData?.typeImageUrl || mockData.typeImageUrl),
    };

    // 추가: 이미지 URL이 올바른지 확인하는 로그
    useEffect(() => {
        console.log('✅ PostExpanded에 전달된 이미지 URL:', displayData.postcardImage);
    }, [displayData.postcardImage]);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                {/* 마스크 배경 */}
                <TouchableOpacity 
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                
                {/* 상단 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* 메인 콘텐츠 */}
                <View style={styles.contentContainer}>
                    {/* 엽서 이미지 */}
                    <View style={styles.imageSection}>
                        <Image source={{ uri: displayData.postcardImage }} style={styles.postcardImage} />
                    </View>

                    {/* 엽서 템플릿 배경에 내용 오버레이 */}
                    <View style={styles.postcardSection}>
                        <ImageBackground
                            source={displayData.templateImage}
                            style={styles.postcardContainer}
                            resizeMode="contain"
                        >
                            <View style={styles.postcardOverlay}>
                                <ScrollView style={styles.contentScrollArea} showsVerticalScrollIndicator={false}>
                                    <Text style={styles.contentText}>{displayData.postcardContent}</Text>
                                </ScrollView>
                            </View>
                        </ImageBackground>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    header: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    closeButton: {
        position: 'absolute',
        right: 30,
        padding: 5,
    },
    contentContainer: {
        width: width * 0.9,
        maxHeight: height * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    imageSection: {
        paddingHorizontal: 15,
        paddingTop: 12,
        marginBottom: 12,
    },
    postcardImage: {
        width: width * 0.85,
        height: width / 1.48 * 0.85,
        resizeMode: 'cover',
    },
    postcardSection: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        marginBottom: 8,
    },
    postcardContainer: {
        width: width * 0.85,
        height: width / 1.48 * 0.85,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postcardOverlay: {
        width: '80%',
        height: '70%',
        padding: 20,
        justifyContent: 'space-between',
    },
    contentScrollArea: {
        flex: 1,
        marginVertical: 8,
    },
    contentText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 18,
        textAlign: 'left',
    },
});

export default PostExpanded;
