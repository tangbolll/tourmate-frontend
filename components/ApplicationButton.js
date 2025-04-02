import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ApplicationButton = ({ title = "동행 신청", likes = 0 }) => {
  const handlePress = () => {
    console.log(`${title} 버튼 클릭`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
      <View style={styles.likesContainer}>
        <Text style={styles.likeText}>{likes}</Text>
        <Ionicons name="heart" size={24} color="black" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  button: {
    flex: 1,
    backgroundColor: 'black',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  likeText: {
    fontSize: 16,
    marginRight: 5,
  },
});

export default ApplicationButton;
