import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AccompanyListHeader({ onPressAlarm, onPressDM, onPressFilter, searchText, setSearchText }) {
  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <Text style={styles.logo}>TOURMATE</Text>
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={onPressAlarm} style={styles.iconButton}>
            <Icon name="bell-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressDM} style={styles.iconButton}>
            <Icon name="send" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="관심 여행지, 카테고리를 검색해보세요"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={onPressFilter}>
          <Icon name="tune" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  iconRow: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    height: 40,
    backgroundColor: '#fafafa',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
});
