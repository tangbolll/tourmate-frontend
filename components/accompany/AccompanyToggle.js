import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AccompanyToggle = ({ isExpanded, onToggle }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggle}>
      <Text style={styles.label}>동행 상태</Text>
      <Icon
        name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
        size={24}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
});

export default AccompanyToggle;
