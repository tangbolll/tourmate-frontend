import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
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
  const [range, setRange] = useState({ startDate: null, endDate: null });
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [isYearMonthOpen, setIsYearMonthOpen] = useState(false);

  const applyFilters = () => {
    if (range.startDate && range.endDate) {
      // onSelectDates가 함수인지 확인 후 호출
      if (typeof onSelectDates === 'function') {
        onSelectDates(range);
      } else {
        console.warn('onSelectDates is not a function');
      }
      onClose();
    }
  };

  const CloseModal = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      console.warn('onClose is not a function');
    }
  };

  const resetSelection = () => {
    setRange({ startDate: null, endDate: null });
  };

  const handleDateChange = (date) => {
    if (!range.startDate || (range.startDate && range.endDate)) {
      setRange({ startDate: date, endDate: null });
    } else {
      const newEnd = dayjs(date).isBefore(range.startDate) ? range.startDate : date;
      const newStart = dayjs(date).isBefore(range.startDate) ? date : range.startDate;
      setRange({ startDate: newStart, endDate: newEnd });
    }
  };


  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={resetSelection}>
                <View style={styles.row}>
                  <Icon name="reload" size={15} marginBottom={10} color="gray" />
                  <Text style={styles.resetText}> 재설정</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.title}>날짜 선택</Text>
              <TouchableOpacity onPress={CloseModal}>
                <Icon name="close" size={22} color="black" />
              </TouchableOpacity>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.monthNav}>
            <Text style={styles.monthTitle}>
                {currentMonth.format('YYYY년 M월')}
              </Text>
              
              <TouchableOpacity onPress={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}>
                <Text style={styles.arrow}>{'                                 <'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCurrentMonth(currentMonth.add(1, 'month'))}>
                <Text style={styles.arrow}>{'          >'}</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <CalendarPicker
            customDatesStyles={() => {}}
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
            
          />

            {/* Apply Button */}
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resetText: {
    color: '#999',
    fontSize: 14,
    marginBottom: 10,
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
  toggleBtn: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  toggleText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  monthNav: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'semi-bold',
  },
  applyButton: {
    backgroundColor: 'black',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

});
