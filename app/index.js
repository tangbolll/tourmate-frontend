import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  SafeAreaView,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// 메인 Chat 스크린 컴포넌트
const Chat = ({ 
  location = "화천 산천어 축제", 
  participants = "2명 / 5명",
  hostMessage = "10시 화천 산천어 광장에서 만나요!" 
}) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: { name: '여라미', isHost: true },
      text: '안녕하세요, 여러분! 😊 우리 동행 팀 모임 시간을 다시 한 번 안내드릴게요!\n저희는 10시에 화천 산천어 축제 앞에서 만날 예정이에요!\n높으면 다같이 맘잡히지 어려우니까 꼭 시간 맞춰서 도착해 주시면 감사할 것 같아요 ☺️☺️☺️\n그럼 내일 뵙겠습니다!',
      time: '오전 9:23'
    },
    {
      id: 2,
      user: { name: '밥', isSelf: true },
      text: '넵! 감사합니다.',
      time: '오전 9:25'
    },
    {
      id: 3,
      user: { name: '주리클럽이라', isOther: true },
      text: '혹시 입구가 어떤 곳데인가요? 정확한 위치 알려주시면 감사하겠습니다!',
      time: '오전 9:28'
    },
    {
      id: 4,
      user: { name: '여라미', isHost: true },
      text: '네! 정확한 위치는 산천어 축제 메인 입구 앞입니다. 지도 핑 크 공유해 드릴게요!\n제 연락처는 010-XXXX-XXXX입니다! 늦으시면 연락 주세요!! 그럼 내일 아침에 뵙겠습니다. 다들 따뜻하게 입고 오세요!',
      time: '오전 9:30'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef();

  const handleSend = () => {
    if (inputText.trim() === '') return;
    
    const newMessage = {
      id: messages.length + 1,
      user: { name: '밥', isSelf: true },
      text: inputText,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 부분 */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.headerLocationRow}>
            <Feather name="map-pin" size={16} color="black" />
            <Text style={styles.locationText}>{location}</Text>
            <Text style={styles.participantsText}>{participants}</Text>
          </View>
          <Text style={styles.headerTitle}>{location}에서 놀아요</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonText}>게시물 보기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Feather name="more-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 공지사항 */}
      <TouchableOpacity style={styles.announcementContainer}>
        <Feather name="volume-2" size={20} color="black" />
        <Text style={styles.announcementText}>{hostMessage}</Text>
      </TouchableOpacity>

      {/* 채팅 메시지 목록 */}
      <ScrollView 
        style={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ScrollView>

      {/* 하단 버튼 영역 */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>내 위치 공유하기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>사진/동영상 전송하기</Text>
        </TouchableOpacity>
      </View>

      {/* 메시지 입력 영역 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
        style={styles.inputContainer}
      >
        <TouchableOpacity style={styles.addButton}>
          <Feather name="plus" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력해주세요."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity onPress={handleSend} disabled={!inputText.trim()}>
          <Feather name="send" size={24} color={inputText.trim() ? "#3B82F6" : "#9CA3AF"} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// 메시지 버블 컴포넌트
const MessageBubble = ({ message }) => {
  const { user, text, time } = message;
  const isSelf = user.isSelf;
  const isHost = user.isHost;
  
  return (
    <View style={[
      styles.messageRow,
      isSelf ? styles.selfMessageRow : {}
    ]}>
      {!isSelf && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          {isHost && <Text style={styles.hostTag}>호스트</Text>}
        </View>
      )}
      
      <View style={styles.messageContentContainer}>
        <View style={[
          styles.messageBubble,
          isSelf ? styles.selfMessageBubble : {},
          isHost ? styles.hostMessageBubble : {}
        ]}>
          <Text style={styles.messageText}>{text}</Text>
        </View>
        {isSelf && <Text style={styles.messageTime}>{time}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#9CA3AF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    marginRight: 8,
  },
  participantsText: {
    fontSize: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailButton: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  detailButtonText: {
    fontSize: 12,
  },
  menuButton: {
    padding: 4,
  },
  announcementContainer: {
    backgroundColor: 'white',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  announcementText: {
    marginLeft: 8,
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 8,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selfMessageRow: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 10,
    marginTop: 2,
  },
  hostTag: {
    fontSize: 9,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  messageContentContainer: {
    maxWidth: '70%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  selfMessageBubble: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
  },
  hostMessageBubble: {
    backgroundColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
    alignSelf: 'flex-end',
  },
  bottomButtons: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4B5563',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  addButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    marginHorizontal: 8,
  },
});

export default Chat;