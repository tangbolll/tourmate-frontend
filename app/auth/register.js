import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Alert, 
    ScrollView, 
    StyleSheet, 
    Platform, 
    Keyboard 
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { checkEmailApi } from '../../utils/ProfileApi';

const RegisterScreen = () => {
    const router = useRouter();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    
    // Form states
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMismatchMessage, setPasswordMismatchMessage] = useState('');
    const [email, setEmail] = useState('');
    const [emailChecked, setEmailChecked] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(false);
    const [emailCheckMessage, setEmailCheckMessage] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');

    // Keyboard visibility listener
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        );

        return () => {
            keyboardDidShowListener?.remove();
            keyboardDidHideListener?.remove();
        };
    }, []);

    const handleNext = () => {
        if (!lastname || !firstname || !email || !password || !confirmPassword || !phoneNumber) {
            Alert.alert('필수 정보 누락', '모든 필수 정보를 입력해주세요.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('비밀번호 불일치', '비밀번호와 비밀번호 확인이 일치하지 않습니다.');
            return;
        }
        if (!emailChecked || !emailAvailable) {
            Alert.alert('이메일 확인 필요', '이메일 중복 확인을 해주세요.');
            return;
        }

        router.push({
            pathname: '/auth/register-details',
            params: {
                password,
                email,
                phoneNumber,
                firstname,
                lastname,
            },
        });
    };
    
    const handleEmailCheck = async () => {
        if (!email) {
            Alert.alert('이메일 입력', '이메일을 입력해주세요.');
            return;
        }

        try {
            const isTaken = await checkEmailApi(email);
            setEmailChecked(true);
            setEmailAvailable(!isTaken);
            setEmailCheckMessage(isTaken ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.');
        } catch (error) {
            console.error("Email check failed:", error.message);
            setEmailChecked(false);
            setEmailAvailable(false);
            setEmailCheckMessage('이메일 확인 중 오류가 발생했습니다.');
            Alert.alert('오류', error.message);
        }
    };

    const isNextButtonDisabled = (
        !lastname ||
        !firstname ||
        !email ||
        !password ||
        !confirmPassword ||
        !phoneNumber ||
        password !== confirmPassword ||
        !emailChecked ||
        !emailAvailable
    );

    const renderContent = () => (
        <View style={styles.form}>
            <View style={styles.nameRow}>
                <View style={[styles.inputGroup, styles.nameInputGroup, { marginRight: 10 }]}>
                    <Text style={styles.label}>성</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="성을 입력하세요"
                        placeholderTextColor="#999"
                        value={lastname}
                        onChangeText={setLastname}
                    />
                </View>

                <View style={[styles.inputGroup, styles.nameInputGroup]}>
                    <Text style={styles.label}>이름</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="이름을 입력하세요"
                        placeholderTextColor="#999"
                        value={firstname}
                        onChangeText={setFirstname}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>이메일</Text>
                <View style={styles.emailInputContainer}>
                    <TextInput
                        style={styles.emailInput}
                        placeholder="이메일 주소를 입력하세요"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setEmailChecked(false);
                            setEmailAvailable(false);
                            setEmailCheckMessage('');
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        style={styles.checkButtonInside}
                        onPress={handleEmailCheck}
                        disabled={!email}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.checkButtonInsideText}>중복 확인</Text>
                    </TouchableOpacity>
                </View>
                {emailCheckMessage ? (
                    <Text style={[styles.emailMessage, emailAvailable ? styles.emailAvailable : styles.emailTaken]}>
                        {emailCheckMessage}
                    </Text>
                ) : null}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>전화번호</Text>
                <TextInput
                    style={styles.input}
                    placeholder="예: 01012345678"
                    placeholderTextColor="#999"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>비밀번호</Text>
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호를 입력하세요"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (confirmPassword && text !== confirmPassword) {
                            setPasswordMismatchMessage('비밀번호가 일치하지 않습니다.');
                        } else {
                            setPasswordMismatchMessage('');
                        }
                    }}
                    secureTextEntry
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>비밀번호 확인</Text>
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호를 다시 입력하세요"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (password && text !== password) {
                            setPasswordMismatchMessage('비밀번호가 일치하지 않습니다.');
                        } else {
                            setPasswordMismatchMessage('');
                        }
                    }}
                    secureTextEntry
                />
                {passwordMismatchMessage ? (
                    <Text style={styles.errorMessage}>{passwordMismatchMessage}</Text>
                ) : null}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>회원 가입</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progress, { width: '50%' }]} />
                    </View>
                </View>
            </View>

            <KeyboardAwareScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContainer}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                extraHeight={Platform.OS === 'ios' ? 120 : 80}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                nestedScrollEnabled={true}
            >
                {renderContent()}
                <View style={styles.spacer} />
            </KeyboardAwareScrollView>

            <View style={styles.fixedBottomButton}>
                <TouchableOpacity
                    onPress={handleNext}
                    style={[styles.registerButton, isNextButtonDisabled && styles.disabledButton]}
                    disabled={isNextButtonDisabled}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.registerButtonText, isNextButtonDisabled && styles.disabledButtonText]}>다음</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    progressContainer: {
        paddingHorizontal: 16,
        marginTop: 8,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#f0f0f0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        backgroundColor: '#000',
        borderRadius: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 100,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: 'white',
        color: '#000',
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    nameInputGroup: {
        flex: 1,
        marginBottom: 0,
    },
    // New styles for email input with button inside
    emailInputContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    emailInput: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingRight: 100, // Space for the button
        fontSize: 16,
        backgroundColor: 'white',
        color: '#000',
    },
    checkButtonInside: {
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: [{ translateY: -15 }], // Half of button height
        backgroundColor: 'gray',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkButtonInsideText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    checkButton: {
        backgroundColor: 'gray',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emailMessage: {
        marginTop: -10,
        marginBottom: 10,
        fontSize: 14,
        paddingLeft: 5,
    },
    emailAvailable: {
        color: 'green',
    },
    emailTaken: {
        color: 'red',
    },
    errorMessage: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
        paddingLeft: 5,
    },
    spacer: {
        height: 40,
    },
    fixedBottomButton: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    registerButton: {
        backgroundColor: 'black',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    registerButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#B1B1B1',
    },
    disabledButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;