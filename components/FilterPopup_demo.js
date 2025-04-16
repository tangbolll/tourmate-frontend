import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icon2 from "react-native-vector-icons/MaterialIcons";


const selectedGender = filters.gender;
const setSelectedGender = (value) => setFilters({ ...filters, gender: value });

const selectedAge = filters.age;
const setSelectedAge = (value) => setFilters({ ...filters, age: value });

const selectedCategories = filters.categories;


const categories = [
  '투어', '식사', '야경', '사진', '쇼핑',
  '숙소', '교통', '테마파크', '액티비티', '힐링',
  '역사유적', '박물관/미술관'
  ];
const FilterPopup = ({ visible, onClose, onApply, filters, setFilters }) => {
    const { gender, age, categories, travelPeriod, travelLocation } = filters;
  
    const selectedGender = gender;
    const selectedAge = age;
    const selectedCategories = categories;
  
    const setSelectedGender = (value) => setFilters({ ...filters, gender: value });
    const setSelectedAge = (value) => setFilters({ ...filters, age: value });
    
const toggleCategory = (category) => {
      const newCategories = categories.includes(category)
          ? categories.filter(item => item !== category)
          : [...categories, category];
    
      setFilters({ ...filters, categories: newCategories });
      };
    
const applyFilters = () => {
        onApply && onApply(filters);
        onClose();
      };


const setTravelPeriod = (value) => setFilters({ ...filters, travelPeriod: value });
const setTravelLocation = (value) => setFilters({ ...filters, travelLocation: value });
const handleRemoveTag = (tagToRemove) => {
  setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
  setFilters((prevFilters) => ({
    ...prevFilters,
    categories: prevFilters.categories.filter((c) => c !== tagToRemove)
  }));
};

      

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>필터</Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={18} color="black" />
              </TouchableOpacity>
            </View>

            {/* 동행기간 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>동행기간</Text>
              <View style={styles.inputContainer}>
                <Icon name="calendar-check" size={18} color="black" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="여행기간을 선택해주세요."
                  value={travelPeriod}
                  onChangeText={setTravelPeriod}
                />
              </View>
            </View>

            {/* 동행장소 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>동행장소</Text>
              <View style={styles.inputContainer}>
                <Icon2 name="location-on" size={18} color="black" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="동행장소를 입력해주세요."
                  value={travelLocation}
                  onChangeText={setTravelLocation}
                />
              </View>
            </View>

            {/* 동행 조건 - 성별 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>동행 조건</Text>
              <View style={styles.row}>
              <Text style={styles.subTitle}>성별</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedGender === '여자만' && styles.selectedOption
                  ]}
                  onPress={() => setSelectedGender('여자만')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedGender === '여자만' && styles.selectedOptionText
                  ]}>여자만</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedGender === '남자만' && styles.selectedOption
                  ]}
                  onPress={() => setSelectedGender('남자만')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedGender === '남자만' && styles.selectedOptionText
                  ]}>남자만</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedGender === '남녀무관' && styles.selectedOption
                  ]}
                  onPress={() => setSelectedGender('남녀무관')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedGender === '남녀무관' && styles.selectedOptionText
                  ]}>남녀무관</Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>

            {/* 동행 조건 - 연령 */}
            <View style={styles.sectionContainer}>
            <View style={styles.row}>
              <Text style={styles.subTitle}>연령</Text>
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedAge === '20대' && styles.selectedOption
                  ]}
                  onPress={() => setSelectedAge('20대')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedAge === '20대' && styles.selectedOptionText
                  ]}>20대</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedAge === '30대' && styles.selectedOption
                  ]}
                  onPress={() => setSelectedAge('30대')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedAge === '30대' && styles.selectedOptionText
                  ]}>30대</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedAge === '40대' && styles.selectedOption
                  ]}
                  onPress={() => setSelectedAge('40대')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedAge === '40대' && styles.selectedOptionText
                  ]}>40대</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.option, 
                    selectedAge === '50대 이상' && styles.selectedOption
                  ]}
                  onPress={() => setSelectedAge('50대 이상')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedAge === '50대 이상' && styles.selectedOptionText
                  ]}>50대 이상</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedAge === '누구나' && styles.selectedOption
                  ]}
                  onPress={() => setSelectedAge('누구나')}
                >
                  <Text style={[
                    styles.optionText,
                    selectedAge === '누구나' && styles.selectedOptionText
                  ]}>누구나</Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>

            {/* 카테고리 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>카테고리</Text>
              <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      selectedCategories.includes(category) && styles.selectedOption
                    ]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedCategories.includes(category) && styles.selectedOptionText
                    ]}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 적용 버튼 */}
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  centeredView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: 'white',
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
    textAlign: 'center',
    flex: 1,
  },
  sectionContainer: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subTitle: {
    marginLeft: 6,
    fontSize: 14,
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#adb5bd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    padding: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 0,
    marginLeft: 12,
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
    backgroundColor: '#e9ecef',
    marginRight: 8,
    marginBottom: 8,
  },
  applyButton: {
    backgroundColor: 'black',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: -10,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FilterPopup;