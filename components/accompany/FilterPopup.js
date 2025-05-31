import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import CalendarPopup from './CalendarPopup';
import dayjs from 'dayjs';

const FilterPopup = ({ visible, onClose = () => {}, onApply, filters, setFilters, onOpenCalendar }) => {
  const { gender, age, categories, travelPeriod, travelLocation } = filters;

  const [calendarVisible, setCalendarVisible] = useState(false);

  const toggleCategory = (category) => {
    const newCategories = categories.includes(category)
      ? categories.filter((c) => c !== category)
      : [...categories, category];
    setFilters({ ...filters, categories: newCategories });
  };

  const toggleGender = (value) => {
    setFilters({ ...filters, gender: gender === value ? '' : value });
  };

  const toggleAge = (value) => {
    setFilters({ ...filters, age: age === value ? '' : value });
  };

  const setTravelPeriod = (value) => setFilters({ ...filters, travelPeriod: value });
  const setTravelLocation = (value) => setFilters({ ...filters, travelLocation: value });

  const applyFilters = () => {
    if (onApply) onApply(filters);
    onClose();
  };

  const openCalendar = () => {
  console.log("캘린더 여는 중 ✅");
  setCalendarVisible(true);
};

  const closeCalendar = () => {
    console.log("Closing calendar");
    setCalendarVisible(false);
  };

  const categoryList = [
    '투어', '식사', '야경', '사진', '쇼핑',
    '숙소', '교통', '테마파크', '액티비티', '힐링',
    '역사유적', '박물관/미술관'
  ];


  const handleCalendarSelect = ({ startDate, endDate }) => {
    if (startDate && endDate) {
      const formatted = `${dayjs(startDate).format('YYYY.MM.DD')} ~ ${dayjs(endDate).format('YYYY.MM.DD')}`;
      setFilters({ ...filters, travelPeriod: formatted });
    }
    closeCalendar();
  };


  return (
    <>
       <Modal
        animationType="slide"
        transparent
        visible={visible}
        onRequestClose={onClose}
        onDismiss={() => {
          // 모달이 닫힐 때 캘린더도 강제 닫기
          closeCalendar();
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>필터</Text>
                <TouchableOpacity 
                  onPress={onClose}
                  hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                >
                  <Icon name="close" size={18} color="black" />
                </TouchableOpacity>
              </View>

              {/* Travel Period */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>동행기간</Text>
                {/* 여기서 전체 영역을 TouchableOpacity로 변경 */}
                <TouchableOpacity 
  onPress={onOpenCalendar} 
  activeOpacity={0.7}
  style={styles.inputContainer}
>
  <Icon name="calendar-check" size={18} color="black" style={styles.inputIcon} />
  <Text style={[styles.input, !travelPeriod && styles.placeholder]}>
    {travelPeriod || "여행기간을 선택해주세요."}
  </Text>
</TouchableOpacity>
              </View>

              {/* Location */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>동행장소</Text>
                <View style={styles.inputContainer}>
                  <Icon2 name="location-on" size={18} color="black" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="동행장소를 입력해주세요."
                    placeholderTextColor="#777"
                    value={travelLocation}
                    onChangeText={setTravelLocation}
                  />
                </View>
              </View>

              {/* Gender */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>성별</Text>
                <View style={styles.optionsRow}>
                  {['여자만', '남자만', '남녀무관'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.option, gender === item && styles.selectedOption]}
                      onPress={() => toggleGender(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, gender === item && styles.selectedOptionText]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Age */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>연령</Text>
                <View style={styles.optionsRow}>
                  {['20대', '30대', '40대', '50대 이상', '누구나'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.option, age === item && styles.selectedOption]}
                      onPress={() => toggleAge(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, age === item && styles.selectedOptionText]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Categories */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>카테고리</Text>
                <View style={styles.categoriesContainer}>
                  {categoryList.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[styles.categoryOption, categories.includes(category) && styles.selectedOption]}
                      onPress={() => toggleCategory(category)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.optionText, categories.includes(category) && styles.selectedOptionText]}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={applyFilters}
                activeOpacity={0.7}
              >
                <Text style={styles.applyButtonText}>적용하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 캘린더 팝업 */}
      <CalendarPopup
        visible={calendarVisible}
        onClose={closeCalendar}
        onSelectDates={handleCalendarSelect}
      />
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#adb5bd',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 14,
  },
  placeholder: {
    color: '#777',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#adb5bd',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: 'black',
    borderColor: 'black',
  },
  optionText: {
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#adb5bd',
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
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

export default FilterPopup;