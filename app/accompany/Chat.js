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
    Animated
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MessageBubble from '../../components/accompany/MessageBubble';
import Icon from 'react-native-vector-icons/Feather';

const Chat = ({ 
    location = "강원도 화천",
    title = "화천 산천어 축제에서 놀아요", 
    participantsCurrent = 3,
    participantsTotal = 5,
    hostMessage = "10시 화천 산천어 광장에서 만나요!" 
}) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            user: { name: '여라미', isHost: true },
            text: '[SampleMessage1]\n안녕하세요, 여러분! 😊 우리 동행 팀 모임 시간을 다시 한 번 안내드릴게요!\n저희는 10시에 화천 산천어 축제 앞에서 만날 예정이에요! 늦으면 다같이 입장하기 어려우니까 꼭 시간 맞춰서 도착해 주시면 감사할 것 같아요 ㅎㅎㅎ\n그럼 내일 뵙겠습니다!',
            time: '오전 9:23'
        },
        {
            id: 2,
            user: { name: '밥', isSelf: true },
            text: '[SampleMessage4]\n혹시 김태뿌지직도 참여하나요?',
            time: '오전 9:25'
        },
        {
            id: 3,
            user: { name: '주리를틀어라', isOther: true },
            text: '[SampleMessage3]\n헐 전 뿌지직님은 좀 그런데 ㅜ',
            time: '오전 9:28'
        },
        {
            id: 4,
            user: { name: '여라미', isHost: true },
            text: '[SampleMessage4]\n김태뿌지직님 강퇴시키겠습니다.',
            time: '오전 9:30'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [showActions, setShowActions] = useState(false);
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

    const toggleActions = () => {
        setShowActions(!showActions);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 부분 */}
            <View style={styles.header}>
                <View style={styles.headerLocationRow}>
                    <Icon name="map-pin" size={12} color="black" style={styles.icon} />
                    <Text style={styles.locationText}>{location}</Text>
                    <Icon name="user" size={12} color="black" style={[styles.icon, { marginLeft: 12 }]} />
                    <Text style={styles.participantsText}> {participantsCurrent}명 / {participantsTotal}명</Text>
                </View>
                <View style={styles.headerTitleRow}>
                    <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity style={styles.detailButton}>
                            <Text style={styles.detailButtonText}>게시물 보기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuButton}>
                            <Feather name="more-vertical" size={20} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* 공지사항 */}
            <View style={styles.announcementWrapper}>
                <View style={styles.announcementContainer}>
                    <Feather name="volume-2" size={20} color="black" />
                    <Text style={styles.announcementLabel}>공지사항</Text>
                    <Text style={styles.announcementText}>{hostMessage}</Text>
                </View>
            </View>

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

            {/* 확장 버튼 클릭 시 노출되는 하단 버튼 영역 */}
            {showActions && (
                <View style={styles.bottomButtons}>
                    <TouchableOpacity style={styles.actionButtonTop}>
                        <Text style={styles.actionButtonText}>내 위치 공유하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonBottom}>
                        <Text style={styles.actionButtonText}>사진/동영상 전송하기</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* 메시지 입력 영역 */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={68}
                style={styles.inputContainer}
            >
                <TouchableOpacity style={styles.addButton} onPress={toggleActions}>
                    <Feather name={showActions ? "x" : "plus"} size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="메시지를 입력해주세요."
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!inputText.trim()}>
                        <Feather name="send" size={20} color={inputText.trim() ? "#3B82F6" : "#9CA3AF"} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#9CA3AF',
        paddingTop: 30,
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    headerLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 4, 
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,  // 남은 공간 차지하도록
    },
    detailButton: {
        backgroundColor: '#DEE2E6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginLeft: 4,
        marginRight: 8,
    },
    detailButtonText: {
        fontSize: 12,
    },
    menuButton: {
        padding: 4,
        marginLeft: 'auto',
    },
    announcementWrapper: {
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: 'transparent',
    },
    announcementContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#9CA3AF',
        flexDirection: 'row',
        alignItems: 'center',
    },
    announcementLabel: {
        marginLeft: 8,
        fontWeight: 'bold',
        color: '#333',
    },
    announcementText: {
        marginLeft: 8,
        flex: 1,
        color: '#333',
    },
    messagesContainer: {
        flex: 1,
        padding: 8,
    },
    bottomButtons: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    actionButtonTop: {
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4B5563',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    actionButtonBottom: {
        padding: 12,
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
        padding: 6,
        marginRight: 4,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 20,
        paddingLeft: 12,
        paddingRight: 4,
        marginRight: 8,
        backgroundColor: 'white',
    },
    input: {
        flex: 1,
        paddingVertical: 8,
        maxHeight: 100,
        color: '#000',
    },
    sendButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export default Chat;