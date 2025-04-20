import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import dayjs from 'dayjs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CalendarPicker from 'react-native-calendar-picker';

const CUSTOM_LOCALE = {
  months: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  weekdays: ['일', '월', '화', '수', '목', '금', '토'],
};

export default function CalendarPopup({ visible, onClose = () => {}, onSelectDates = () => {} }) {
  // 날짜 범위 상태 관리
  const [range, setRange] = useState({ startDate: null, endDate: null });
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // visible이 변경될 때 상태 초기화
  useEffect(() => {
    if (visible) {
      // 모달이 열릴 때는 현재 날짜로 초기화
      setCurrentMonth(dayjs());
    } else {
      // 모달이 닫힐 때는 선택 초기화
      setRange({ startDate: null, endDate: null });
    }
  }, [visible]);

  const applyFilters = () => {
    if (range.startDate && range.endDate) {
      try {
        onSelectDates(range);
      } catch (error) {
        console.error('Error in onSelectDates:', error);
      }
      closeModal();
    }
  };

  const closeModal = () => {
    try {
      // 콜백 실행 전 약간의 지연
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error('Error in closeModal:', error);
    }
  };

  const resetSelection = () => {
    setRange({ startDate: null, endDate: null });
  };

  const handleDateChange = (date) => {
    if (!range.startDate || (range.startDate && range.endDate)) {
      // 시작 날짜가 없거나, 범위가 이미 완성된 경우 새로운 시작 날짜 설정
      setRange({ startDate: date, endDate: null });
    } else {
      // 시작 날짜만 있는 경우, 끝 날짜 설정 (순서 보장)
      const newEnd = dayjs(date).isBefore(range.startDate) ? range.startDate : date;
      const newStart = dayjs(date).isBefore(range.startDate) ? date : range.startDate;
      setRange({ startDate: newStart, endDate: newEnd });
    }
  };

  const goToPrevMonth = () => {
    // 불변성을 위해 이전 상태 기반으로 업데이트
    setCurrentMonth(prev => dayjs(prev).subtract(1, 'month'));
  };

  const goToNextMonth = () => {
    // 불변성을 위해 이전 상태 기반으로 업데이트
    setCurrentMonth(prev => dayjs(prev).add(1, 'month'));
  };

  return (
    <Modal 
      animationType="slide" 
      transparent 
      visible={visible} 
      onRequestClose={closeModal}
      statusBarTranslucent
      presentationStyle="overFullScreen" 
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={resetSelection}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <View style={styles.row}>
                  <Icon name="reload" size={15} color="gray" />
                  <Text style={styles.resetText}> 재설정</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.title}>날짜 선택</Text>
              <TouchableOpacity 
                onPress={closeModal}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              >
                <Icon name="close" size={22} color="black" />
              </TouchableOpacity>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.monthNav}>
              <Text style={styles.monthTitle}>
                {currentMonth.format('YYYY년 M월')}
              </Text>
              
              <View style={styles.arrowContainer}>
                <TouchableOpacity 
                  onPress={goToPrevMonth}
                  style={styles.arrowButton}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Text style={styles.arrow}>{'<'}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={goToNextMonth}
                  style={styles.arrowButton}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Text style={styles.arrow}>{'>'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Calendar */}
            <CalendarPicker
              customDatesStyles={null}
              monthYearHeaderWrapperStyle={{ display: 'none' }}
              allowRangeSelection
              minDate={new Date()} // 오늘 이전 날짜 선택 불가능
              disabledBeforeToday={true} 
              disabledDatesTextStyle={{ color: '#ccc' }}
              selectedStartDate={range.startDate}
              selectedEndDate={range.endDate}
              onDateChange={handleDateChange}
              previousTitle=""
              nextTitle=""
              todayBackgroundColor="#228be6"
              todayTextStyle={{ color: '#fff' }}
              selectedDayBackgroundColor="black" // 선택된 날짜 배경색 검은색
              selectedDayColor="black"
              selectedDayTextColor="#fff"
              textStyle={{ color: '#000' }}
              weekdays={CUSTOM_LOCALE.weekdays}
              months={CUSTOM_LOCALE.months}
              initialDate={currentMonth.toDate()}
              width={Platform.OS === 'ios' ? 320 : 300} // 명시적 너비 설정
            />

            {/* Apply Button */}
            <TouchableOpacity 
              style={[
                styles.applyButton, 
                (!range.startDate || !range.endDate) && styles.disabledButton
              ]} 
              onPress={applyFilters}
              disabled={!range.startDate || !range.endDate}
              activeOpacity={0.7} // 피드백을 위한 투명도 설정
            >
              <Text style={styles.applyButtonText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 25,
    maxHeight: '90%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  resetText: {
    color: '#999',
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: 'black',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});