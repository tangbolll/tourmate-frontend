import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Categories = ({ category, tags }) => {
    return (
        <View style={styles.container}>
            {/* 카테고리 제목 */}
            <Text style={styles.title}>카테고리</Text>

            {/* 유형 */}
            <View style={styles.row}>
                <Text style={styles.label}>유형</Text>
                <View style={styles.chipContainer}>
                    {category.map((type, index) => (
                        <View key={index} style={styles.chip}>
                            <Text style={styles.chipText}>{type}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* 태그 */}
            <View style={styles.tagSection}>
                <View style={styles.row}>
                    <Text style={styles.label}>태그</Text>    
                    <View style={styles.chipContainer}>
                        {tags.map((tag, index) => (
                            <View key={index} style={styles.chip}>
                                <Text style={styles.chipText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    tagSection: {
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 6,
        marginLeft: 8,
        width: 40,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        paddingLeft: 0,
    },
    chip: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 16, // 최소 높이 설정으로 일관성 유지
    },
    chipText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        textAlignVertical: 'center', // Android에서 세로 중앙 정렬
        includeFontPadding: false, // Android에서 폰트 패딩 제거
        lineHeight: 16, // lineHeight를 fontSize보다 약간 크게 설정
    },
});

export default Categories;