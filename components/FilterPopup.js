import React from 'react';
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  StyleSheet, TouchableWithoutFeedback, Keyboard
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icon2 from "react-native-vector-icons/MaterialIcons";

export default function FilterPopup({ visible, onClose, onApply, filters, setFilters }) {
  const { gender, age, categories, travelPeriod, travelLocation } = filters;

  const setField = (field, value) => setFilters(prev => ({ ...prev, [field]: value }));

  const toggleCategory = (category) => {
    const updated = categories.includes(category)
      ? categories.filter(c => c !== category)
      : [...categories, category];
    setField('categories', updated);
  };

  const applyFilters = () => {
    onApply(filters);
  };

  const categoryList = [
    '투어', '식사', '야경', '사진', '쇼핑',
    '숙소', '교통', '테마파크', '액티비티', '힐링',
    '역사유적', '박물관/미술관'
  ];

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
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

            {/* 여행 기간 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>동행기간</Text>
              <View style={styles.inputContainer}>
                <Icon name="calendar-check" size={18} color="black" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="여행기간을 선택해주세요."
                  value={travelPeriod}
                  onChangeText={text => setField('travelPeriod', text)}
                />
              </View>
            </View>

            {/* 여행 장소 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>동행장소</Text>
              <View style={styles.inputContainer}>
                <Icon2 name="location-on" size={18} color="black" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="동행장소를 입력해주세요."
                  value={travelLocation}
                  onChangeText={text => setField('travelLocation', text)}
                />
              </View>
            </View>

            {/* 성별 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>동행 조건</Text>
              <Text style={styles.subTitle}>성별</Text>
              <View style={styles.optionsRow}>
                {['여자만', '남자만', '남녀무관'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.option, gender === option && styles.selectedOption]}
                    onPress={() => setField('gender', option)}
                  >
                    <Text style={[styles.optionText, gender === option && styles.selectedOptionText]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 연령 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.subTitle}>연령</Text>
              <View style={styles.optionsRow}>
                {['20대', '30대', '40대', '50대 이상', '누구나'].map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.option, age === option && styles.selectedOption]}
                    onPress={() => setField('age', option)}
                  >
                    <Text style={[styles.optionText, age === option && styles.selectedOptionText]}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 카테고리 */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>카테고리</Text>
              <View style={styles.categoriesContainer}>
                {categoryList.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryOption, categories.includes(category) && styles.selectedOption]}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={[styles.optionText, categories.includes(category) && styles.selectedOptionText]}>{category}</Text>
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
}

const styles = StyleSheet.create({
  centeredView: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalView: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  sectionContainer: { marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  subTitle: { fontSize: 14, marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#adb5bd', borderRadius: 8, paddingHorizontal: 12 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 40 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 4 },
  option: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#adb5bd', marginRight: 8, marginBottom: 8 },
  selectedOption: { backgroundColor: 'black', borderColor: 'black' },
  optionText: { color: '#333' },
  selectedOptionText: { color: 'white' },
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryOption: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#adb5bd', borderRadius: 20, backgroundColor: '#e9ecef', marginRight: 8, marginBottom: 8 },
  applyButton: { backgroundColor: 'black', borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 10 },
  applyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
