import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    ScrollView, 
    Dimensions, 
    Modal, 
    TouchableWithoutFeedback 
} from 'react-native';

const { width } = Dimensions.get('window');
const defaultPhoto = require('../../assets/defaultPhoto.jpg');

const Intro = ({ message, photos }) => {
    // 사진 확대 모달 상태 관리
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const getDisplayPhotos = () => {
        if (!photos) {
            return []; // 사진 데이터가 없을 경우 빈 배열 반환
        }
        
        if (Array.isArray(photos) && photos.length === 0) {
            return []; // 배열이지만 비어있는 경우 빈 배열 반환
        }
        
        if (Array.isArray(photos)) {
            const validPhotos = photos.filter(photo => 
                photo && 
                photo.trim() !== '' && 
                photo !== 'undefined' && 
                photo !== 'null'
            );
            return validPhotos;
        }
        
        if (typeof photos === 'string' && photos.trim() !== '') {
            return [photos]; // 단일 이미지도 배열로 반환
        }
        
        return []; // 모든 유효성 검사를 통과하지 못하면 빈 배열 반환
    };

    const displayPhotos = getDisplayPhotos();

    // 사진 터치 시 모달 열기
    const handleImagePress = (photo) => {
        const source = typeof photo === 'string' ? { uri: photo } : photo;
        setSelectedImage(source);
        setModalVisible(true);
    };

    return (
        <View>
            {/* 제목 */}
            <Text style={styles.title}>동행 소개</Text>

            {/* 동행 소개 텍스트 */}
            <View style={styles.textContainer}>
                <Text style={styles.text}>{message}</Text>
            </View>

            {/* 이미지가 있을 경우에만 스크롤뷰를 렌더링 */}
            {displayPhotos.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imageScrollContainer}
                >
                    {displayPhotos.map((photo, index) => (
                        <TouchableWithoutFeedback 
                            key={index} 
                            onPress={() => handleImagePress(photo)}
                        >
                            <View style={styles.imageBox}>
                                <Image 
                                    source={typeof photo === 'string' ? { uri: photo } : photo} 
                                    style={styles.image} 
                                    resizeMode="cover" 
                                    onError={(error) => {
                                    }}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    ))}
                </ScrollView>
            )}

            {/* 사진 확대 모달 */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <Image
                            source={selectedImage}
                            style={styles.modalImage}
                            resizeMode="contain"
                        />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 12,
    },
    textContainer: {
        backgroundColor: '#FFF',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    text: {
        fontSize: 14,
        lineHeight: 17,
        color: '#333',
    },
    // 기존 imageContainer 스타일 대신 사용
    imageScrollContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 10,
        paddingRight: 10, // 마지막 사진 뒤에 여백 추가
    },
    imageBox: {
        width: 115,
        height: 115,
        borderRadius: 8,
        marginRight: 8,
        // 기존 flex 관련 스타일 제거
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    // 모달 관련 스타일 추가
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: width,
        height: '100%', 
    },
});

export default Intro;
