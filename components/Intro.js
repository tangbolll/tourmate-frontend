import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const defaultPhoto = require('../assets/defaultPhoto.jpg'); // default image

const Intro = ({ message }) => {
  return (
    <View>
      {/* 제목 */}
      <Text style={styles.title}>동행 소개</Text>

      {/* 모집 텍스트 박스 */}
      <View style={styles.textContainer}>
        <Text style={styles.text}>{message}</Text>
      </View>

      {/* 사진 박스 */}
      <View style={styles.imageContainer}>
        <View style={styles.imageBox}>
          <Image source={defaultPhoto} style={styles.image} resizeMode="cover" />
        </View>
        <View style={styles.imageBox}>
          <Image source={defaultPhoto} style={styles.image} resizeMode="cover" />
        </View>
        <View style={styles.imageBox}>
          <Image source={defaultPhoto} style={styles.image} resizeMode="cover" />
        </View>
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.32)',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  imageBox: {
    width: 115,
    height: 115,
    borderRadius: 12,
    alignItems: 'center',
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
