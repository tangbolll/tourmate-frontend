import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
// 1. 필요한 모든 함수를 'react-native-reanimated'에서 import 합니다.
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

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
  // 2. 애니메이션 값을 저장하는 방식을 useSharedValue로 변경합니다.
  const translateX = useSharedValue(0);
  // item 객체에서 필요한 값들을 비구조화 할당으로 추출합니다.
  const { title, latestMessage: message, participants, createdAt: timestamp, unreadCount, id } = item;

  // 3. 제스처 이벤트 처리 로직을 useAnimatedGestureHandler로 통합합니다.
  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      // 오른쪽 스와이프 방지
      if (event.translationX < 0) {
        translateX.value = event.translationX;
      }
    },
    onEnd: (event) => {
      if (event.translationX < -70) {
        translateX.value = withTiming(-80);
      } else {
        translateX.value = withTiming(0);
      }
    },
  });

  // 4. 애니메이션 스타일을 정의합니다.
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const handleDeletePress = () => {
    if (onSwipeLeft) {
      // 애니메이션 스레드에서 UI 스레드로 함수 호출을 넘겨줍니다.
      runOnJS(onSwipeLeft)(id);
    }
    // 원래 위치로 복귀
    translateX.value = withTiming(0);
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
    // 5. 아이템 내부에 있던 GestureHandlerRootView를 삭제합니다.
    <View style={styles.chatItemContainer}>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
        <Ionicons name="trash" size={24} color="white" />
      </TouchableOpacity>
      
      <PanGestureHandler onGestureEvent={gestureHandler} activeOffsetX={[-10, 10]}>
        <Animated.View style={[styles.chatItem, animatedStyle]}>
          <TouchableOpacity style={styles.chatContent} onPress={() => onPress(item)}>
            {renderProfileImages()}
            <View style={styles.textContent}>
              <View style={styles.header}>
                <View style={styles.leftSection}>
                  <Text style={styles.chatTitle} numberOfLines={1}>{title}</Text>
                  <Text style={styles.participants}> · {participants?.length || 0}명</Text>
                </View>
                <Text style={styles.timestamp}>{timestamp}</Text>
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
    marginRight: 4,
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
    zIndex: 10,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default GroupChatList;