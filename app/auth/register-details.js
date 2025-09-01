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


import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { 
    checkNicknameApi, 
    registerUserApi, 
    handleLoginApi 
} from '../../utils/ProfileApi';
import { useAuth } from '../../context/AuthContext';

const getDaysInMonth = (year, month) => {
    if (!year || !month) return 31; // Default to 31 if year or month not selected
    return new Date(year, month, 0).getDate();
};

const RegisterDetailsScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const { signIn } = useAuth();

    // Data from first registration page
    const { password, email, phoneNumber, firstname, lastname, marketingConsent } = params;

    // States for second registration page
    const [nickname, setNickname] = useState('');
    const [nicknameChecked, setNicknameChecked] = useState(false);
    const [nicknameAvailable, setNicknameAvailable] = useState(false);
    const [nicknameCheckMessage, setNicknameCheckMessage] = useState('');
    const [gender, setGender] = useState('');
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');

    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
    const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
    const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);

    // Generate years for dropdown
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString()); // Last 100 years

    // Generate months for dropdown
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const [dynamicDays, setDynamicDays] = useState([]); // New state for dynamic days

    useEffect(() => {
        if (year && month) {
            const daysCount = getDaysInMonth(parseInt(year), parseInt(month));
            const newDays = Array.from({ length: daysCount }, (_, i) => (i + 1).toString().padStart(2, '0'));
            setDynamicDays(newDays);

            // If the current day is greater than the new max days, reset day
            if (day && parseInt(day) > daysCount) {
                setDay(''); // Reset day if it's out of range for the new month/year
            }
        } else {
            setDynamicDays(Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'))); // Default to 31
        }
    }, [year, month, day]); // Include day in dependency to re-evaluate if day needs reset

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
                marketingConsent,
            };

            await registerUserApi(requestBody);
            const loginResult = await handleLoginApi(email, password);
            if (loginResult.success) {
                await signIn(loginResult.token, loginResult.userId);
                router.replace('/auth/registration-success');
            } else {
                Alert.alert('로그인 실패', loginResult.message);
            }
            

        } catch (error) {
            console.error("Registration Failed:", error);
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
            console.error("Nickname check failed:", error.response?.data || error.message);
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
            <View style={styles.dobInputGroup}>
                <Text style={styles.label}>생년월일</Text>
                <Text style={styles.subLabel}>개인정보는 안전하게 보호됩니다</Text>
                <View style={styles.dobInputContainer}>
                    {/* Year Dropdown */}
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                        >
                            <Text style={[styles.dropdownText, !year && styles.placeholderText]}>
                                {year || '년'}
                            </Text>
                            <Ionicons
                                name={isYearDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                                size={20}
                                color="#9E9E9E"
                            />
                        </TouchableOpacity>
                        {isYearDropdownOpen && (
                            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled={true}>
                                {years.map((y) => (
                                    <TouchableOpacity
                                        key={y}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setYear(y);
                                            setIsYearDropdownOpen(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{y}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                    <Text style={styles.dateUnit}>년</Text>

                    {/* Month Dropdown */}
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                        >
                            <Text style={[styles.dropdownText, !month && styles.placeholderText]}>
                                {month || '월'}
                            </Text>
                            <Ionicons
                                name={isMonthDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                                size={20}
                                color="#9E9E9E"
                            />
                        </TouchableOpacity>
                        {isMonthDropdownOpen && (
                            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled={true}>
                                {months.map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setMonth(m);
                                            setIsMonthDropdownOpen(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{m}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
                    <Text style={styles.dateUnit}>월</Text>

                    {/* Day Dropdown */}
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity
                            style={styles.dropdownButton}
                            onPress={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
                        >
                            <Text style={[styles.dropdownText, !day && styles.placeholderText]}>
                                {day || '일'}
                            </Text>
                            <Ionicons
                                name={isDayDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                                size={20}
                                color="#9E9E9E"
                            />
                        </TouchableOpacity>
                        {isDayDropdownOpen && (
                            <ScrollView style={styles.dropdownMenu} nestedScrollEnabled={true}>
                                {dynamicDays.map((d) => (
                                    <TouchableOpacity
                                        key={d}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setDay(d);
                                            setIsDayDropdownOpen(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownItemText}>{d}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>
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

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
                nestedScrollEnabled={true}
            >
                {renderContent()}
            </ScrollView>

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
        overflow: 'visible', // Ensure content can overflow
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
    dobInputGroup: {
        marginBottom: 15,
        zIndex: 10, // A high z-index to ensure it's above other input groups
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
        zIndex: 1, // Set a lower z-index than the dropdowns
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
        justifyContent: 'space-between', // Distribute space evenly
        overflow: 'visible', // Allow content to overflow
    },
    dateUnit: {
        fontSize: 14,
        color: '#666',
        // minWidth: 8,
        marginRight: 8,
    },
    dropdownContainer: {
        flex: 1,
        position: 'relative',
        zIndex: 998, // Significantly higher z-index
        marginRight: 8, // Add margin to separate dropdowns
    },
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        height: 50, // Match input height
        borderWidth: 1,
        borderColor: '#ccc',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#9E9E9E',
    },
    dropdownMenu: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginTop: 8,
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 999, // Significantly higher z-index
        borderWidth: 1,
        borderColor: '#E0E0E0',
        maxHeight: 200, // Limit height for scrollability
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#333',
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