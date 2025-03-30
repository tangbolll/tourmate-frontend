import React from 'react';
import { View, StyleSheet } from 'react-native';

function Wrapper({ children }) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: 'black',
    padding: 16,
  },
});

export default Wrapper;