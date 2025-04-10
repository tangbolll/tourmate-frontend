import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ApplicationButton = ({ title = "동행 신청", likes = 0, onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
      {/* 하트 + 숫자 (작고 위에 위치) */}
      <View style={styles.likesContainer}>
        <View style={styles.iconWrapper}>
          <Ionicons name="heart" size={30} color="black" />
          <Text style={styles.likeText}>{likes}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    // ✅ 상단 그림자만
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,

    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  button: {
    flex: 1,
    backgroundColor: 'black',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  likesContainer: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeText: {
    position: 'absolute',
    top: -8,
    fontSize: 8,
    color: 'black',
    fontWeight: 'thin',
  },
});

export default ApplicationButton;
