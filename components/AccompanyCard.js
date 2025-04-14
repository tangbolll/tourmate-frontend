import React from 'react';
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// default background image
const defaultImage = require('../assets/defaultBackground.png');

export default function AccompanyCard({
  date,
  title,
  location,
  imageUrl,
  onPress,
  buttonLabel,
}) 

{
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
        <ImageBackground
        source={imageUrl ? { uri: imageUrl } : defaultImage}
        style={styles.image}
        imageStyle={{ borderRadius: 8}}
        >

        <View style={styles.overlay}>
          {/* 상단 정보 */}
          <View style={styles.topRow}>
            <Text style={styles.date}>{date}</Text>
          </View>

          {/* 타이틀 */}
          <Text style={styles.title}>{title}</Text>

          {/* 위치 */}
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={16} color="#fff" />
            <Text style={styles.location}>{location}</Text>
          </View>

          {/* 버튼 */}
          <View style={styles.button}>
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    height: 150,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tag: {
    backgroundColor: 'rgba(124, 132, 175, 0)',
    color: '#fff',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  date: {
    color: '#fff',
    fontSize: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
  button: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
