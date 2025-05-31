import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WriteComment = ({ onSend, onFocus }) => {
  const [comment, setComment] = useState('');

  const handleFocus = () => {
    // TextInput이 포커스되었을 때 onFocus 콜백 호출
    if (onFocus) {
      onFocus();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="50자 내로 코멘트를 작성해주세요."
        placeholderTextColor="#999"
        maxLength={50}
        value={comment}
        onChangeText={setComment}
        onFocus={handleFocus}
      />
      <TouchableOpacity 
        onPress={() => { 
          onSend(comment); 
          setComment(''); 
          Keyboard.dismiss(); // 전송 후 키보드 닫기
        }}
      >
        <Ionicons name="paper-plane-outline" size={24} color="#555" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 10, // 하단 여백 추가
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    paddingVertical: 4, // 입력 영역 높이 조금 증가
  },
});

export default WriteComment;