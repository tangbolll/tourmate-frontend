import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TextInput, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon2 from 'react-native-vector-icons/MaterialIcons';


const FilterPopup = ({ visible, onClose = () => {}, onApply, onReset, filters, setFilters, onOpenCalendar }) => {
    const { travelPeriod, travelLocation } = filters;
    
    const locationInputRef = useRef(null);


    const setTravelPeriod = (value) => setFilters({ ...filters, travelPeriod: value });
    const setTravelLocation = (value) => setFilters({ ...filters, travelLocation: value });

    const applyFilters = () => {
        if (onApply) onApply(filters);
        onClose();
    };
    
    // 필터 초기화 로직
    const handleReset = () => {
        if (onReset) onReset();
        onClose();
    };

    const openCalendar = () => {
        console.log('Opening calendar...'); // 디버깅용
        if (onOpenCalendar) {
            onOpenCalendar();
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={handleClose}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <Icon name="close" size={22} color="black" />
                    </TouchableOpacity>

                    {/* Header (이제 제목만 포함) */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>필터</Text>
                    
                    </View>

                {/* Travel Period */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>여행기간</Text>
                    <View style={styles.inputContainer}>
                        <TouchableOpacity
                            onPress={openCalendar}
                            activeOpacity={0.7}
                            style={styles.inputContentContainer}
                        >
                            <Icon name="calendar-check" size={18} color="black" style={styles.inputIcon} />
                            <Text style={[styles.input, !travelPeriod && styles.placeholder]}>
                                {travelPeriod || "여행기간을 선택해주세요."}
                            </Text>
                        </TouchableOpacity>
                        {travelPeriod ? (
                            <TouchableOpacity
                                onPress={() => setTravelPeriod('')}
                                style={styles.clearButton}
                            >
                                <Icon name="close-circle" size={20} color="#777" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>

                {/* Location */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>여행장소</Text>
                    {/* View를 Pressable로 바꾸고, onPress를 추가합니다. */}
                    <Pressable 
                        style={styles.inputContainer}
                        onPress={() => locationInputRef.current?.focus()} // 👈 이 줄 추가
                    >
                        <Icon2 name="location-on" size={18} color="black" style={styles.inputIcon} />
                        <TextInput
                            ref={locationInputRef} // 👈 이 줄 추가
                            style={styles.input}
                            placeholder="여행장소를 입력해주세요."
                            placeholderTextColor="#777"
                            value={travelLocation}
                            onChangeText={setTravelLocation}
                        />
                    </Pressable>
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
                </KeyboardAvoidingView>
            </Modal>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
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
    closeButton: {
        position: 'absolute', 
        top: 20,              
        right: 20,           
        zIndex: 1,            
    },
    resetButton: { // 재설정 버튼 스타일 추가
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // 제목 중앙 정렬을 위해 수정
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerButton: {
        width: 60, 
        paddingVertical: 5,
        alignItems: 'center',
    },
    resetButtonText: { // '재설정' 버튼 텍스트 스타일 추가
        fontSize: 16,
        color: '#666',
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
        borderWidth: 1,
        borderColor: '#adb5bd',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 45,
    },
    inputContentContainer: { // 새로운 스타일 추가
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
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
    clearButton: { // X 버튼 스타일 추가
        padding: 5,
        marginLeft: 10,
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
