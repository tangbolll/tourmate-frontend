import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TermsAgreementScreen = () => {
    const router = useRouter();
    const [allAgreed, setAllAgreed] = useState(false);
    const [ageAgreed, setAgeAgreed] = useState(false);
    const [termsAgreed, setTermsAgreed] = useState(false);
    const [privacyAgreed, setPrivacyAgreed] = useState(false);
    const [marketingAgreed, setMarketingAgreed] = useState(false);
    const [locationTermsAgreed, setLocationTermsAgreed] = useState(false);

    useEffect(() => {
        setAllAgreed(ageAgreed && termsAgreed && privacyAgreed && marketingAgreed && locationTermsAgreed);
    }, [ageAgreed, termsAgreed, privacyAgreed, marketingAgreed, locationTermsAgreed]);

    const handleAllAgreed = () => {
        const newState = !allAgreed;
        setAllAgreed(newState);
        setAgeAgreed(newState);
        setTermsAgreed(newState);
        setPrivacyAgreed(newState);
        setMarketingAgreed(newState);
        setLocationTermsAgreed(newState);
    };

    const handleRegister = () => {
        if (!ageAgreed || !termsAgreed || !privacyAgreed || !locationTermsAgreed) {
            alert('필수 약관에 모두 동의해야 가입할 수 있습니다.');
            return;
        }
        // Navigate to the next registration step (e.g., register.js or register-method-select.js)
        // For now, let's navigate to the existing register.js
        router.push({
            pathname: '/auth/register',
            params: { marketingConsent: marketingAgreed },
        });
    };

    const Checkbox = ({ label, isChecked, onPress, isRequired = false, showOptionalRequired = true, showViewContent = false, viewContentPath }) => (
        <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
            <Ionicons
                name={isChecked ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={isChecked ? 'black' : '#ccc'}
            />
            <Text style={styles.checkboxLabel}>{label}{showOptionalRequired && isRequired && <Text style={styles.requiredText}> (필수)</Text>}{showOptionalRequired && !isRequired && <Text style={styles.optionalText}> (선택)</Text>}</Text>
            {showViewContent && (
                <TouchableOpacity onPress={() => router.push(viewContentPath)}>
                    <Text style={styles.viewContentText}>내용보기</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>회원가입</Text>
                    <View style={{ width: 24 }} />
                </View>
            </View>
            <Text style={styles.sectionTitle}>서비스 정책</Text>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Checkbox
                    label="전체 동의"
                    isChecked={allAgreed}
                    onPress={handleAllAgreed}
                    showOptionalRequired={false}
                />
                <View style={styles.divider} />

                <Checkbox
                    label="만 14세 이상입니다."
                    isChecked={ageAgreed}
                    onPress={() => setAgeAgreed(!ageAgreed)}
                    isRequired
                />
                <Checkbox
                    label="서비스 이용약관 동의"
                    isChecked={termsAgreed}
                    onPress={() => setTermsAgreed(!termsAgreed)}
                    isRequired
                    showViewContent
                    viewContentPath='/profile/terms-and-policies/terms-of-service'
                />
                <Checkbox
                    label="개인정보 수집 및 이용 동의"
                    isChecked={privacyAgreed}
                    onPress={() => setPrivacyAgreed(!privacyAgreed)}
                    isRequired
                    showViewContent
                    viewContentPath='/profile/terms-and-policies/privacy-policy'
                />
                <Checkbox
                    label="위치기반서비스 이용약관 동의"
                    isChecked={locationTermsAgreed}
                    onPress={() => setLocationTermsAgreed(!locationTermsAgreed)}
                    isRequired
                    showViewContent
                    viewContentPath='/profile/terms-and-policies/location-terms'
                />
                <Checkbox
                    label="마케팅 수신 동의"
                    isChecked={marketingAgreed}
                    onPress={() => setMarketingAgreed(!marketingAgreed)}
                    showViewContent
                    viewContentPath='/profile/terms-and-policies/marketing-policy' // Assuming a marketing policy screen
                />
            </ScrollView>

            <View style={styles.fixedBottomButton}>
                <TouchableOpacity
                    onPress={handleRegister}
                    style={[styles.registerButton, (!ageAgreed || !termsAgreed || !privacyAgreed) && styles.disabledButton]}
                    disabled={!ageAgreed || !termsAgreed || !privacyAgreed || !locationTermsAgreed}
                >
                    <Text style={styles.registerButtonText}>다음</Text>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'left',
        marginBottom: 20,
        color: 'black',
        paddingHorizontal: 20,
    },
    scrollContent: {
        padding: 20,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    checkboxLabel: {
        fontSize: 16,
        marginLeft: 10,
        flex: 1, // Allow text to take up space
    },
    requiredText: {
        fontSize: 14,
        color: 'black',
        marginLeft: 5,
    },
    optionalText: {
        fontSize: 14,
        color: 'black',
        marginLeft: 5,
    },
                viewContentText: {
        fontSize: 12,
        color: '#A9A9A9',
        textDecorationLine: 'underline',
        marginLeft: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
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
});

export default TermsAgreementScreen;
