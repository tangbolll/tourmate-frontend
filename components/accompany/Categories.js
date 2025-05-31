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
      <View style={styles.tagSection}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tagSection: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 16,
    marginRight: 0,
    width: 40, // 라벨의 고정 너비를 설정하여 정렬을 맞춤
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    paddingLeft: 0, // 첫 줄은 패딩 없음
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8, // 칩 사이에 아래 여백 추가
  },
  chipText: {
    fontSize: 14,
    color: '#333',
  },
});

export default Categories;