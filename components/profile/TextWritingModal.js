import React, { useEffect, useRef } from 'react';
import { 
    Modal, 
    View, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    Text, 
    KeyboardAvoidingView, 
    Platform,
    Dimensions 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const TextWritingModal = ({ 
    visible, 
    onClose, 
    content, 
    onContentChange, 
    onSave 
}) => {
    const textInputRef = useRef(null);

    useEffect(() => {
        if (visible) {
            // 모달이 열릴 때 약간의 지연 후 포커스
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 300);
        }
    }, [visible]);

    const handleSave = () => {
        onSave();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView 
                style={styles.modalContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.modalBackground}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Feather name="x" size={24} color="#fff" />
                        </TouchableOpacity>
                        
                        <Text style={styles.headerTitle}>엽서 내용 작성하기</Text>
                        
                        <TouchableOpacity 
                            style={styles.saveButton}
                            onPress={handleSave}
                        >
                            <Text style={styles.saveButtonText}>완료</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 텍스트 입력 영역 */}
                    <View style={styles.textContainer}>
                        <TextInput
                            ref={textInputRef}
                            style={styles.textInput}
                            value={content}
                            onChangeText={onContentChange}
                            placeholder="여기에 텍스트를 입력하세요..."
                            placeholderTextColor="#888"
                            multiline={true}
                            textAlignVertical="top"
                            autoFocus={false}
                        />
                    </View>

                    {/* 글자 수 표시 */}
                    <View style={styles.footer}>
                        <Text style={styles.characterCount}>
                            {content ? content.length : 0}자
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: '#000',
        opacity: 0.9,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    closeButton: {
        padding: 5,
        width: 50,
        alignItems: 'flex-start',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    saveButton: {
        padding: 5,
        width: 50,
        alignItems: 'flex-end',
    },
    saveButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    textContainer: {
        flex: 1,
        padding: 20,
    },
    textInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        lineHeight: 24,
        textAlignVertical: 'top',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#333',
        alignItems: 'flex-end',
    },
    characterCount: {
        color: '#888',
        fontSize: 14,
    },
});

export default TextWritingModal;