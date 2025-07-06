import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Report = ({ visible, onClose, onSubmit }) => {
    const user = '주리를 틀어라' // 추후 유저정보 넣기
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    const getFormattedDate = () => {
        const date = new Date();
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
    };

    const reportReasons = [
        { id: 'spam', label: '스팸홍보/도배입니다.' },
        { id: 'inappropriate', label: '음란물입니다.' },
        { id: 'violence', label: '불법정보를 포함하고 있습니다.' },
        { id: 'abuse', label: '욕설/생명경시/혐오/차별적 표현입니다.' },
        { id: 'personal', label: '개인정보가 노출되어 있습니다.' },
        { id: 'other', label: '불쾌한 표현이 있습니다.' },
        { id: 'custom', label: '기타' },
    ];

    const handleSubmit = () => {
        if (!selectedReason) {
        Alert.alert('알림', '신고 사유를 선택해주세요.');
        return;
        }

        if (selectedReason === 'custom' && !customReason.trim()) {
        Alert.alert('알림', '기타 사유를 입력해주세요.');
        return;
        }

        const reportData = {
        reason: selectedReason,
        customReason: selectedReason === 'custom' ? customReason : '',
        timestamp: new Date().toISOString(),
        };

        onSubmit(reportData);
        
        // 상태 초기화
        setSelectedReason('');
        setCustomReason('');
    };

    const handleClose = () => {
        setSelectedReason('');
        setCustomReason('');
        onClose();
    };

    return (
        <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
        >
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* 헤더 */}
                <View style={styles.header}>
                <Text style={styles.headerTitle}>신고</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
                </View>

                {/* 신고자 정보 */}
                <View style={styles.reporterInfo}>
                <Text style={styles.reporterLabel}>작성자 : {user}</Text>
                <Text style={styles.reportDate}>작성일시 : {(getFormattedDate())}</Text>
                </View>

                {/* 신고 사유 */}
                <View style={styles.reasonSection}>
                <Text style={styles.sectionTitle}>사유 선택</Text>
                <Text style={styles.sectionSubtitle}>
                    신고 사유를 선택해주시면 관리자가 검토 후 처리할 예정입니다.
                </Text>

                <View style={styles.reasonList}>
                    {reportReasons.map((reason) => (
                    <TouchableOpacity
                        key={reason.id}
                        style={styles.reasonItem}
                        onPress={() => setSelectedReason(reason.id)}
                    >
                        <View style={[
                        styles.radioButton,
                        selectedReason === reason.id && styles.radioButtonSelected
                        ]}>
                        {selectedReason === reason.id && (
                            <View style={styles.radioButtonInner} />
                        )}
                        </View>
                        <Text style={styles.reasonText}>{reason.label}</Text>
                    </TouchableOpacity>
                    ))}
                </View>

                {/* 기타 사유 입력 */}
                {selectedReason === 'custom' && (
                    <View style={styles.customReasonSection}>
                    <TextInput
                        style={styles.customReasonInput}
                        placeholder="신고 사유를 구체적으로 입력해주세요."
                        placeholderTextColor={333}
                        value={customReason}
                        onChangeText={setCustomReason}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    </View>
                )}
                </View>
            </ScrollView>

            {/* 버튼 */}
            <View style={styles.buttonSection}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>신고</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '90%',
        maxHeight: '80%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    reporterInfo: {
        padding: 30,
        paddingTop: 0,
        paddingBottom: 16,
    },
    reporterLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    reportDate: {
        fontSize: 14,
        color: '#666',
    },
    reasonSection: {
        padding: 30,
        paddingTop: 0,
        paddingBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
    reasonList: {
        gap: 8,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioButtonSelected: {
        borderColor: '#333',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#333',
    },
    reasonText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    customReasonSection: {
        marginTop: 8,
    },
    customReasonInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 100,
        backgroundColor: '#fff',
    },
    buttonSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#666',
    },
    submitButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#000',
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Report;