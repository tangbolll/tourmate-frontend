import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SelectPostDesignHeader = ({
    mode = 'select', // 'select' | 'edit'
    onBack,
    customTitle,
    showBackButton = true,
    }) => {
    // mode에 따른 기본 타이틀 설정
    const getTitle = () => {
        if (customTitle) return customTitle;
        return mode === 'edit' ? '엽서 변경' : '엽서 선택';
    };

    return (
        <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
            {/* 뒤로가기 버튼 */}
            {showBackButton && (
            <TouchableOpacity
                style={styles.backButton}
                onPress={onBack}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Icon name="arrow-back-ios" size={20} color="#000" />
            </TouchableOpacity>
            )}

            {/* 타이틀 */}
            <View style={styles.titleContainer}>
            <Text style={styles.title}>
                {getTitle()}
            </Text>
            </View>

            {/* 오른쪽 여백 (균형을 위해) */}
            <View style={styles.rightSpace} />
        </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        height: 56,
    },
    backButton: {
        padding: 4,
        width: 40,
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    rightSpace: {
        width: 40,
    },
});

export default SelectPostDesignHeader;