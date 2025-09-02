import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import setupAxiosInterceptor from '../../utils/axiosInterceptor';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InquiryHistoryScreen = () => {
  const router = useRouter();
  const [inquiries, setInquiries] = useState([]);
  const api = setupAxiosInterceptor();

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        const response = await api.get('/api/inquiries', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInquiries(response.data);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
      }
    };

    fetchInquiries();
  }, []);

  const hasInquiries = inquiries.length > 0;

  const renderInquiryItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.inquiryItem} onPress={() => router.push(`/profile/inquiry-detail?id=${item.id}`)}>
      <View style={styles.inquiryTextContent}>
        <Text style={styles.inquiryType}>{item.type.endsWith(' 문의') ? item.type : `${item.type} 문의`}</Text>
        <Text style={styles.inquiryTitle}>{item.title}</Text>
        <Text style={styles.inquiryDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={[
        styles.statusBadge,
        item.status === 'ANSWERED' ? styles.statusAnswered : styles.statusPending,
      ]}>
        <Text style={styles.statusText}>{item.status === 'ANSWERED' ? '답변 완료' : '답변 대기'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 문의 내역</Text>
        <View style={{ width: 24 }} />
      </View>

      {hasInquiries ? (
        <ScrollView style={styles.inquiryList}>
          {inquiries.map(renderInquiryItem)}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={60} color="#E0E0E0" />
          <Text style={styles.emptyText}>문의 내역이 없습니다.</Text>
          <Text style={styles.emptyTextSmall}>궁금한 점이 있다면 문의사항을 남겨주세요.</Text>
          <TouchableOpacity style={styles.goToSubmitButton} onPress={() => router.push('/profile/inquiry')}>
            <Text style={styles.goToSubmitButtonText}>문의사항 접수하기</Text>
          </TouchableOpacity>
        </View>
      )}
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
  // 문의 내역이 있을 때
  inquiryList: {
    flex: 1,
  },
  inquiryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inquiryTextContent: {
    flex: 1,
  },
  inquiryType: {
    fontSize: 14,
    color: 'black',
    marginBottom: 4,
  },
  inquiryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  inquiryDate: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusAnswered: {
    backgroundColor: '#E8F5E9',
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  // 문의 내역이 없을 때
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 10,
  },
  emptyTextSmall: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 4,
  },
  goToSubmitButton: {
    marginTop: 20,
    backgroundColor: '#42A5F5',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  goToSubmitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InquiryHistoryScreen;
