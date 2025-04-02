import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Categories = ({ types, tags }) => {
  return (
    <View style={styles.container}>
      {/* 카테고리 제목 */}
      <Text style={styles.title}>카테고리</Text>

      {/* 유형 */}
      <View style={styles.row}>
        <Text style={styles.label}>유형</Text>
        <View style={styles.chipContainer}>
          {types.map((type, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{type}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 태그 */}
      <View style={styles.row}>
        <Text style={styles.label}>태그</Text>
        <View style={styles.chipContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.chip}>
              <Text style={styles.chipText}>{tag}</Text>
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
});

export default Categories;
