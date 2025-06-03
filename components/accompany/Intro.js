import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const defaultPhoto = require('../../assets/defaultPhoto.jpg');

const Intro = ({ message, photos = [defaultPhoto, defaultPhoto] }) => {
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
                {photos.map((photo, index) => (
                    <View style={styles.imageBox} key={index}>
                        <Image source={photo} style={styles.image} resizeMode="cover" />
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
        borderColor: 'rgba(0, 0, 0, 0.32)',
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
