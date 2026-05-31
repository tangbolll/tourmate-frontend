import React, { useState, useCallback, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
    checkNicknameApi, 
    registerUserApi 
} from '../../utils/ProfileApi';

const RegisterDetailsScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    // Data from first registration page
    const { password, email, phoneNumber, firstname, lastname } = params;

    // States for second registration page
    const [nickname, setNickname] = useState('');
    const [nicknameChecked, setNicknameChecked] = useState(false);
    const [nicknameAvailable, setNicknameAvailable] = useState(false);
    const [nicknameCheckMessage, setNicknameCheckMessage] = useState('');
    const [gender, setGender] = useState('');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');

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

    const handleRegister = async () => {
        // Validate Year, Month, Day
        if (!year || !month || !day) {
            Alert.alert('생년월일 입력', '생년월일을 모두 입력해주세요.');
            return;
        }
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            Alert.alert('생년월일 오류', '생년월일은 숫자로만 입력해주세요.');
            return;
        }
        const dobText = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Calculate age from dobText
        const birthDate = new Date(dobText);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
        }

        // Validate Nickname and check duplication status
        if (!nicknameChecked || !nicknameAvailable) {
            Alert.alert('닉네임 확인 필요', '닉네임 중복 확인을 해주세요.');
            return;
        }

        try {
            const requestBody = {
                password,
                email,
                nickname,
                phoneNumber,
                firstname,
                lastname,
                gender,
                age: calculatedAge,
                dob: dobText,
            };

            await registerUserApi(requestBody);
            Alert.alert("회원가입 성공", "성공적으로 회원가입되었습니다. 로그인 해주세요.");
            router.replace('/auth/login');

        } catch (error) {
            Alert.alert("회원가입 실패", `오류 발생: ${error.message || '알 수 없는 오류'}`);
        }
    };

    const handleNicknameCheck = useCallback(async () => {
        if (!nickname) {
            Alert.alert('닉네임 입력', '닉네임을 입력해주세요.');
            return;
        }
        try {
            const isDuplicate = await checkNicknameApi(nickname);
            setNicknameChecked(true);
            setNicknameAvailable(!isDuplicate);
            setNicknameCheckMessage(isDuplicate ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.');
        } catch (error) {
            setNicknameChecked(false);
            setNicknameAvailable(false);
            setNicknameCheckMessage('닉네임 확인 중 오류가 발생했습니다.');
            Alert.alert('오류', '닉네임 확인 중 오류가 발생했습니다.');
        }
    }, [nickname]);

    // Determine if the Register button should be disabled
    const isRegisterButtonDisabled = (
        !nickname ||
        !gender ||
        !year ||
        !month ||
        !day ||
        !nicknameChecked ||
        !nicknameAvailable
    );

    const renderContent = () => (
        <View style={styles.form}>
            {/* Gender Selection */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>성별</Text>
                <View style={styles.genderSelectionContainer}>
                    <TouchableOpacity
                        style={[styles.genderButton, gender === 'FEMALE' && styles.genderButtonSelected]}
                        onPress={() => setGender('FEMALE')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.genderButtonText, gender === 'FEMALE' && styles.genderButtonTextSelected]}>여자</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.genderButton, gender === 'MALE' && styles.genderButtonSelected]}
                        onPress={() => setGender('MALE')}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.genderButtonText, gender === 'MALE' && styles.genderButtonTextSelected]}>남자</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Date of Birth Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>생년월일</Text>
                <Text style={styles.subLabel}>개인정보는 안전하게 보호됩니다</Text>
                  <View style={styles.dobInputContainer}>
                    <TextInput
                        style={[styles.input, styles.dobInput]}
                        placeholder="2002"
                        placeholderTextColor="#999"
                        value={year}
                        onChangeText={setYear}
                        keyboardType="numeric"
                        maxLength={4}
                    />
                    <Text style={styles.dateUnit}>년</Text>
                    <TextInput
                        style={[styles.input, styles.dobInput]}
                        placeholder="10"
                        placeholderTextColor="#999"
                        value={month}
                        onChangeText={setMonth}
                        keyboardType="numeric"
                        maxLength={2}
                    />
                    <Text style={styles.dateUnit}>월</Text>
                    <TextInput
                        style={[styles.input, styles.dobInput]}
                        placeholder="01"
                        placeholderTextColor="#999"
                        value={day}
                        onChangeText={setDay}
                        keyboardType="numeric"
                        maxLength={2}
                    />
                    <Text style={styles.dateUnit}>일</Text>
                  </View>
            </View>

            {/* Nickname input */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>별명</Text>
                <View style={styles.nicknameInputContainer}>
                    <TextInput
                        style={styles.nicknameInput}
                        placeholder="별명을 입력하세요"
                        placeholderTextColor="#999"
                        value={nickname}
                        onChangeText={(text) => {
                            setNickname(text);
                            setNicknameChecked(false);
                            setNicknameAvailable(false);
                            setNicknameCheckMessage('');
                        }}
                    />
                    <TouchableOpacity
                        style={styles.checkButtonInside}
                        onPress={handleNicknameCheck}
                        disabled={!nickname}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.checkButtonInsideText}>중복 확인</Text>
                    </TouchableOpacity>
                </View>
                {nicknameCheckMessage ? (
                    <Text style={[styles.emailMessage, nicknameAvailable ? styles.emailAvailable : styles.emailTaken]}>
                        {nicknameCheckMessage}
                    </Text>
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
                        <View style={[styles.progress, { width: '100%' }]} />
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
            </KeyboardAwareScrollView>

            <View style={styles.fixedBottomButton}>
                <TouchableOpacity
                    onPress={handleRegister}
                    style={[styles.registerButton, isRegisterButtonDisabled && styles.disabledButton]}
                    disabled={isRegisterButtonDisabled}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.registerButtonText, isRegisterButtonDisabled && styles.disabledButtonText]}>가입</Text>
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
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 24,
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
    subLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
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
    emailInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    emailInput: {
        flex: 1,
        marginRight: 10,
    },
    // New styles for nickname input with button inside
    nicknameInputContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    nicknameInput: {
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
        borderRadius: 8,
        alignItems: 'center',
    },
    checkButtonText: {
        color: 'white',
        fontSize: 16,
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
    genderSelectionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 5,
        marginBottom: 10,
    },
    genderButton: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
        marginHorizontal: 5,
        backgroundColor: '#f9f9f9',
    },
    genderButtonSelected: {
        backgroundColor: 'black',
        borderColor: 'black',
    },
    genderButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    genderButtonTextSelected: {
        color: '#fff',
    },
    dobInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dobInput: {
        flex: 1,
        minWidth: 60,
        paddingVertical: 2,
        paddingHorizontal: 10,
        marginRight: 8,
        marginTop: 2,
    },
    dateUnit: {
        fontSize: 14,
        color: '#666',
        // minWidth: 8,
        marginRight: 8,
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

export default RegisterDetailsScreen;