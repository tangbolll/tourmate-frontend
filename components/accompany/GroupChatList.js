import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// 기본 프로필 이미지들
const defaultProfiles = [
  require('../../assets/defaultprofile.png')
];

const getFullImageUrl = (imagePath) => {
    if (!imagePath || imagePath.startsWith('http')) {
        return imagePath;
    }
    return `${API_URL}${imagePath}`;
};

const GroupChatList = ({ item, onPress, onSwipeLeft }) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const translateX = useSharedValue(0);
  const { title, latestMessage: message, participants, createdAt: timestamp, unreadCount, id } = item;

  // 스와이프 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // 삭제 버튼 애니메이션 스타일
  const deleteButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value < -20 ? 1 : 0,
      transform: [{ scale: translateX.value < -20 ? 1 : 0.8 }],
    };
  });

  // 스와이프 제스처
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // 왼쪽으로만 스와이프 허용
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -100);
      } else if (isSwipeOpen) {
        // 오른쪽으로 스와이프하면 닫기
        translateX.value = Math.min(event.translationX - 100, 0);
      }
    })
    .onEnd((event) => {
      const shouldOpen = event.translationX < -50;
      const shouldClose = event.translationX > 50 && isSwipeOpen;
      
      if (shouldOpen && !isSwipeOpen) {
        translateX.value = withTiming(-100);
        runOnJS(setIsSwipeOpen)(true);
      } else if (shouldClose || (!shouldOpen && isSwipeOpen)) {
        translateX.value = withTiming(0);
        runOnJS(setIsSwipeOpen)(false);
      } else if (!isSwipeOpen) {
        translateX.value = withTiming(0);
      } else {
        translateX.value = withTiming(-100);
      }
    });

  const handleDeletePress = () => {
    if (onSwipeLeft) {
      onSwipeLeft(id);
    }
    // 스와이프 닫기
    translateX.value = withTiming(0);
    setIsSwipeOpen(false);
  };

  const handleChatPress = () => {
    if (isSwipeOpen) {
      // 스와이프가 열려있으면 닫기
      translateX.value = withTiming(0);
      setIsSwipeOpen(false);
    } else {
      // 채팅방 열기
      onPress(item);
    }
  };

  // 겹쳐진 프로필 렌더링 함수
  const renderProfileImages = () => {
    if (!participants || participants.length === 0) {
      return (
        <Image 
          source={defaultProfiles[0]} 
          style={styles.singleAvatar}
        />
      );
    }
    
    if (participants.length === 1) {
      return (
        <Image 
          source={{ uri: getFullImageUrl(participants[0].profileImage) }} 
          style={styles.singleAvatar}
        />
      );
    }
    
    // 2명일 때
    if (participants.length === 2) {
      return (
        <View style={styles.multipleAvatarsContainer}>
          <Image 
            source={{ uri: getFullImageUrl(participants[1].profileImage) }} 
            style={[styles.avatar, styles.backAvatar]}
          />
          <Image 
            source={{ uri: getFullImageUrl(participants[0].profileImage) }} 
            style={[styles.avatar, styles.frontAvatar]}
          />
        </View>
      );
    }
    
    // 3명 이상일 때 3개 프로필 모두 표시
    return (
      <View style={styles.avatarContainer}>
        <View style={styles.multipleAvatarsContainer}>
          <Image 
            source={{ uri: getFullImageUrl(participants[2].profileImage) }} 
            style={[styles.avatar, styles.thirdAvatar]}
          />
          <Image 
            source={{ uri: getFullImageUrl(participants[1].profileImage) }} 
            style={[styles.avatar, styles.backAvatar]}
          />
          <Image 
            source={{ uri: getFullImageUrl(participants[0].profileImage) }} 
            style={[styles.avatar, styles.frontAvatar]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.chatItemContainer}>
      {/* 삭제 버튼 (뒤쪽에 숨겨짐) */}
      <Animated.View style={[styles.deleteButtonContainer, deleteButtonStyle]}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
          <Ionicons name="trash" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>
      
      {/* 메인 채팅 아이템 */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.chatItem, animatedStyle]}>
          <TouchableOpacity 
            style={styles.chatContent} 
            onPress={handleChatPress}
            activeOpacity={0.7}
          >
            {renderProfileImages()}
            <View style={styles.textContent}>
              <View style={styles.header}>
                <View style={styles.leftSection}>
                  <Text style={styles.chatTitle} numberOfLines={1}>{title}</Text>
                  <Text style={styles.participants}> · {participants?.length || 0}명</Text>
                </View>
                <View style={styles.rightSection}>
                  <Text style={styles.timestamp}>{timestamp}</Text>
                </View>
              </View>
              <View style={styles.chatDetails}>
                <Text style={styles.chatMessage} numberOfLines={1}>{message}</Text>
                
                {unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  chatItemContainer: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  deleteButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButton: {
    backgroundColor: '#FF6347',
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
    marginRight: 4,
  },
  singleAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    zIndex: 10,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default GroupChatList;