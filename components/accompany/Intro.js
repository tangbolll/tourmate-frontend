import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const defaultPhoto = require('../../assets/defaultPhoto.jpg');

const Intro = ({ message, photos }) => {
    // photos 처리 로직
    const getDisplayPhotos = () => {
        // photos가 없거나 undefined인 경우
        if (!photos) {
            return [defaultPhoto, defaultPhoto];
        }
        
        // photos가 빈 배열인 경우
        if (Array.isArray(photos) && photos.length === 0) {
            return [defaultPhoto, defaultPhoto];
        }
        
        // photos가 배열인 경우
        if (Array.isArray(photos)) {
            // 유효한 이미지가 있는지 확인
            const validPhotos = photos.filter(photo => 
                photo && 
                photo.trim() !== '' && 
                photo !== 'undefined' && 
                photo !== 'null'
            );
            
            if (validPhotos.length === 0) {
                return [defaultPhoto, defaultPhoto];
            }
            
            return validPhotos;
        }
        
        // photos가 문자열인 경우 (단일 이미지)
        if (typeof photos === 'string' && photos.trim() !== '') {
            return [photos, defaultPhoto];
        }
        
        // 그 외의 경우 기본 이미지 사용
        return [defaultPhoto, defaultPhoto];
    };

    const displayPhotos = getDisplayPhotos();

    return (
        <View>
            {/* 제목 */}
            <Text style={styles.title}>동행 소개</Text>

            {/* 동행 소개 텍스트 */}
            <View style={styles.textContainer}>
                <Text style={styles.text}>{message}</Text>
            </View>

            {/* 이미지 */}
            <View style={styles.imageContainer}>
                {displayPhotos.map((photo, index) => (
                    <View style={styles.imageBox} key={index}>
                        <Image 
                            source={typeof photo === 'string' ? { uri: photo } : photo} 
                            style={styles.image} 
                            resizeMode="cover" 
                            onError={(error) => {
                                console.log('Image load error:', error);
                            }}
                        />
                    </View>
                ))}
            </View>
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
        color: '#333',
    },
    imageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 10,
    },
    imageBox: {
        width: 115,
        height: 115,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    hostLabel: {
        fontSize: 12,
        backgroundColor: '#E5E7EB',
        color: '#000',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 6,
    },
});

export default Intro;