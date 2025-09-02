import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

// 기본 프로필 이미지들
const defaultProfiles = [
  require('../../assets/defaultProfile.png')
];

const GroupChatList = ({ photo, title, message, participants, timestamp, unreadCount, onPress, onSwipeLeft }) => {
  const translateX = useRef(new Animated.Value(0)).current;

  // 겹쳐진 프로필 렌더링 함수
  const renderProfileImages = () => {
    // 참가자가 1명일 때
    if (participants === 1) {
      return (
        <View style={styles.avatarContainer}>
          <Image 
            source={defaultProfiles[0]} 
            style={styles.singleAvatar}
          />
        </View>
      );
    }
    
    // 2명일 때
    if (participants === 2) {
      return (
        <View style={styles.avatarContainer}>
          <View style={styles.multipleAvatarsContainer}>
            <Image 
              source={defaultProfiles[1]} 
              style={[styles.avatar, styles.backAvatar]}
            />
            <Image 
              source={defaultProfiles[0]} 
              style={[styles.avatar, styles.frontAvatar]}
            />
          </View>
        </View>
      );
    }
    
    // 3명 이상일 때 3개 프로필 모두 표시
    return (
      <View style={styles.avatarContainer}>
        <View style={styles.multipleAvatarsContainer}>
          <Image 
            source={defaultProfiles[2]} 
            style={[styles.avatar, styles.thirdAvatar]}
          />
          <Image 
            source={defaultProfiles[1]} 
            style={[styles.avatar, styles.backAvatar]}
          />
          <Image 
            source={defaultProfiles[0]} 
            style={[styles.avatar, styles.frontAvatar]}
          />
        </View>
      </View>
    );
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        // 오른쪽으로 스와이프하는 것을 방지
        const { translationX } = event.nativeEvent;
        if (translationX > 0) {
          translateX.setValue(0);
        }
      }
    }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      
      // 왼쪽으로 70픽셀 이상 스와이프했을 때 휴지통 버튼을 보여줍니다
      if (translationX < -70) {
        Animated.timing(translateX, {
          toValue: -80,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        // 70픽셀 미만으로 스와이프했을 때는 원래 위치로 돌아갑니다
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleDeletePress = () => {
    onSwipeLeft();
    // 휴지통 버튼을 누른 후 원래 위치로 돌아갑니다
    Animated.timing(translateX, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.chatItemContainer}>
      {/* 배경의 휴지통 버튼 */}
      <View style={styles.deleteBackground}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* 스와이프 가능한 채팅 아이템 */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 0]} // 왼쪽으로만 스와이프 가능하도록 설정
      >
        <Animated.View style={[styles.chatItem, { transform: [{ translateX }] }]}>
          <TouchableOpacity style={styles.chatContent} onPress={onPress}>
            {renderProfileImages()}
            <View style={styles.textContent}>
              <View style={styles.header}>
                <View style={styles.leftSection}>
                  <Text style={styles.chatTitle} numberOfLines={1} ellipsizeMode="clip">
                    {title}
                  </Text>
                  <Text style={styles.participants} numberOfLines={1}> · {participants}명</Text>
                </View>
                <Text style={styles.timestamp}>{timestamp}</Text>
              </View>
              <View style={styles.chatDetails}>
                <Text style={styles.chatMessage} numberOfLines={1}>
                  {message}
                </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  chatItemContainer: {
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatItem: {
    backgroundColor: '#fff',
    zIndex: 2,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  avatarContainer: {
    marginRight: 15,
  },
  singleAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  multipleAvatarsContainer: {
    width: 70,
    height: 50,
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
  },
  thirdAvatar: {
    left: 20,
  },
  backAvatar: {
    left: 10,
  },
  frontAvatar: {
    left: 0,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  textContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
    minWidth: 0,
  },
  participants: {
    fontSize: 14,
    color: '#A0A0A0',
    flexShrink: 0,
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