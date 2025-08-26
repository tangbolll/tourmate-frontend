import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InquiryDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiryDetail = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          Alert.alert('오류', '로그인이 필요합니다.');
          router.replace('/auth/login');
          return;
        }
        const response = await axios.get(`http://localhost:8080/api/inquiries/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInquiry(response.data);
      } catch (error) {
        console.error('Error fetching inquiry detail:', error);
        Alert.alert('오류', '문의 상세 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInquiryDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </SafeAreaView>
    );
  }

  if (!inquiry) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>문의 정보를 찾을 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문의 상세</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>유형</Text>
          <Text style={styles.value}>{inquiry.type.endsWith(' 문의') ? inquiry.type : `${inquiry.type} 문의`}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>접수일</Text>
          <Text style={styles.value}>{new Date(inquiry.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>상태</Text>
          <Text style={[
            styles.value,
            inquiry.status === 'ANSWERED' ? styles.statusAnsweredText : styles.statusPendingText,
          ]}>
            {inquiry.status === 'ANSWERED' ? '답변 완료' : '답변 대기'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의 내용</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>{inquiry.content}</Text>
          </View>
        </View>

        {inquiry.status === 'ANSWERED' && inquiry.answerContent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>답변</Text>
            <View style={styles.contentBox}>
              <Text style={styles.contentText}>{inquiry.answerContent}</Text>
              {inquiry.answeredAt && (
                <Text style={styles.answerDate}>답변일: {new Date(inquiry.answeredAt).toLocaleDateString()}</Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  loadingText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: 'red',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 80, // Fixed width for labels
  },
  value: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusAnsweredText: {
    color: 'green',
    fontWeight: 'bold',
  },
  statusPendingText: {
    color: 'orange',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  contentBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  contentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  answerDate: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 10,
    textAlign: 'right',
  },
});

export default InquiryDetailScreen;
