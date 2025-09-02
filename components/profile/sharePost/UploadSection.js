import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import SaveButton from "../SaveButton";

const UploadSection = ({ onUpload, isEnabled }) => {
    return (
        <View style={styles.uploadSection}>
            <Text style={styles.uploadNotice}>
                업로드 클릭 시 내 엽서가 다른 유저의 홈화면에 표시됩니다.
            </Text>
            <SaveButton
                title="업로드"
                onPress={onUpload}
                disabled={!isEnabled}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    uploadSection: {
        padding: 16,
        paddingBottom: 0,
    },
    uploadNotice: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 12,
    },
});

export default UploadSection;