import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PostcardOverlay from './PostcardOverlay';

// 엽서 번호에 따라 이미지 경로를 매핑
const postcardImages = {
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

const PostcardSelectionArea = ({
    selectedPostcard,
    onAreaPress,
    onPostcardSelect,
    isEditMode,
    isSaved,
    isOverlayVisible,
    onOverlayClose,
    onWritePress,
    onDrawPress
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.postcardArea,
                    selectedPostcard && styles.postcardAreaSelected
                ]}
                onPress={onAreaPress}
                disabled={!isEditMode || isSaved}
            >
                {selectedPostcard ? (
                    // 엽서가 선택되면 해당 이미지 경로를 사용하여 이미지 렌더링
                    <View style={styles.postcardContainer}>
                        <Image
                            // 수정된 부분: selectedPostcard 객체의 code 속성을 사용
                            source={postcardImages[selectedPostcard?.code]}
                            style={styles.postcardImage}
                        />
                        <PostcardOverlay
                            isVisible={isOverlayVisible}
                            onClose={onOverlayClose}
                            onPostcardSelect={onPostcardSelect}
                            onWritePress={onWritePress}
                            onDrawPress={onDrawPress}
                        />
                    </View>
                ) : (
                    // 엽서가 선택되지 않았을 때 플레이스홀더 표시
                    <View style={styles.postcardPlaceholder}>
                        <Feather
                            name="file-text"
                            size={32}
                            color="#999"
                        />
                        <Text style={styles.postcardText}>
                            엽서 선택
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    postcardArea: {
        width: 148 * 2.4,
        height: 100 * 2.4,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        position: 'relative',
    },
    postcardAreaSelected: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    },
    postcardContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    postcardImage: {
        width: '100%',
        height: '100%',
    },
    postcardPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    postcardText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
});

export default PostcardSelectionArea;
