import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const GroupChatList = ({ photo, title, message, participants, timestamp, unreadCount, onPress, onSwipeLeft }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      // 왼쪽으로 70픽셀 이상 스와이프했을 때 팝업을 띄웁니다.
      if (translationX < -70) {
        onSwipeLeft();
      }
      
      // 스와이프가 끝나면 원래 위치로 돌아오는 애니메이션
      Animated.timing(translateX, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-10, 10]} // 스와이프 방향을 제한하여 터치 오류 방지
    >
      <Animated.View style={[styles.chatItemContainer, { transform: [{ translateX }] }]}>
        <TouchableOpacity style={styles.chatItem} onPress={onPress}>
          <Image
            source={{ uri: photo }}
            style={styles.profileImage}
          />
          <View style={styles.chatContent}>
            <View style={styles.header}>
              <Text style={styles.chatTitle}>{title}</Text>
              <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
            <View style={styles.chatDetails}>
              <Text style={styles.chatMessage} numberOfLines={1}>
                {message}
              </Text>
              <Text style={styles.participants}>{participants}명</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  chatItemContainer: {
    backgroundColor: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff', // 스와이프 시 배경이 보이는 것을 방지
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  chatDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  participants: {
    fontSize: 12,
    color: '#A0A0A0',
    marginLeft: 10,
  },
  unreadBadge: {
    backgroundColor: '#FF6347',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default GroupChatList;