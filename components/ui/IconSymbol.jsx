import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight, // 추가된 매개변수이지만 사용되지 않음
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}