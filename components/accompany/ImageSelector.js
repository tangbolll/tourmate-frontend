import React from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Formdata from 'form-data';

const ImageSelector = ({ images, setImages, thumbnailIndex, setThumbnailIndex, maxImgCount = 10 }) => {
    
    // 권한 요청
    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                '권한 필요',
                '앨범에 접근하기 위해 사진 라이브러리 권한이 필요합니다.',
                [{ text: '확인' }]
            );
            return false;
        }
        return true;
    };

    const handleAddImage = async () => {
        if (images.length >= maxImgCount) {
            Alert.alert("알림", `최대 ${maxImgCount}개의 이미지만 추가할 수 있습니다.`);
            return;
        }

        // 권한 확인
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                allowsMultipleSelection: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const newImage = {
                    uri: asset.uri,
                    type: asset.type,
                    name: asset.fileName || `image_${Date.now()}.jpg`,
                    size: asset.fileSize,
                    width: asset.width,
                    height: asset.height
                };
                
                const newImages = [...images, newImage];
                setImages(newImages);
                
                // 첫 번째 이미지가 추가되면 자동으로 대표 이미지로 설정
                if (images.length === 0) {
                    setThumbnailIndex(0);
                }
            }
        } catch (error) {
            Alert.alert('오류', '이미지를 선택하는 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteImage = (index) => {
        Alert.alert(
            "이미지 삭제",
            "선택한 이미지를 삭제하시겠습니까?",
            [
                {
                    text: "취소",
                    style: "cancel"
                },
                {
                    text: "삭제",
                    style: "destructive",
                    onPress: () => {
                        const newImages = [...images];
                        newImages.splice(index, 1);
                        setImages(newImages);
                        
                        // 대표 이미지가 삭제된 경우 첫 번째 이미지를 대표로 설정
                        if (thumbnailIndex === index) {
                            setThumbnailIndex(newImages.length > 0 ? 0 : -1);
                        } else if (thumbnailIndex > index) {
                            setThumbnailIndex(thumbnailIndex - 1);
                        }
                    }
                }
            ]
        );
    };

    const setAsThumbnail = (index) => {
        setThumbnailIndex(index);
    };

    const renderImageItem = ({ item, index }) => (
        <View style={styles.imageWrapper}>
            <TouchableOpacity 
                onPress={() => setAsThumbnail(index)}
                style={styles.imageContainer}
            >
                <Image 
                    source={item.uri ? { uri: item.uri } : item} 
                    style={[
                        styles.image, 
                        thumbnailIndex === index && styles.thumbnail
                    ]} 
                    resizeMode="cover"
                />
                {thumbnailIndex === index && (
                    <View style={styles.thumbnailLabel}>
                        <MaterialIcons name="star" size={12} color="white" />
                        <Text style={styles.thumbnailText}>대표</Text>
                    </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.imageDelete}
                onPress={() => handleDeleteImage(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <MaterialIcons name="close" size={14} color="#666" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.label}>사진 등록</Text>
            <View style={styles.imagesContainer}>
                <TouchableOpacity 
                    style={styles.addImageButton}
                    onPress={handleAddImage}
                >
                    <MaterialIcons name="add-a-photo" size={24} color="#888" />
                    <Text style={styles.addImageText}>사진 추가</Text>
                    <Text style={styles.countText}>{images.length}/{maxImgCount}</Text>
                </TouchableOpacity>
                
                {images.length > 0 && (
                    <FlatList
                        data={images}
                        horizontal
                        renderItem={renderImageItem}
                        keyExtractor={(item, index) => index.toString()}
                        style={styles.imageList}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.imageListContent}
                    />
                )}
            </View>
            
            {images.length > 0 && (
                <Text style={styles.helpText}>
                    • 이미지를 터치하여 대표 이미지로 설정할 수 있습니다{'\n'}
                    • X 버튼을 눌러 이미지를 삭제할 수 있습니다
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        marginBottom: 8,
        color: '#333',
    },
    imagesContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    addImageButton: {
        width: 80,
        height: 80,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: '#fafafa',
    },
    addImageText: {
        color: '#666',
        fontSize: 10,
        marginTop: 2,
        textAlign: 'center',
    },
    countText: {
        color: '#888',
        fontSize: 8,
        marginTop: 1,
    },
    imageList: {
        flexGrow: 0,
    },
    imageListContent: {
        alignItems: 'center',
    },
    imageWrapper: {
        marginRight: 10,
        position: 'relative',
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    thumbnail: {
        borderWidth: 3,
        borderColor: '#007AFF',
    },
    thumbnailLabel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: '#007AFF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderBottomLeftRadius: 8,
        borderTopRightRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnailText: {
        color: 'white',
        fontSize: 9,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    imageDelete: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    helpText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
        marginTop: 4,
        marginLeft: 5,
    },
});

export default ImageSelector;