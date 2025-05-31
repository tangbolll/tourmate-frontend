import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from 'react-native-vector-icons';
import { launchImageLibrary } from 'react-native-image-picker';

const ImageSelector = ({ images, setImages, thumbnailIndex, setThumbnailIndex, maxImgCount = 10 }) => {
    const handleAddImage = () => {
        if (images.length >= maxImgCount) {
            Alert.alert("알림", `최대 ${maxImgCount}개의 이미지만 추가할 수 있습니다.`);
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 800,
            maxWidth: 800,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('사용자가 이미지 선택을 취소했습니다');
                return;
            }
            
            if (response.errorCode) {
                console.log('ImagePicker 오류: ', response.errorMessage);
                // 오류 시 기본 이미지로 대체 (개발용)
                const defaultImage = require('../../assets/defaultProfile.png');
                setImages([...images, defaultImage]);
                return;
            }
            
            if (response.assets && response.assets.length > 0) {
                const newImages = [...images, { uri: response.assets[0].uri }];
                setImages(newImages);
                
                // 첫 번째 이미지가 추가되면 자동으로 대표 이미지로 설정
                if (images.length === 0) {
                    setThumbnailIndex(0);
                }
            }
        });
    };

    const handleDeleteImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
        
        // 대표 이미지가 삭제된 경우 첫 번째 이미지를 대표로 설정
        if (thumbnailIndex === index) {
            setThumbnailIndex(newImages.length > 0 ? 0 : 0);
        } else if (thumbnailIndex > index) {
            // 삭제된 이미지 앞에 있던 대표 이미지의 인덱스 조정
            setThumbnailIndex(thumbnailIndex - 1);
        }
    };

    const setAsThumbnail = (index) => {
        setThumbnailIndex(index);
    };

    const renderImageItem = ({ item, index }) => (
        <View style={styles.imageWrapper}>
            <TouchableOpacity onPress={() => setAsThumbnail(index)}>
                <Image source={item.uri ? { uri: item.uri } : item} style={[styles.image, thumbnailIndex === index && styles.thumbnail]} />
                {thumbnailIndex === index && (
                    <View style={styles.thumbnailLabel}>
                        <Text style={styles.thumbnailText}>대표</Text>
                    </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.imageDelete}
                onPress={() => handleDeleteImage(index)}
            >
                <Text style={styles.deleteText}>×</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.imagesContainer}>
            <TouchableOpacity 
                style={styles.addImageButton}
                onPress={handleAddImage}
            >
                <MaterialIcons name="add-a-photo" size={24} color="#888" />
                <Text style={styles.addImageText}>{images.length}/{maxImgCount}</Text>
            </TouchableOpacity>
            {images.length > 0 && (
                <FlatList
                    data={images}
                    horizontal
                    renderItem={renderImageItem}
                    keyExtractor={(item, index) => index.toString()}
                    style={styles.imageList}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    imagesContainer: {
        flexDirection: 'row',
        marginBottom: 15
    },
    addImageButton: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    addImageText: {
        color: '#888',
        marginTop: 5
    },
    imageList: {
        flexGrow: 0
    },
    imageWrapper: {
        marginRight: 10,
        position: 'relative'
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8
    },
    thumbnail: {
        borderWidth: 2,
        borderColor: 'blue'
    },
    thumbnailLabel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'blue',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderBottomLeftRadius: 8
    },
    thumbnailText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    },
    imageDelete: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'white',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc'
    },
    deleteText: {
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default ImageSelector;