import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ScheduleCategorySelector = ({ categories, selectedCategory, onSelectCategory }) => {
    const renderCategoryButton = (categoryItem) => (
        <TouchableOpacity
            key={categoryItem.key}
            style={commonStyles.categoryButton}
            onPress={() => onSelectCategory(categoryItem.key)}
        >
            <View style={[
                commonStyles.radioButton,
                selectedCategory === categoryItem.key && {
                    backgroundColor: categoryItem.color,
                    borderColor: categoryItem.color
                }
            ]}>
                {selectedCategory === categoryItem.key && (
                    <View style={commonStyles.radioInner} />
                )}
            </View>
            <Text style={[
                commonStyles.categoryText,
                selectedCategory === categoryItem.key && commonStyles.categoryTextActive
            ]}>
                {categoryItem.label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={commonStyles.section}>
            <View style={commonStyles.categoryContainer}>
                {categories.map(renderCategoryButton)}
            </View>
        </View>
    );
};

const commonStyles = StyleSheet.create({
    section: {
        marginBottom: 16,
        position: 'relative',
    },
    categoryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    categoryButton: {
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        minWidth: 60,
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    categoryText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    categoryTextActive: {
        color: '#333',
        fontWeight: '600',
    },
});

export default ScheduleCategorySelector;