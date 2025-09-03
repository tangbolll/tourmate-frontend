import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

const templateImages = {
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

const PostcardTemplate = ({ template }) => {
    if (!template || !template.typeId) {
        return <View style={styles.container} />;
    }

    const imageSource = templateImages[template.typeId] || null;

    if (!imageSource) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>엽서 템플릿 이미지를 찾을 수 없습니다.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
            <Text style={styles.content}>{template.content}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        position: 'absolute',
        textAlign: 'center',
        fontSize: 16,
        color: '#000',
        padding: 10,
    },
    errorText: {
        textAlign: 'center',
        fontSize: 16,
        color: 'red',
    },
});

export default PostcardTemplate;
