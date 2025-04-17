import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import Calendar from 'react-native-calendar-range-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import dayjs from 'dayjs';

const CUSTOM_LOCALE = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월',
  ],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
  year: '년',
};

export default function CalendarPopup({ visible, onClose, onSelectDates }) {
  const [range, setRange] = useState({ startDate: null, endDate: null });

  const applyFilters = () => {
    if (range.startDate && range.endDate) {
      onSelectDates(range);
      onClose();
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>날짜 선택</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={22} color="black" />
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <ScrollView>
            <Calendar
              locale={CUSTOM_LOCALE}
              disabledBeforeToday
              futureYearRange={12}
              pastYearRange={0}
              numberOfMonths={1}
              style={{
                dayTextColor: '#000',
                holidayColor: '#999',
                todayColor: '#0c8599',
                disabledTextColor: '#ccc',
                selectedDayTextColor: '#fff',
                selectedDayBackgroundColor: '#000',
                selectedBetweenDayTextColor: '#000',
                selectedBetweenDayBackgroundTextColor: '#eee',
              }}
              onChange={({ startDate, endDate }) => {
                setRange({ startDate, endDate });
              }}
              startDate={range.startDate}
              endDate={range.endDate}
            />
            </ScrollView>

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
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
