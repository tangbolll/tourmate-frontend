import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Wrapper from './Wrapper';

const Intro = ({ message }) => {
  return (
    <Wrapper>
      {/* 모집 텍스트 박스 */}
      <View style={styles.textBox}>
        <Text style={styles.text}>{message}</Text>
      </View>

      {/* 사진 박스 */}
      <View style={styles.imageContainer}>
        <View style={styles.imageBox}><Text>사진1</Text></View>
        <View style={styles.imageBox}><Text>사진2</Text></View>
        <View style={styles.imageBox}><Text>사진3</Text></View>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  textBox: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageBox: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Intro;
