import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Wrapper from './Wrapper';

const Intro = ({ message }) => {
  return (
    <View>
      {/* 제목 */}
          <Text style={styles.title}>동행 소개</Text>
      {/* 모집 텍스트 박스 */}
      <Wrapper style={styles.textBox}>
        <Text style={styles.text}>{message}</Text>
      </Wrapper>

      {/* 사진 박스 */}
      <View style={styles.imageContainer}>
        <View style={styles.imageBox}><Text>사진1</Text></View>
        <View style={styles.imageBox}><Text>사진2</Text></View>
        <View style={styles.imageBox}><Text>사진3</Text></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
  textBox: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  imageBox: {
    width: 115,
    height: 115,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Intro;
