import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Wrapper from '../components/Wrapper';

const GatheringPlace = ({ location }) => {
  return (
    <Wrapper>
      {/* 제목 */}
      <Text style={styles.title}>모이는 장소</Text>

      {/* 주소 */}
      <View style={styles.locationContainer}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.location}>{location}</Text>
        <Text style={styles.copy}>복사</Text>
      </View>

      {/* 지도 */}
      <View style={styles.mapBox}>
        <Text>지도</Text>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 18,
    marginRight: 6,
  },
  location: {
    fontSize: 16,
    color: '#333',
  },
  copy: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
  },
  mapBox: {
    height: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GatheringPlace;
