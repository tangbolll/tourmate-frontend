import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Conditions = ({ gender, ageGroups }) => {
  return (
    <View style={styles.container}>
      {/* 제목 */}
      <Text style={styles.title}>동행 조건</Text>

      {/* 성별 조건 */}
      <View style={styles.row}>
        <Text style={styles.label}>성별</Text>
        <View style={styles.option}>
          <Text style={styles.optionText}>{gender}</Text>
        </View>
      </View>

      {/* 연령 조건 */}
      <View style={styles.row}>
        <Text style={styles.label}>연령</Text>
        <View style={styles.ageContainer}>
          {ageGroups.map((age, index) => (
            <View key={index} style={styles.option}>
              <Text style={styles.optionText}>{age}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  ageContainer: {
    flexDirection: 'row',
  },
  option: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
});

export default Conditions;
