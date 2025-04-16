import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function AccompanyTabToggle({ selectedTab, onSelectTab }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onSelectTab('feed')}
      >
        <Text style={[styles.text, selectedTab === 'feed' && styles.selectedText]}>
          동행 피드
        </Text>
        {selectedTab === 'feed' && <View style={styles.underline} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => onSelectTab('mine')}
      >
        <Text style={[styles.text, selectedTab === 'mine' && styles.selectedText]}>
          내가 만든 동행
        </Text>
        {selectedTab === 'mine' && <View style={styles.underline} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  text: {
    fontSize: 18,
    color: '#aaa',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#000',
  },
  underline: {
    position: 'absolute',
    bottom: -1,
    width: '80%',
    height: 3,
    backgroundColor: '#000',
  },
});
