import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TermsAndPoliciesScreen = () => {
    const router = useRouter();

    const navigateToDetail = (path) => {
        router.push(path);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>약관 및 정책</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView style={styles.content}>
                <TouchableOpacity style={styles.itemContainer} onPress={() => navigateToDetail('/profile/terms-and-policies/terms-of-service')}>
                    <Text style={styles.itemText}>서비스 이용약관</Text>
                    <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
                </TouchableOpacity>
                <View style={styles.divider} />

                <TouchableOpacity style={styles.itemContainer} onPress={() => navigateToDetail('/profile/terms-and-policies/privacy-policy')}>
                    <Text style={styles.itemText}>개인정보 처리방침</Text>
                    <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
                </TouchableOpacity>
                <View style={styles.divider} />

                <TouchableOpacity style={styles.itemContainer} onPress={() => navigateToDetail('/profile/terms-and-policies/location-terms')}>
                    <Text style={styles.itemText}>위치기반서비스 이용약관</Text>
                    <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
                </TouchableOpacity>
                <View style={styles.divider} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: 'white',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 0,
    },
});

export default TermsAndPoliciesScreen;
