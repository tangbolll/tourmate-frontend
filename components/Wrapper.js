import React from 'react';
import { View, StyleSheet } from 'react-native';

function Wrapper({ children }) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5, // 살짝 더 얇게 해도 자연스러움
    borderColor: 'gray',
    padding: 16,        // 내부 여백 (텍스트와 테두리 사이 간격)
    borderRadius: 12,   // 모서리를 둥글게 (숫자가 클수록 더 둥글어짐)
    backgroundColor: 'white', // 배경을 흰색으로 해서 더 카드형 느낌
  },
});


export default Wrapper;